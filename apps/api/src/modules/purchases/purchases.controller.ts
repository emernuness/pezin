import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { PurchasesService } from './purchases.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('me/purchases')
@UseGuards(JwtAuthGuard)
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Get()
  findMyPurchases(@CurrentUser() user: any) {
    return this.purchasesService.findAllByUser(user.id);
  }

  @Get(':packId')
  findMyPurchase(@CurrentUser() user: any, @Param('packId') packId: string) {
      return this.purchasesService.findByUserAndPack(user.id, packId);
  }
}
