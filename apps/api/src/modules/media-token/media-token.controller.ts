import { Controller, Post, Get, Body, Param, Res, UseGuards, Logger } from '@nestjs/common';
import { Response } from 'express';
import { ConfigService } from '@nestjs/config';
import { MediaTokenService } from './media-token.service';
import { InternalApiGuard } from '@/common/guards/internal-api.guard';
import { ResolvePathDto, ResolvePathResponseDto } from './dto/resolve-path.dto';

@Controller('internal/media')
export class MediaTokenController {
  private readonly logger = new Logger(MediaTokenController.name);
  private readonly isDevelopment: boolean;

  constructor(
    private readonly mediaTokenService: MediaTokenService,
    private readonly config: ConfigService,
  ) {
    this.isDevelopment = this.config.get<string>('NODE_ENV') !== 'production';
  }

  /**
   * Internal endpoint for Cloudflare Worker to resolve media paths.
   * Protected by InternalApiGuard - requires X-Internal-API-Key header.
   */
  @Post('resolve-path')
  @UseGuards(InternalApiGuard)
  async resolvePath(@Body() dto: ResolvePathDto): Promise<ResolvePathResponseDto> {
    this.logger.debug('Resolving media path from token');

    const payload = this.mediaTokenService.verifyToken(dto.token);
    const result = await this.mediaTokenService.resolveResourcePath(payload);

    return result;
  }

  /**
   * Development-only proxy endpoint to serve media from R2.
   * This bypasses CORS issues by proxying requests through the API.
   * In production, use Cloudflare Worker with proper CORS configuration.
   */
  @Get('proxy/:token')
  async proxyMedia(@Param('token') token: string, @Res() res: Response) {
    if (!this.isDevelopment) {
      res.status(403).json({ error: 'Proxy only available in development' });
      return;
    }

    try {
      const payload = this.mediaTokenService.verifyToken(token);
      const { storagePath, contentType } = await this.mediaTokenService.resolveResourcePath(payload);

      // Fetch from R2 and stream to response
      const buffer = await this.mediaTokenService.fetchFromStorage(storagePath);

      res.setHeader('Content-Type', contentType || 'application/octet-stream');
      res.setHeader('Cache-Control', 'public, max-age=3600');
      res.setHeader('Access-Control-Allow-Origin', '*');
      res.send(buffer);
    } catch (error) {
      this.logger.error('Proxy error:', error);
      res.status(404).json({ error: 'Media not found' });
    }
  }
}
