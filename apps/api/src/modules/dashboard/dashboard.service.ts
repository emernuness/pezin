import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/prisma/prisma.service';

@Injectable()
export class DashboardService {
  constructor(private prisma: PrismaService) {}

  async getStats(creatorId: string) {
    const totalSales = await this.prisma.purchase.count({
      where: { creatorId, status: 'paid' },
    });

    const revenueResult = await this.prisma.purchase.aggregate({
      where: { creatorId, status: 'paid' },
      _sum: { amount: true, creatorEarnings: true },
    });

    const totalRevenue = revenueResult._sum.amount || 0;
    const totalEarnings = revenueResult._sum.creatorEarnings || 0;

    const balance = await this.getBalance(creatorId);

    const packsPublished = await this.prisma.pack.count({
      where: { creatorId, status: 'published' },
    });

    const packsDraft = await this.prisma.pack.count({
      where: { creatorId, status: 'draft' },
    });

    return {
      totalSales,
      totalRevenue,
      totalEarnings,
      availableBalance: balance.available,
      pendingBalance: balance.pending,
      packsPublished,
      packsDraft,
    };
  }

  async getRecentSales(creatorId: string, limit: number) {
    return this.prisma.purchase.findMany({
      where: { creatorId, status: 'paid' },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        pack: {
          select: { title: true, price: true },
        },
      },
    });
  }

  async getBalance(creatorId: string) {
    const now = new Date();

    // Pending: purchased in the last 14 days
    const pendingResult = await this.prisma.purchase.aggregate({
      where: {
        creatorId,
        status: 'paid',
        availableAt: { gt: now },
      },
      _sum: { creatorEarnings: true },
    });

    // Available: purchased > 14 days ago
    const availableResult = await this.prisma.purchase.aggregate({
      where: {
        creatorId,
        status: 'paid',
        availableAt: { lte: now },
      },
      _sum: { creatorEarnings: true },
    });

    // Withdrawals (pending or completed)
    const withdrawalsResult = await this.prisma.withdrawal.aggregate({
      where: {
        creatorId,
        status: { in: ['pending', 'processing', 'completed'] },
      },
      _sum: { amount: true },
    });

    return {
      pending: pendingResult._sum.creatorEarnings || 0,
      available:
        (availableResult._sum.creatorEarnings || 0) -
        (withdrawalsResult._sum.amount || 0),
    };
  }

  async getSalesChart(creatorId: string, days: number) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const sales = await this.prisma.purchase.findMany({
      where: {
        creatorId,
        status: 'paid',
        createdAt: { gte: startDate },
      },
      select: {
        createdAt: true,
        creatorEarnings: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // Group by day
    const grouped = new Map<string, number>();

    // Initialize all days with 0
    for (let i = 0; i <= days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const dateKey = d.toISOString().split('T')[0];
        grouped.set(dateKey, 0);
    }

    sales.forEach((sale: any) => {
      const dateKey = sale.createdAt.toISOString().split('T')[0];
      const current = grouped.get(dateKey) || 0;
      grouped.set(dateKey, current + sale.creatorEarnings);
    });

    return Array.from(grouped.entries()).map(([date, amount]) => ({
      date,
      amount,
    }));
  }

  async getWithdrawals(creatorId: string) {
    return this.prisma.withdrawal.findMany({
      where: { creatorId },
      orderBy: { requestedAt: 'desc' },
      take: 20,
    });
  }

  async requestWithdrawal(creatorId: string, amount: number) {
    // With Stripe Connect Destination Charges, money is already in the creator's
    // Stripe account. Our withdrawal system tracks our internal 14-day anti-fraud
    // hold period. Once available, the money is in their Stripe balance and will
    // be paid out to their bank according to their payout schedule.
    //
    // We mark the withdrawal as "completed" immediately because:
    // 1. The funds are already in their Stripe Connected Account
    // 2. Stripe handles the actual payout to their bank automatically
    // 3. Our withdrawal is just an internal tracking mechanism

    const withdrawal = await this.prisma.withdrawal.create({
      data: {
        creatorId,
        amount,
        status: 'completed',
        processedAt: new Date(),
      },
    });

    return {
      withdrawal,
      message: 'Saque processado com sucesso! O valor será depositado na sua conta bancária de acordo com o cronograma de pagamentos do Stripe.',
    };
  }
}
