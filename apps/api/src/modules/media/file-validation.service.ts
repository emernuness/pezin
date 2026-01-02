import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

/**
 * Service for validating file types using magic bytes (file signatures)
 * This prevents MIME type spoofing attacks
 */
@Injectable()
export class FileValidationService {
  private readonly logger = new Logger(FileValidationService.name);

  // Allowed MIME types for different contexts
  private readonly ALLOWED_IMAGE_TYPES = new Set([
    'image/jpeg',
    'image/png',
    'image/webp',
  ]);

  private readonly ALLOWED_VIDEO_TYPES = new Set([
    'video/mp4',
    'video/quicktime', // .mov files
  ]);

  /**
   * Validate file type by checking magic bytes (file signature)
   * @param buffer - File buffer to validate
   * @param declaredMimeType - MIME type declared by client
   * @param context - 'image' or 'video' for stricter validation
   * @throws BadRequestException if validation fails
   */
  async validateFileType(
    buffer: Buffer,
    declaredMimeType: string,
    context: 'image' | 'video'
  ): Promise<void> {
    // Check file signature (magic bytes)
    const detectedType = await fileTypeFromBuffer(buffer);

    if (!detectedType) {
      this.logger.warn(`Could not detect file type for declared: ${declaredMimeType}`);
      throw new BadRequestException(
        'Tipo de arquivo não pôde ser identificado. Envie um arquivo válido.'
      );
    }

    // Verify declared MIME type matches detected type
    if (detectedType.mime !== declaredMimeType) {
      this.logger.warn(
        `MIME type mismatch: declared=${declaredMimeType}, detected=${detectedType.mime}`
      );
      throw new BadRequestException(
        `Tipo de arquivo inválido. Esperado ${declaredMimeType}, detectado ${detectedType.mime}`
      );
    }

    // Validate against allowed types for context
    if (context === 'image' && !this.ALLOWED_IMAGE_TYPES.has(detectedType.mime)) {
      throw new BadRequestException(
        `Tipo de imagem não permitido: ${detectedType.mime}. Permitidos: JPEG, PNG, WebP`
      );
    }

    if (context === 'video' && !this.ALLOWED_VIDEO_TYPES.has(detectedType.mime)) {
      throw new BadRequestException(
        `Tipo de vídeo não permitido: ${detectedType.mime}. Permitidos: MP4, MOV`
      );
    }

    this.logger.debug(`File validated: ${detectedType.mime} (${detectedType.ext})`);
  }

  /**
   * Validate profile image (avatar or cover)
   */
  async validateProfileImage(buffer: Buffer, declaredMimeType: string): Promise<void> {
    return this.validateFileType(buffer, declaredMimeType, 'image');
  }

  /**
   * Validate pack file (can be image or video)
   */
  async validatePackFile(buffer: Buffer, declaredMimeType: string): Promise<void> {
    // Determine context based on MIME type
    const context = declaredMimeType.startsWith('image/') ? 'image' : 'video';
    return this.validateFileType(buffer, declaredMimeType, context);
  }

  /**
   * Get allowed MIME types for a context
   */
  getAllowedTypes(context: 'image' | 'video'): string[] {
    const allowedSet = context === 'image' 
      ? this.ALLOWED_IMAGE_TYPES 
      : this.ALLOWED_VIDEO_TYPES;
    
    return Array.from(allowedSet);
  }
}
