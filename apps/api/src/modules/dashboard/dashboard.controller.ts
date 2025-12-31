import { Controller, Get, UseGuards, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '@/common/guards/roles.guard';
import { Roles } from '@/common/decorators/roles.decorator';
import { CurrentUser } from '@/common/decorators/current-user.decorator';

@Controller('dashboard')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('creator')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

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
}
