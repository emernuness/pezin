import { Injectable, Logger } from '@nestjs/common';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { promisify } from 'util';

const writeFile = promisify(fs.writeFile);
const unlink = promisify(fs.unlink);
const mkdir = promisify(fs.mkdir);

export interface ConversionResult {
  buffer: Buffer;
  mimeType: string;
  extension: string;
  originalSize: number;
  convertedSize: number;
}

@Injectable()
export class MediaService {
  private readonly logger = new Logger(MediaService.name);
  private readonly tempDir: string;

  // WebP quality (0-100)
  private readonly WEBP_QUALITY = 85;
  // WebM video bitrate
  private readonly WEBM_VIDEO_BITRATE = '1500k';
  private readonly WEBM_AUDIO_BITRATE = '128k';

  constructor() {
    this.tempDir = path.join(os.tmpdir(), 'pezin-media');
    this.ensureTempDir();
  }

  private async ensureTempDir() {
    try {
      await mkdir(this.tempDir, { recursive: true });
    } catch {
      // Directory might already exist
    }
  }

  /**
   * Check if a file should be converted based on its MIME type
   */
  shouldConvert(mimeType: string): boolean {
    // Already optimized formats
    if (mimeType === 'image/webp' || mimeType === 'video/webm') {
      return false;
    }

    return this.isImage(mimeType) || this.isVideo(mimeType);
  }

  /**
   * Check if MIME type is an image
   */
  isImage(mimeType: string): boolean {
    return mimeType.startsWith('image/');
  }

  /**
   * Check if MIME type is a video
   */
  isVideo(mimeType: string): boolean {
    return mimeType.startsWith('video/');
  }

  /**
   * Convert media file to optimized format
   * Images -> WebP
   * Videos -> WebM
   */
  async convert(buffer: Buffer, mimeType: string): Promise<ConversionResult> {
    const originalSize = buffer.length;

    if (this.isImage(mimeType) && mimeType !== 'image/webp') {
      return this.convertImageToWebP(buffer, originalSize);
    }

    if (this.isVideo(mimeType) && mimeType !== 'video/webm') {
      return this.convertVideoToWebM(buffer, mimeType, originalSize);
    }

    // Return original if no conversion needed
    return {
      buffer,
      mimeType,
      extension: this.getExtension(mimeType),
      originalSize,
      convertedSize: originalSize,
    };
  }

  /**
   * Convert image to WebP format using sharp
   */
  private async convertImageToWebP(buffer: Buffer, originalSize: number): Promise<ConversionResult> {
    try {
      const convertedBuffer = await sharp(buffer)
        .webp({ quality: this.WEBP_QUALITY })
        .toBuffer();

      const convertedSize = convertedBuffer.length;
      const savings = ((originalSize - convertedSize) / originalSize * 100).toFixed(1);

      this.logger.log(`Image converted to WebP: ${originalSize} -> ${convertedSize} bytes (${savings}% savings)`);

      return {
        buffer: convertedBuffer,
        mimeType: 'image/webp',
        extension: 'webp',
        originalSize,
        convertedSize,
      };
    } catch (error) {
      this.logger.error('Failed to convert image to WebP', error);
      throw error;
    }
  }

  /**
   * Convert video to WebM format using FFmpeg
   */
  private async convertVideoToWebM(
    buffer: Buffer,
    mimeType: string,
    originalSize: number
  ): Promise<ConversionResult> {
    const inputExt = this.getExtension(mimeType);
    const inputPath = path.join(this.tempDir, `input_${Date.now()}.${inputExt}`);
    const outputPath = path.join(this.tempDir, `output_${Date.now()}.webm`);

    try {
      // Write input file
      await writeFile(inputPath, buffer);

      // Convert using FFmpeg
      await new Promise<void>((resolve, reject) => {
        ffmpeg(inputPath)
          .outputOptions([
            '-c:v libvpx-vp9',
            `-b:v ${this.WEBM_VIDEO_BITRATE}`,
            '-c:a libopus',
            `-b:a ${this.WEBM_AUDIO_BITRATE}`,
            '-f webm',
          ])
          .output(outputPath)
          .on('start', (cmd: string) => {
            this.logger.debug(`FFmpeg started: ${cmd}`);
          })
          .on('progress', (progress: { percent?: number }) => {
            if (progress.percent) {
              this.logger.debug(`Converting: ${progress.percent.toFixed(1)}%`);
            }
          })
          .on('end', () => {
            this.logger.log('Video conversion completed');
            resolve();
          })
          .on('error', (err: Error) => {
            this.logger.error('FFmpeg error', err);
            reject(err);
          })
          .run();
      });

      // Read output file
      const convertedBuffer = fs.readFileSync(outputPath);
      const convertedSize = convertedBuffer.length;
      const savings = ((originalSize - convertedSize) / originalSize * 100).toFixed(1);

      this.logger.log(`Video converted to WebM: ${originalSize} -> ${convertedSize} bytes (${savings}% savings)`);

      return {
        buffer: convertedBuffer,
        mimeType: 'video/webm',
        extension: 'webm',
        originalSize,
        convertedSize,
      };
    } finally {
      // Cleanup temp files
      await this.cleanupFile(inputPath);
      await this.cleanupFile(outputPath);
    }
  }

  /**
   * Get file extension from MIME type
   */
  private getExtension(mimeType: string): string {
    const extensions: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/bmp': 'bmp',
      'image/tiff': 'tiff',
      'video/mp4': 'mp4',
      'video/quicktime': 'mov',
      'video/webm': 'webm',
      'video/mpeg': 'mpeg',
      'video/avi': 'avi',
      'video/x-msvideo': 'avi',
    };

    return extensions[mimeType] || 'bin';
  }

  /**
   * Get new filename with converted extension
   */
  getConvertedFilename(originalFilename: string, mimeType: string): string {
    const ext = path.extname(originalFilename);
    const basename = originalFilename.slice(0, -ext.length);

    if (this.isImage(mimeType) && mimeType !== 'image/webp') {
      return `${basename}.webp`;
    }

    if (this.isVideo(mimeType) && mimeType !== 'video/webm') {
      return `${basename}.webm`;
    }

    return originalFilename;
  }

  /**
   * Cleanup temporary file
   */
  private async cleanupFile(filePath: string): Promise<void> {
    try {
      if (fs.existsSync(filePath)) {
        await unlink(filePath);
      }
    } catch (error) {
      this.logger.warn(`Failed to cleanup temp file: ${filePath}`, error);
    }
  }
}
