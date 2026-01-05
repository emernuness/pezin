import {
  Controller,
  Post,
  Get,
  Patch,
  Delete,
  Body,
  Param,
  UseGuards,
  Req,
} from '@nestjs/common';
import { Request } from 'express';
import { PacksService } from './packs.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { ZodValidationPipe } from '@/common/pipes/zod-validation.pipe';
import {
  uploadUrlSchema,
  confirmUploadSchema,
  UploadUrlInput,
  ConfirmUploadInput,
  createPackSchema,
  updatePackSchema,
  CreatePackInput,
  UpdatePackInput,
} from '@pack-do-pezin/shared';

@Controller('packs')
@UseGuards(JwtAuthGuard)
export class PacksController {
  constructor(private packsService: PacksService) {}

  @Get()
  async listPacks(@CurrentUser() user: any) {
    return this.packsService.listPacks(user.id);
  }

  @Post()
  async createPack(
    @Body(new ZodValidationPipe(createPackSchema)) body: CreatePackInput,
    @CurrentUser() user: any
  ) {
    return this.packsService.createPack(
      user.id,
      body.title,
      body.description,
      body.price
    );
  }

  @Get(':id')
  async getPack(@Param('id') id: string, @CurrentUser() user: any) {
    return this.packsService.getPackById(id, user.id);
  }

  @Patch(':id')
  async updatePack(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(updatePackSchema)) body: UpdatePackInput,
    @CurrentUser() user: any
  ) {
    return this.packsService.updatePack(id, user.id, body);
  }

  @Post(':id/publish')
  async publishPack(@Param('id') id: string, @CurrentUser() user: any) {
    return this.packsService.publishPack(id, user.id);
  }

  @Post(':id/unpublish')
  async unpublishPack(@Param('id') id: string, @CurrentUser() user: any) {
    return this.packsService.unpublishPack(id, user.id);
  }

  @Delete(':id')
  async deletePack(@Param('id') id: string, @CurrentUser() user: any) {
    return this.packsService.deletePack(id, user.id);
  }

  @Post(':id/upload-url')
  async getUploadUrl(
    @Param('id') packId: string,
    @Body(new ZodValidationPipe(uploadUrlSchema)) body: UploadUrlInput,
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
    @Body(new ZodValidationPipe(confirmUploadSchema)) body: ConfirmUploadInput,
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

  @Delete(':packId/files/:fileId')
  async deleteFile(
    @Param('packId') packId: string,
    @Param('fileId') fileId: string,
    @CurrentUser() user: any
  ) {
    return this.packsService.deleteFile(packId, fileId, user.id);
  }

  @Delete(':packId/previews/:previewId')
  async deletePreview(
    @Param('packId') packId: string,
    @Param('previewId') previewId: string,
    @CurrentUser() user: any
  ) {
    return this.packsService.deletePreview(packId, previewId, user.id);
  }

  @Patch(':packId/files/:fileId/toggle-preview')
  async toggleFileAsPreview(
    @Param('packId') packId: string,
    @Param('fileId') fileId: string,
    @Body('isPreview') isPreview: boolean,
    @CurrentUser() user: any
  ) {
    return this.packsService.toggleFileAsPreview(packId, fileId, user.id, isPreview);
  }
}
