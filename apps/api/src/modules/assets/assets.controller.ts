import {
  Controller,
  Get,
  Param,
  Res,
  NotFoundException,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import * as path from 'node:path';
import * as fs from 'node:fs';

@Controller('assets')
export class AssetsController {
  private readonly logger = new Logger(AssetsController.name);
  private readonly assetsPath: string;
  private readonly isEnabled: boolean;

  constructor(private config: ConfigService) {
    this.isEnabled = this.config.get('NODE_ENV') === 'development';
    // Use process.cwd() since __dirname points to dist in compiled code
    this.assetsPath = path.join(process.cwd(), 'prisma', 'seed-assets');

    if (this.isEnabled) {
      this.logger.log(`Development assets serving enabled from: ${this.assetsPath}`);
    }
  }

  @Get(':folder/:filename')
  async getAsset(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    if (!this.isEnabled) {
      throw new NotFoundException('Asset serving disabled in production');
    }

    // Validate folder (prevent directory traversal)
    const allowedFolders = ['previews', 'avatars', 'covers'];
    if (!allowedFolders.includes(folder)) {
      throw new NotFoundException('Invalid asset folder');
    }

    // Validate filename (prevent directory traversal)
    const safeFilename = path.basename(filename);
    if (safeFilename !== filename || filename.includes('..')) {
      throw new NotFoundException('Invalid filename');
    }

    const filePath = path.join(this.assetsPath, folder, safeFilename);

    // Check if file exists
    if (!fs.existsSync(filePath)) {
      this.logger.warn(`Asset not found: ${filePath}`);
      throw new NotFoundException('Asset not found');
    }

    // Determine content type
    const ext = path.extname(filename).toLowerCase();
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.webp': 'image/webp',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
    };

    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Set cache headers for development
    res.setHeader('Content-Type', contentType);
    res.setHeader('Cache-Control', 'public, max-age=86400'); // 1 day cache

    // Stream the file
    const stream = fs.createReadStream(filePath);
    stream.pipe(res);
  }
}
