import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { randomBytes, createHash } from 'crypto';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MediaService } from '../media/media.service';
import {
  SignUpInput,
  LoginInput,
  AuthResponse,
  AuthTokens,
  UpdateProfileInput,
  ChangePasswordInput,
  UpdateCreatorProfileInput,
  UpdatePixKeyInput,
  User,
  UserAddress,
  PixKeyType,
} from '@pack-do-pezin/shared';

// Allowed image types for profile
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService,
    private storage: StorageService,
    private media: MediaService
  ) {}

  async signUp(dto: SignUpInput): Promise<{ message: string }> {
    // Check if user exists
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (existingUser) {
      throw new ConflictException('Email já cadastrado');
    }

    // Hash password
    const passwordHash = await bcrypt.hash(dto.password, 12);

    // Generate verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    // Create user
    await this.prisma.user.create({
      data: {
        email: dto.email,
        passwordHash,
        birthDate: new Date(dto.birthDate),
        userType: dto.userType,
        verificationToken,
        verificationTokenExpires,
        emailVerified: false, // In production, send email with verification link
      },
    });

    this.logger.log(`New user registered: ${dto.email}`);

    // TODO: Send verification email in production
    // For now, we'll auto-verify in development
    if (process.env.NODE_ENV === 'development') {
      this.logger.warn(`Auto-verifying user in development: ${dto.email}`);
    }

    return {
      message:
        'Cadastro realizado! Verifique seu email para ativar a conta.',
    };
  }

  async login(
    dto: LoginInput
  ): Promise<AuthResponse & { refreshToken: string }> {
    // Find user
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (!user) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(
      dto.password,
      user.passwordHash
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Credenciais inválidas');
    }

    // Check email verification (skip in development)
    if (
      !user.emailVerified &&
      process.env.NODE_ENV !== 'development'
    ) {
      throw new UnauthorizedException(
        'Email não verificado. Verifique sua caixa de entrada.'
      );
    }

    this.logger.log(`User logged in: ${user.email}`);

    // Generate tokens
    const { accessToken, refreshToken } = await this.generateTokens(user.id);

    return {
      user: this.formatUser(user),
      accessToken,
      refreshToken,
    };
  }

  async refresh(oldRefreshToken: string): Promise<AuthTokens> {
    if (!oldRefreshToken) {
      throw new UnauthorizedException('Refresh token não fornecido');
    }

    // Hash the token to compare
    const tokenHash = this.hashToken(oldRefreshToken);

    // Find token in database
    const storedToken = await this.prisma.refreshToken.findUnique({
      where: { tokenHash },
      include: { user: true },
    });

    if (!storedToken) {
      throw new UnauthorizedException('Refresh token inválido');
    }

    // Check if token is expired
    if (storedToken.expiresAt < new Date()) {
      await this.revokeRefreshToken(tokenHash);
      throw new UnauthorizedException('Refresh token expirado');
    }

    // Check if token is revoked
    if (storedToken.revokedAt) {
      throw new UnauthorizedException('Refresh token revogado');
    }

    this.logger.log(`Refreshing tokens for user: ${storedToken.user.email}`);

    // Revoke old token (rotation)
    await this.revokeRefreshToken(tokenHash);

    // Generate new tokens
    const { accessToken, refreshToken } = await this.generateTokens(
      storedToken.userId,
      storedToken.id
    );

    return { accessToken, refreshToken };
  }

  async logout(refreshToken: string): Promise<{ message: string }> {
    if (refreshToken) {
      const tokenHash = this.hashToken(refreshToken);
      await this.revokeRefreshToken(tokenHash);
      this.logger.log('User logged out');
    }

    return { message: 'Logout realizado com sucesso' };
  }

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return { user: this.formatUser(user) };
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findFirst({
      where: {
        verificationToken: token,
        verificationTokenExpires: {
          gt: new Date(),
        },
      },
    });

    if (!user) {
      throw new BadRequestException('Token de verificação inválido ou expirado');
    }

    await this.prisma.user.update({
      where: { id: user.id },
      data: {
        emailVerified: true,
        verificationToken: null,
        verificationTokenExpires: null,
      },
    });

    this.logger.log(`Email verified for user: ${user.email}`);

    return { message: 'Email verificado com sucesso!' };
  }

  private async generateTokens(
    userId: string,
    rotatedFromTokenId?: string
  ): Promise<AuthTokens> {
    // Generate access token (15min)
    const accessToken = this.jwtService.sign(
      { sub: userId },
      {
        secret: this.config.get('JWT_SECRET'),
        expiresIn: this.config.get('JWT_EXPIRES_IN', '15m'),
      }
    );

    // Generate refresh token (7 days)
    const refreshToken = randomBytes(64).toString('hex');
    const tokenHash = this.hashToken(refreshToken);

    const refreshExpiresIn = this.config.get(
      'JWT_REFRESH_EXPIRES_IN',
      '7d'
    );
    const expiresAt = this.parseExpirationTime(refreshExpiresIn);

    // Store refresh token hash
    await this.prisma.refreshToken.create({
      data: {
        tokenHash,
        userId,
        expiresAt,
        rotatedFromTokenId,
      },
    });

    return { accessToken, refreshToken };
  }

  private async revokeRefreshToken(tokenHash: string): Promise<void> {
    await this.prisma.refreshToken.updateMany({
      where: { tokenHash },
      data: { revokedAt: new Date() },
    });
  }

  private hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  private parseExpirationTime(timeString: string): Date {
    const unit = timeString.slice(-1);
    const value = parseInt(timeString.slice(0, -1), 10);

    const now = new Date();
    switch (unit) {
      case 'd':
        return new Date(now.getTime() + value * 24 * 60 * 60 * 1000);
      case 'h':
        return new Date(now.getTime() + value * 60 * 60 * 1000);
      case 'm':
        return new Date(now.getTime() + value * 60 * 1000);
      default:
        throw new Error('Invalid expiration time format');
    }
  }

  async updateProfile(userId: string, dto: UpdateProfileInput) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
      },
    });

    this.logger.log(`Profile updated for user: ${user.email}`);

    return { user: this.formatUser(user) };
  }

  async updateCreatorProfile(userId: string, dto: UpdateCreatorProfileInput) {
    // Check if slug is being changed and if it's already taken
    if (dto.slug) {
      const existingSlug = await this.prisma.user.findFirst({
        where: {
          slug: dto.slug,
          id: { not: userId },
        },
      });

      if (existingSlug) {
        throw new ConflictException('Este slug já está em uso');
      }
    }

    // Check if CPF is being changed and if it's already taken
    if (dto.cpf) {
      const cleanedCpf = dto.cpf.replace(/\D/g, '');
      const existingCpf = await this.prisma.user.findFirst({
        where: {
          cpf: cleanedCpf,
          id: { not: userId },
        },
      });

      if (existingCpf) {
        throw new ConflictException('Este CPF já está cadastrado');
      }
    }

    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        displayName: dto.displayName,
        bio: dto.bio,
        slug: dto.slug,
        fullName: dto.fullName,
        cpf: dto.cpf ? dto.cpf.replace(/\D/g, '') : undefined,
        phone: dto.phone,
        ...(dto.address && {
          addressZipCode: dto.address.zipCode,
          addressStreet: dto.address.street,
          addressNumber: dto.address.number,
          addressComplement: dto.address.complement,
          addressNeighborhood: dto.address.neighborhood,
          addressCity: dto.address.city,
          addressState: dto.address.state,
        }),
      },
    });

    this.logger.log(`Creator profile updated for user: ${user.email}`);

    return { user: this.formatUser(user) };
  }

  private formatUser(user: any): User {
    const address: UserAddress | null =
      user.addressZipCode || user.addressStreet
        ? {
            zipCode: user.addressZipCode,
            street: user.addressStreet,
            number: user.addressNumber,
            complement: user.addressComplement,
            neighborhood: user.addressNeighborhood,
            city: user.addressCity,
            state: user.addressState,
          }
        : null;

    // Generate secure token-based URLs for profile images
    let profileImage = user.profileImage;
    let coverImage = user.coverImage;

    // Only transform if it's a storage key (starts with 'users/')
    if (profileImage && profileImage.startsWith('users/')) {
      profileImage = this.storage.generateMediaUrl(
        user.id,
        'avatar',
        'avatar',
        undefined,
        undefined,
        'image/webp'
      );
    }

    if (coverImage && coverImage.startsWith('users/')) {
      coverImage = this.storage.generateMediaUrl(
        user.id,
        'cover',
        'cover',
        undefined,
        undefined,
        'image/webp'
      );
    }

    return {
      id: user.id,
      email: user.email,
      displayName: user.displayName,
      slug: user.slug,
      bio: user.bio,
      profileImage,
      coverImage,
      birthDate: user.birthDate,
      userType: user.userType,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      fullName: user.fullName,
      cpf: user.cpf,
      phone: user.phone,
      address,
      pixKey: user.pixKey,
      pixKeyType: user.pixKeyType as PixKeyType | null,
    };
  }

  async changePassword(userId: string, dto: ChangePasswordInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash
    );

    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Senha atual incorreta');
    }

    // Hash new password
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 12);

    await this.prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newPasswordHash },
    });

    this.logger.log(`Password changed for user: ${user.email}`);

    return { message: 'Senha alterada com sucesso' };
  }

  // Profile Image Upload Methods
  async getProfileImageUploadUrl(
    userId: string,
    contentType: string,
    imageType: 'profile' | 'cover' = 'profile'
  ) {
    if (!ALLOWED_IMAGE_TYPES.includes(contentType)) {
      throw new BadRequestException(
        'Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.'
      );
    }

    // Get user slug for organized folder structure
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { slug: true },
    });

    const userSlug = user?.slug || 'user';
    const extension = contentType.split('/')[1];
    const timestamp = Date.now();

    // New structure: users/{userId}/{userSlug}/{imageType}/{timestamp}.{extension}
    const storageType = imageType === 'profile' ? 'avatar' : 'cover';
    const key = this.storage.buildStorageKey(
      userId,
      userSlug,
      storageType,
      `${timestamp}.${extension}`
    );

    const uploadUrl = await this.storage.getSignedUploadUrl(key, contentType);

    this.logger.log(`Generated upload URL for ${imageType} image: ${userId}, key: ${key}`);

    return { uploadUrl, key };
  }

  async confirmProfileImageUpload(
    userId: string,
    key: string,
    imageType: 'profile' | 'cover' = 'profile'
  ) {
    // Verify the key belongs to this user (new structure: users/{userId}/{slug}/...)
    if (!key.startsWith(`users/${userId}/`)) {
      throw new BadRequestException('Chave de arquivo inválida');
    }

    // Get content type from key extension
    const extension = key.split('.').pop()?.toLowerCase();
    const mimeTypeMap: Record<string, string> = {
      jpg: 'image/jpeg',
      jpeg: 'image/jpeg',
      png: 'image/png',
      webp: 'image/webp',
    };
    const mimeType = mimeTypeMap[extension || ''] || 'image/jpeg';

    // Convert to WebP if needed
    let finalKey = key;
    if (this.media.shouldConvert(mimeType)) {
      try {
        this.logger.log(`Converting ${imageType} image to WebP: ${key}`);
        const originalBuffer = await this.storage.downloadFile(key);
        const result = await this.media.convert(originalBuffer, mimeType);

        // Generate new key with WebP extension
        finalKey = key.replace(/\.[^.]+$/, `.${result.extension}`);
        await this.storage.uploadFile(finalKey, result.buffer, result.mimeType);

        // Delete original file if key changed
        if (finalKey !== key) {
          await this.storage.deleteFile(key);
          this.logger.log(`Converted and replaced ${imageType} image: ${finalKey}`);
        }
      } catch (error) {
        this.logger.warn(`Failed to convert ${imageType} image, using original`, error);
        finalKey = key;
      }
    }

    // Store the storage key directly - token-based URL will be generated on read
    // This allows us to generate secure URLs via Cloudflare Worker

    // Get old image key to delete later
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { profileImage: true, coverImage: true },
    });

    // Update user with storage key (not full URL)
    const updateData =
      imageType === 'profile'
        ? { profileImage: finalKey }
        : { coverImage: finalKey };

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    // Delete old image if it exists and is stored in R2
    const oldImage =
      imageType === 'profile' ? user?.profileImage : user?.coverImage;
    if (oldImage && oldImage.startsWith('users/')) {
      try {
        await this.storage.deleteFile(oldImage);
        this.logger.log(`Deleted old ${imageType} image: ${oldImage}`);
      } catch (error) {
        this.logger.warn(`Failed to delete old ${imageType} image`, error);
      }
    }

    this.logger.log(`Updated ${imageType} image for user: ${userId}`);

    return { user: this.formatUser(updatedUser) };
  }

  // Email Verification Methods
  async resendVerificationEmail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.emailVerified) {
      throw new BadRequestException('Email já verificado');
    }

    // Generate new verification token
    const verificationToken = randomBytes(32).toString('hex');
    const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        verificationToken,
        verificationTokenExpires,
      },
    });

    // TODO: Send email with verification link
    // For now, log the token (in production, send email)
    const webUrl = this.config.get<string>('WEB_URL');
    const verificationUrl = `${webUrl}/verify-email?token=${verificationToken}`;

    this.logger.log(`Verification email resent for: ${user.email}`);
    // SECURITY: Don't log verification URLs in production to prevent token leakage
    if (process.env.NODE_ENV === 'development') {
      this.logger.debug(`[DEV ONLY] Verification URL: ${verificationUrl}`);
    }

    // In development, return the URL for testing
    if (process.env.NODE_ENV === 'development') {
      return {
        message: 'Email de verificação reenviado!',
        verificationUrl, // Only in development
      };
    }

    return { message: 'Email de verificação reenviado!' };
  }

  // PIX Key Methods
  async updatePixKey(userId: string, dto: UpdatePixKeyInput) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (user.userType !== 'creator') {
      throw new BadRequestException('Apenas criadores podem configurar chave PIX');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        pixKey: dto.pixKey,
        pixKeyType: dto.pixKeyType,
      },
    });

    this.logger.log(`PIX key updated for user: ${user.email}`);

    return { user: this.formatUser(updatedUser) };
  }

  async removePixKey(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new BadRequestException('Usuário não encontrado');
    }

    if (!user.pixKey) {
      throw new BadRequestException('Nenhuma chave PIX configurada');
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: {
        pixKey: null,
        pixKeyType: null,
      },
    });

    this.logger.log(`PIX key removed for user: ${user.email}`);

    return { user: this.formatUser(updatedUser) };
  }
}
