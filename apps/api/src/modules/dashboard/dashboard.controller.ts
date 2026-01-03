import { Controller, Get, Post, UseGuards, Query, BadRequestException } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';
import { PrismaService } from '@/prisma/prisma.service';

const MIN_WITHDRAWAL_AMOUNT = 5000; // R$ 50,00 in cents

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
export class DashboardController {
  constructor(
    private readonly dashboardService: DashboardService,
    private readonly prisma: PrismaService
  ) {}

  @Get('stats')
  getStats(@CurrentUser() user: any) {
    return this.dashboardService.getStats(user.id);
  }

  @Get('sales')
  getSales(@CurrentUser() user: any, @Query('limit') limit?: string) {
    return this.dashboardService.getRecentSales(user.id, limit ? parseInt(limit) : 5);
  }

  @Get('balance')
  getBalance(@CurrentUser() user: any) {
    return this.dashboardService.getBalance(user.id);
  }

  @Get('chart')
  getChartData(@CurrentUser() user: any, @Query('days') days?: string) {
    return this.dashboardService.getSalesChart(user.id, days ? parseInt(days) : 30);
  }

  @Get('withdrawals')
  getWithdrawals(@CurrentUser() user: any) {
    return this.dashboardService.getWithdrawals(user.id);
  }

  @Post('withdrawals')
  async requestWithdrawal(@CurrentUser() user: any) {
    // Fetch full user data to check personal info
    const fullUser = await this.prisma.user.findUnique({
      where: { id: user.id },
    });

    if (!fullUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    // Check if personal data is complete (required for Stripe payments)
    if (!fullUser.fullName || !fullUser.cpf || !fullUser.phone) {
      throw new BadRequestException(
        'Complete seus dados pessoais (nome completo, CPF e telefone) antes de solicitar saques.'
      );
    }

    if (!fullUser.addressZipCode || !fullUser.addressStreet || !fullUser.addressCity) {
      throw new BadRequestException(
        'Complete seu endereço antes de solicitar saques.'
      );
    }

    if (!fullUser.pixKey || !fullUser.pixKeyType) {
      throw new BadRequestException(
        'Configure sua chave PIX antes de solicitar saques.'
      );
    }

    const balance = await this.dashboardService.getBalance(user.id);

    if (balance.available < MIN_WITHDRAWAL_AMOUNT) {
      throw new BadRequestException(
        `Saldo mínimo de R$ 50,00 necessário para saque. Saldo disponível: R$ ${(balance.available / 100).toFixed(2)}`
      );
    }

    // Check for pending withdrawals
    const pendingWithdrawal = await this.prisma.withdrawal.findFirst({
      where: {
        creatorId: user.id,
        status: { in: ['pending', 'processing'] },
      },
    });

    if (pendingWithdrawal) {
      throw new BadRequestException(
        'Você já possui um saque em processamento. Aguarde a conclusão antes de solicitar outro.'
      );
    }

    return this.dashboardService.requestWithdrawal(user.id, balance.available);
  }
}
