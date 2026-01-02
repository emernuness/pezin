import { Controller, Post, Body, UseGuards, Logger } from '@nestjs/common';
import { MediaTokenService } from './media-token.service';
import { InternalApiGuard } from '@/common/guards/internal-api.guard';
import { ResolvePathDto, ResolvePathResponseDto } from './dto/resolve-path.dto';

@Controller('internal/media')
export class MediaTokenController {
  private readonly logger = new Logger(MediaTokenController.name);

  constructor(private readonly mediaTokenService: MediaTokenService) {}

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
}
