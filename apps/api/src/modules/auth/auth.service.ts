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
import {
  SignUpInput,
  LoginInput,
  AuthResponse,
  AuthTokens,
} from '@pack-do-pezin/shared';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private config: ConfigService
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
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        userType: user.userType,
        emailVerified: user.emailVerified,
        stripeConnected: user.stripeConnected,
        createdAt: user.createdAt,
      },
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
}
