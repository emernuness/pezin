import { Module } from '@nestjs/common';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { PrismaModule } from '@/prisma/prisma.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [PrismaModule, StorageModule],
  controllers: [PurchasesController],
  providers: [PurchasesService],
})
export class PurchasesModule {}
