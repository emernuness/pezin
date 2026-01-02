import { Module, forwardRef, OnModuleInit } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ModuleRef } from '@nestjs/core';
import { StorageService } from './storage.service';
import { MediaTokenModule } from '../media-token/media-token.module';
import { MediaTokenService } from '../media-token/media-token.service';

@Module({
  imports: [ConfigModule, forwardRef(() => MediaTokenModule)],
  providers: [StorageService],
  exports: [StorageService],
})
export class StorageModule implements OnModuleInit {
  constructor(
    private moduleRef: ModuleRef,
    private storageService: StorageService
  ) {}

  async onModuleInit() {
    // Late bind MediaTokenService to avoid circular dependency
    try {
      const mediaTokenService = this.moduleRef.get(MediaTokenService, {
        strict: false,
      });
      this.storageService.setMediaTokenService(mediaTokenService);
    } catch {
      // MediaTokenService may not be available in all contexts
    }
  }
}
