import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  S3Client,
  GetObjectCommand,
  PutObjectCommand,
  DeleteObjectCommand,
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Readable } from 'stream';

@Injectable()
export class StorageService {
  private readonly client: S3Client;
  private readonly bucket: string;
  private readonly logger = new Logger(StorageService.name);

  constructor(private config: ConfigService) {
    const endpoint = this.config.get<string>('R2_ENDPOINT');
    const accessKey = this.config.get<string>('R2_ACCESS_KEY');
    const secretKey = this.config.get<string>('R2_SECRET_KEY');
    this.bucket = this.config.get<string>('R2_BUCKET') || 'packdopezin';

    if (!endpoint || !accessKey || !secretKey) {
      throw new Error('R2 credentials not configured');
    }

    this.client = new S3Client({
      region: 'auto',
      endpoint,
      credentials: {
        accessKeyId: accessKey,
        secretAccessKey: secretKey,
      },
    });

    this.logger.log('Storage service initialized with Cloudflare R2');
  }

  async getSignedDownloadUrl(
    key: string,
    expiresIn = 3600
  ): Promise<string> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    this.logger.debug(`Generated download URL for: ${key}`);
    return url;
  }

  async getSignedUploadUrl(
    key: string,
    contentType: string,
    expiresIn = 3600
  ): Promise<string> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      ContentType: contentType,
    });

    const url = await getSignedUrl(this.client, command, { expiresIn });
    this.logger.debug(`Generated upload URL for: ${key}`);
    return url;
  }

  async deleteFile(key: string): Promise<void> {
    const command = new DeleteObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    await this.client.send(command);
    this.logger.log(`Deleted file: ${key}`);
  }

  /**
   * Download file from storage and return as Buffer
   */
  async downloadFile(key: string): Promise<Buffer> {
    const command = new GetObjectCommand({
      Bucket: this.bucket,
      Key: key,
    });

    const response = await this.client.send(command);

    if (!response.Body) {
      throw new Error('No body in response');
    }

    // Convert stream to buffer
    const stream = response.Body as Readable;
    const chunks: Buffer[] = [];

    for await (const chunk of stream) {
      chunks.push(Buffer.from(chunk));
    }

    const buffer = Buffer.concat(chunks);
    this.logger.debug(`Downloaded file: ${key} (${buffer.length} bytes)`);

    return buffer;
  }

  /**
   * Upload file directly to storage
   */
  async uploadFile(
    key: string,
    buffer: Buffer,
    contentType: string
  ): Promise<void> {
    const command = new PutObjectCommand({
      Bucket: this.bucket,
      Key: key,
      Body: buffer,
      ContentType: contentType,
    });

    await this.client.send(command);
    this.logger.log(`Uploaded file: ${key} (${buffer.length} bytes)`);
  }
}
