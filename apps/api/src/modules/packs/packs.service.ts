import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { MediaService } from '../media/media.service';

@Injectable()
export class PacksService {
  private readonly logger = new Logger(PacksService.name);

  // File type validation
  private readonly ALLOWED_IMAGE_TYPES = [
    'image/jpeg',
    'image/png',
    'image/webp',
  ];
  private readonly ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/quicktime'];
  private readonly MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
  private readonly MAX_PACK_SIZE = 500 * 1024 * 1024; // 500MB
  private readonly MAX_FILES_PER_PACK = 50;
  private readonly MAX_PREVIEWS = 3;
  private readonly MIN_FILES_FOR_PUBLISH = 3;
  private readonly DOWNLOAD_LIMIT_PER_DAY = 10;

  constructor(
    private prisma: PrismaService,
    private storage: StorageService,
    private media: MediaService
  ) {}

  /**
   * List all packs for a creator
   */
  async listPacks(userId: string) {
    const packs = await this.prisma.pack.findMany({
      where: { creatorId: userId },
      include: {
        previews: {
          orderBy: { order: 'asc' },
          take: 1,
        },
        _count: {
          select: { purchases: true, files: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Generate signed URLs for previews
    const packsWithUrls = await Promise.all(
      packs.map(async (pack) => {
        const previewsWithUrls = await Promise.all(
          pack.previews.map(async (p) => {
            if (p.url.startsWith('http') || p.url.startsWith('data:')) {
              return { url: p.url };
            }
            const signedUrl = await this.storage.getSignedDownloadUrl(p.url, 3600);
            return { url: signedUrl };
          })
        );

        return {
          id: pack.id,
          title: pack.title,
          description: pack.description,
          price: pack.price,
          status: pack.status,
          createdAt: pack.createdAt,
          updatedAt: pack.updatedAt,
          publishedAt: pack.publishedAt,
          previews: previewsWithUrls,
          _count: pack._count,
        };
      })
    );

    return packsWithUrls;
  }

  /**
   * Create a new pack
   */
  async createPack(userId: string, title: string, description?: string, price?: number) {
    return this.prisma.pack.create({
      data: {
        creatorId: userId,
        title,
        description: description || null,
        price: price || 1990, // Default minimum price R$ 19,90
        status: 'draft',
      },
    });
  }

  /**
   * Get pack by ID (for owner)
   */
  async getPackById(packId: string, userId: string) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
      include: {
        previews: { orderBy: { order: 'asc' } },
        files: { orderBy: { order: 'asc' } },
        _count: { select: { purchases: true } },
      },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    // Generate signed URLs for previews
    const previewsWithUrls = await Promise.all(
      pack.previews.map(async (preview) => {
        // If it's already a full URL or data URL, return as is
        if (preview.url.startsWith('http') || preview.url.startsWith('data:')) {
          return preview;
        }
        // Generate signed URL for storage key
        const signedUrl = await this.storage.getSignedDownloadUrl(preview.url, 3600);
        return { ...preview, url: signedUrl };
      })
    );

    return {
      ...pack,
      previews: previewsWithUrls,
    };
  }

  /**
   * Update pack details
   */
  async updatePack(
    packId: string,
    userId: string,
    data: { title?: string; description?: string; price?: number }
  ) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    // Validate price range
    if (data.price !== undefined && data.price < 1990) {
      throw new BadRequestException('Preço deve ser no mínimo R$ 19,90');
    }

    return this.prisma.pack.update({
      where: { id: packId },
      data: {
        title: data.title,
        description: data.description,
        price: data.price,
      },
    });
  }

  /**
   * Publish a pack
   */
  async publishPack(packId: string, userId: string) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    if (pack.status === 'published') {
      throw new BadRequestException('Pack já está publicado');
    }

    // Validate pack before publishing
    await this.validateForPublish(packId);

    return this.prisma.pack.update({
      where: { id: packId },
      data: {
        status: 'published',
        publishedAt: new Date(),
      },
    });
  }

  /**
   * Unpublish a pack
   */
  async unpublishPack(packId: string, userId: string) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    return this.prisma.pack.update({
      where: { id: packId },
      data: { status: 'unpublished' },
    });
  }

  /**
   * Delete a pack (soft delete if has purchases)
   */
  async deletePack(packId: string, userId: string) {
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
      include: { _count: { select: { purchases: true } } },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    // If pack has purchases, soft delete
    if (pack._count.purchases > 0) {
      return this.prisma.pack.update({
        where: { id: packId },
        data: { status: 'deleted', deletedAt: new Date() },
      });
    }

    // No purchases, hard delete
    await this.prisma.packPreview.deleteMany({ where: { packId } });
    await this.prisma.packFile.deleteMany({ where: { packId } });
    await this.prisma.pack.delete({ where: { id: packId } });

    return { deleted: true };
  }

  async validateForPublish(packId: string): Promise<void> {
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: { previews: true, files: true },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    const errors: string[] = [];

    if (!pack.title || pack.title.length < 3) {
      errors.push('Título deve ter no mínimo 3 caracteres');
    }

    if (pack.price < 1990) {
      errors.push('Preço deve ser no mínimo R$ 19,90');
    }

    if (pack.previews.length === 0) {
      errors.push('Pack deve ter ao menos 1 imagem de preview');
    }

    if (pack.files.length < this.MIN_FILES_FOR_PUBLISH) {
      errors.push(`Pack deve ter no mínimo ${this.MIN_FILES_FOR_PUBLISH} arquivos`);
    }

    if (errors.length > 0) {
      throw new BadRequestException({ errors });
    }
  }

  async requestUploadUrl(
    packId: string,
    userId: string,
    _filename: string,
    contentType: string,
    type: 'preview' | 'file'
  ) {
    // Verify pack ownership
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId, creatorId: userId },
      include: { previews: true, files: true },
    });

    if (!pack) {
      throw new ForbiddenException('Pack não encontrado ou você não é o criador');
    }

    // Validate content type
    const allowedTypes =
      type === 'preview'
        ? this.ALLOWED_IMAGE_TYPES
        : [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_VIDEO_TYPES];

    if (!allowedTypes.includes(contentType)) {
      throw new BadRequestException('Tipo de arquivo não permitido');
    }

    // Check limits
    if (type === 'preview' && pack.previews.length >= this.MAX_PREVIEWS) {
      throw new BadRequestException(`Máximo de ${this.MAX_PREVIEWS} previews`);
    }

    if (type === 'file' && pack.files.length >= this.MAX_FILES_PER_PACK) {
      throw new BadRequestException(
        `Máximo de ${this.MAX_FILES_PER_PACK} arquivos`
      );
    }

    // Generate file ID and key
    const fileId = `${Date.now()}_${Math.random().toString(36).substring(7)}`;
    const key = `packs/${packId}/${type}s/${fileId}`;

    // Get presigned upload URL
    const uploadUrl = await this.storage.getSignedUploadUrl(key, contentType);

    this.logger.log(`Upload URL requested for pack ${packId}, type: ${type}`);

    return { uploadUrl, key, fileId };
  }

  async confirmUpload(
    packId: string,
    userId: string,
    fileId: string,
    key: string,
    _filename: string,
    mimeType: string,
    size: number,
    type: 'preview' | 'file'
  ) {
    // Verify pack ownership
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId, creatorId: userId },
      include: { files: true },
    });

    if (!pack) {
      throw new ForbiddenException('Pack não encontrado');
    }

    // Validate size
    if (size > this.MAX_FILE_SIZE) {
      throw new BadRequestException('Arquivo muito grande (máx. 100MB)');
    }

    // Check total pack size
    const totalSize = pack.files.reduce((sum: number, f: any) => sum + f.size, 0) + size;
    if (totalSize > this.MAX_PACK_SIZE) {
      throw new BadRequestException('Tamanho total do pack excede 500MB');
    }

    // Convert media if needed
    let finalKey = key;
    let finalMimeType = mimeType;
    let finalSize = size;
    let finalFilename = _filename;

    if (this.media.shouldConvert(mimeType)) {
      try {
        this.logger.log(`Converting ${mimeType} file: ${_filename}`);

        // Download original file
        const originalBuffer = await this.storage.downloadFile(key);

        // Convert
        const result = await this.media.convert(originalBuffer, mimeType);

        // Generate new key with correct extension
        finalFilename = this.media.getConvertedFilename(_filename, mimeType);
        finalKey = key.replace(/\.[^.]+$/, `.${result.extension}`);
        finalMimeType = result.mimeType;
        finalSize = result.convertedSize;

        // Upload converted file
        await this.storage.uploadFile(finalKey, result.buffer, result.mimeType);

        // Delete original if key changed
        if (finalKey !== key) {
          try {
            await this.storage.deleteFile(key);
          } catch (deleteErr) {
            this.logger.warn(`Failed to delete original file: ${key}`, deleteErr);
          }
        }

        this.logger.log(
          `Converted ${_filename} -> ${finalFilename} (${size} -> ${finalSize} bytes)`
        );
      } catch (conversionError) {
        this.logger.error('Media conversion failed, using original', conversionError);
        // Fall back to original file
      }
    }

    if (type === 'preview') {
      const previewCount = await this.prisma.packPreview.count({
        where: { packId },
      });

      return this.prisma.packPreview.create({
        data: {
          id: fileId,
          packId,
          url: finalKey, // Store key, will generate signed URL on read
          order: previewCount,
        },
      });
    }

    // File upload
    const fileCount = await this.prisma.packFile.count({ where: { packId } });

    return this.prisma.packFile.create({
      data: {
        id: fileId,
        packId,
        filename: finalFilename,
        mimeType: finalMimeType,
        size: finalSize,
        storageKey: finalKey,
        order: fileCount,
      },
    });
  }

  async getPackFiles(packId: string, userId: string) {
    // Check if user purchased the pack
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        packId,
        status: 'paid',
      },
    });

    if (!purchase) {
      throw new ForbiddenException('Você não comprou este pack');
    }

    // Get pack files
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: {
        files: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    return {
      packId: pack.id,
      files: pack.files.map((file: any) => ({
        id: file.id,
        filename: file.filename,
        mimeType: file.mimeType,
        size: file.size,
        order: file.order,
      })),
    };
  }

  async requestDownloadUrl(
    packId: string,
    fileId: string,
    userId: string,
    ipAddress: string,
    userAgent: string
  ): Promise<string> {
    // Verify purchase
    const purchase = await this.prisma.purchase.findFirst({
      where: {
        userId,
        packId,
        status: 'paid',
      },
    });

    if (!purchase) {
      throw new ForbiddenException('Você não comprou este pack');
    }

    // Get file
    const file = await this.prisma.packFile.findUnique({
      where: { id: fileId },
    });

    if (!file || file.packId !== packId) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Check daily download limit (RN-23: 10 por arquivo por dia)
    const dateKey = new Date().toISOString().split('T')[0]; // YYYY-MM-DD

    const downloadLog = await this.prisma.downloadLog.findUnique({
      where: {
        userId_fileId_dateKey: {
          userId,
          fileId,
          dateKey,
        },
      },
    });

    const currentCount = downloadLog?.count || 0;

    if (currentCount >= this.DOWNLOAD_LIMIT_PER_DAY) {
      throw new HttpException(
        {
          statusCode: HttpStatus.TOO_MANY_REQUESTS,
          message: `Limite diário de downloads para este arquivo atingido (${this.DOWNLOAD_LIMIT_PER_DAY}/dia)`,
          error: 'Too Many Requests',
          retryAfter: this.getSecondsUntilMidnight(),
        },
        HttpStatus.TOO_MANY_REQUESTS
      );
    }

    // Increment download count
    await this.prisma.downloadLog.upsert({
      where: {
        userId_fileId_dateKey: {
          userId,
          fileId,
          dateKey,
        },
      },
      create: {
        userId,
        fileId,
        packId,
        dateKey,
        count: 1,
        ipAddress,
        userAgent,
      },
      update: {
        count: currentCount + 1,
        updatedAt: new Date(),
      },
    });

    this.logger.log(
      `Download URL requested: user ${userId}, file ${fileId}, count: ${currentCount + 1}/10`
    );

    // Generate signed URL (1 hour expiration)
    const downloadUrl = await this.storage.getSignedDownloadUrl(
      file.storageKey,
      3600
    );

    return downloadUrl;
  }

  /**
   * Calculate seconds until midnight (UTC) for Retry-After header
   */
  private getSecondsUntilMidnight(): number {
    const now = new Date();
    const tomorrow = new Date(now);
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    tomorrow.setUTCHours(0, 0, 0, 0);
    return Math.ceil((tomorrow.getTime() - now.getTime()) / 1000);
  }

  /**
   * Delete a file from pack
   */
  async deleteFile(packId: string, fileId: string, userId: string) {
    // Verify pack ownership
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
    });

    if (!pack) {
      throw new ForbiddenException('Pack não encontrado ou você não é o criador');
    }

    // Only allow deletion if pack is in draft status
    if (pack.status === 'published') {
      throw new BadRequestException('Não é possível excluir arquivos de um pack publicado. Despublique primeiro.');
    }

    // Verify file belongs to pack
    const file = await this.prisma.packFile.findFirst({
      where: { id: fileId, packId },
    });

    if (!file) {
      throw new NotFoundException('Arquivo não encontrado');
    }

    // Delete from storage (if implemented)
    try {
      await this.storage.deleteFile(file.storageKey);
    } catch {
      this.logger.warn(`Failed to delete file from storage: ${file.storageKey}`);
    }

    // Delete from database
    await this.prisma.packFile.delete({ where: { id: fileId } });

    this.logger.log(`File ${fileId} deleted from pack ${packId}`);
    return { deleted: true };
  }

  /**
   * Delete a preview from pack
   */
  async deletePreview(packId: string, previewId: string, userId: string) {
    // Verify pack ownership
    const pack = await this.prisma.pack.findFirst({
      where: { id: packId, creatorId: userId },
    });

    if (!pack) {
      throw new ForbiddenException('Pack não encontrado ou você não é o criador');
    }

    // Only allow deletion if pack is in draft status
    if (pack.status === 'published') {
      throw new BadRequestException('Não é possível excluir previews de um pack publicado. Despublique primeiro.');
    }

    // Verify preview belongs to pack
    const preview = await this.prisma.packPreview.findFirst({
      where: { id: previewId, packId },
    });

    if (!preview) {
      throw new NotFoundException('Preview não encontrado');
    }

    // Delete from storage if it's a storage URL (not data URL)
    if (!preview.url.startsWith('data:')) {
      try {
        await this.storage.deleteFile(preview.url);
      } catch {
        this.logger.warn(`Failed to delete preview from storage: ${preview.url}`);
      }
    }

    // Delete from database
    await this.prisma.packPreview.delete({ where: { id: previewId } });

    this.logger.log(`Preview ${previewId} deleted from pack ${packId}`);
    return { deleted: true };
  }
}