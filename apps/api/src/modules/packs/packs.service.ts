import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';
import { StorageService } from '../storage/storage.service';
import { PackStatus } from '@prisma/client';

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

  constructor(
    private prisma: PrismaService,
    private storage: StorageService
  ) {}

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

    if (pack.price < 990 || pack.price > 50000) {
      errors.push('Preço deve estar entre R$ 9,90 e R$ 500,00');
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
    filename: string,
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
    filename: string,
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
    const totalSize = pack.files.reduce((sum, f) => sum + f.size, 0) + size;
    if (totalSize > this.MAX_PACK_SIZE) {
      throw new BadRequestException('Tamanho total do pack excede 500MB');
    }

    if (type === 'preview') {
      const previewCount = await this.prisma.packPreview.count({
        where: { packId },
      });

      return this.prisma.packPreview.create({
        data: {
          id: fileId,
          packId,
          url: key, // Store key, will generate signed URL on read
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
        filename,
        mimeType,
        size,
        storageKey: key,
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
      files: pack.files.map((file) => ({
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

    if (currentCount >= 10) {
      throw new BadRequestException(
        'Limite diário de downloads para este arquivo atingido (10/dia)'
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
}
