import { Module, forwardRef } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';
import { MediaTokenService } from './media-token.service';
import { MediaTokenController } from './media-token.controller';

@Module({
  imports: [ConfigModule, PrismaModule, forwardRef(() => StorageModule)],
  controllers: [MediaTokenController],
  providers: [MediaTokenService],
  exports: [MediaTokenService],
})
export class MediaTokenModule {}
