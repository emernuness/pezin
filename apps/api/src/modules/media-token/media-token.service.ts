import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '@/prisma/prisma.service';
import * as crypto from 'crypto';

export interface MediaTokenPayload {
  sub: string; // userId
  res: string; // resourceId (fileId, 'avatar', 'cover')
  typ: 'file' | 'preview' | 'avatar' | 'cover';
  pid?: string; // packId (for pack files)
  fn?: string; // filename (for Content-Disposition)
  ct?: string; // contentType
  exp: number; // expiration timestamp
  iat: number; // issued at
}

@Injectable()
export class MediaTokenService {
  private readonly logger = new Logger(MediaTokenService.name);
  private readonly secret: string;
  private readonly expiresIn: number;
  private readonly cdnUrl: string;

  constructor(
    private config: ConfigService,
    private prisma: PrismaService
  ) {
    this.secret = this.config.get<string>('MEDIA_TOKEN_SECRET') || '';
    this.expiresIn =
      parseInt(this.config.get<string>('MEDIA_TOKEN_EXPIRES_IN') || '3600', 10);
    this.cdnUrl =
      this.config.get<string>('CDN_WORKER_URL') || 'http://localhost:8787';

    if (!this.secret) {
      this.logger.warn(
        'MEDIA_TOKEN_SECRET not configured - media tokens will not work'
      );
    }
  }

  /**
   * Generate a signed media access token
   */
  generateToken(
    userId: string,
    resourceId: string,
    type: 'file' | 'preview' | 'avatar' | 'cover',
    packId?: string,
    filename?: string,
    contentType?: string
  ): string {
    const now = Math.floor(Date.now() / 1000);

    const payload: MediaTokenPayload = {
      sub: userId,
      res: resourceId,
      typ: type,
      exp: now + this.expiresIn,
      iat: now,
    };

    if (packId) payload.pid = packId;
    if (filename) payload.fn = filename;
    if (contentType) payload.ct = contentType;

    // Encode payload as base64url
    const payloadStr = Buffer.from(JSON.stringify(payload)).toString(
      'base64url'
    );

    // Create signature
    const signature = this.sign(payloadStr);

    // Return token as payload.signature
    return `${payloadStr}.${signature}`;
  }

  /**
   * Generate full media URL with token
   */
  generateMediaUrl(
    userId: string,
    resourceId: string,
    type: 'file' | 'preview' | 'avatar' | 'cover',
    packId?: string,
    filename?: string,
    contentType?: string
  ): string {
    const token = this.generateToken(
      userId,
      resourceId,
      type,
      packId,
      filename,
      contentType
    );
    return `${this.cdnUrl}/media/${token}`;
  }

  /**
   * Verify and decode a token
   */
  verifyToken(token: string): MediaTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new UnauthorizedException('Invalid token format');
    }

    const [payloadStr, signature] = parts;

    // Verify signature
    const expectedSignature = this.sign(payloadStr);
    if (!this.timingSafeEqual(signature, expectedSignature)) {
      throw new UnauthorizedException('Invalid token signature');
    }

    // Decode payload
    let payload: MediaTokenPayload;
    try {
      payload = JSON.parse(Buffer.from(payloadStr, 'base64url').toString());
    } catch {
      throw new UnauthorizedException('Invalid token payload');
    }

    // Check expiration
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) {
      throw new UnauthorizedException('Token expired');
    }

    return payload;
  }

  /**
   * Resolve the actual R2 storage path from a token payload
   */
  async resolveResourcePath(
    payload: MediaTokenPayload
  ): Promise<{ path: string; contentType: string; filename?: string }> {
    const { sub: userId, res: resourceId, typ: type, pid: packId } = payload;

    if (type === 'avatar' || type === 'cover') {
      // Profile images - look up in user record
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { profileImage: true, coverImage: true },
      });

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      const imageUrl = type === 'avatar' ? user.profileImage : user.coverImage;
      if (!imageUrl) {
        throw new UnauthorizedException('Image not found');
      }

      // Extract storage key from URL if it contains CDN prefix
      const cdnUrl = this.config.get<string>('R2_PUBLIC_URL');
      let path = imageUrl;
      if (cdnUrl && imageUrl.startsWith(cdnUrl)) {
        path = imageUrl.replace(`${cdnUrl}/`, '');
      }

      return {
        path,
        contentType: payload.ct || 'image/webp',
        filename: payload.fn,
      };
    }

    if (type === 'preview') {
      // Pack preview
      const preview = await this.prisma.packPreview.findUnique({
        where: { id: resourceId },
      });

      if (!preview || (packId && preview.packId !== packId)) {
        throw new UnauthorizedException('Preview not found');
      }

      // url field contains the storage key
      return {
        path: preview.url,
        contentType: payload.ct || 'image/webp',
        filename: payload.fn,
      };
    }

    // Pack file
    const file = await this.prisma.packFile.findUnique({
      where: { id: resourceId },
    });

    if (!file || (packId && file.packId !== packId)) {
      throw new UnauthorizedException('File not found');
    }

    return {
      path: file.storageKey,
      contentType: file.mimeType,
      filename: file.filename,
    };
  }

  /**
   * Create HMAC signature
   */
  private sign(data: string): string {
    return crypto
      .createHmac('sha256', this.secret)
      .update(data)
      .digest('base64url');
  }

  /**
   * Timing-safe string comparison
   */
  private timingSafeEqual(a: string, b: string): boolean {
    if (a.length !== b.length) {
      return false;
    }
    const bufA = Buffer.from(a);
    const bufB = Buffer.from(b);
    return crypto.timingSafeEqual(bufA, bufB);
  }
}
