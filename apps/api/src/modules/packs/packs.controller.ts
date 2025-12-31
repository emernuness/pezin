import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PacksService } from './packs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('packs')
@UseGuards(JwtAuthGuard)
export class PacksController {
  constructor(private packsService: PacksService) {}

  @Post(':id/upload-url')
  async getUploadUrl(
    @Param('id') packId: string,
    @Body()
    body: {
      filename: string;
      contentType: string;
      type: 'preview' | 'file';
    },
    @CurrentUser() user: any
  ) {
    return this.packsService.requestUploadUrl(
      packId,
      user.id,
      body.filename,
      body.contentType,
      body.type
    );
  }

  @Post(':id/files')
  async confirmUpload(
    @Param('id') packId: string,
    @Body()
    body: {
      fileId: string;
      key: string;
      filename: string;
      mimeType: string;
      size: number;
      type: 'preview' | 'file';
    },
    @CurrentUser() user: any
  ) {
    return this.packsService.confirmUpload(
      packId,
      user.id,
      body.fileId,
      body.key,
      body.filename,
      body.mimeType,
      body.size,
      body.type
    );
  }

  @Get(':id/files')
  async getPackFiles(@Param('id') packId: string, @CurrentUser() user: any) {
    return this.packsService.getPackFiles(packId, user.id);
  }

  @Post(':packId/files/:fileId/download-url')
  async getDownloadUrl(
    @Param('packId') packId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: any,
    @Req() request: Request
  ) {
    const ipAddress = request.ip || 'unknown';
    const userAgent = request.headers['user-agent'] || 'unknown';

    const url = await this.packsService.requestDownloadUrl(
      packId,
      fileId,
      user.id,
      ipAddress,
      userAgent
    );

    return { url };
  }
}
