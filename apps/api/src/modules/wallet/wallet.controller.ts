import {
  Controller,
  Get,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { WalletService } from './wallet.service';

/**
 * WalletController
 *
 * Endpoints para gerenciar carteira do criador.
 *
 * Endpoints:
 * - GET /wallet/balance - Saldo atual
 * - GET /wallet/summary - Resumo completo
 * - GET /wallet/transactions - Histórico de transações
 */
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(private readonly walletService: WalletService) {}

  /**
   * Retorna o saldo atual da carteira
   */
  @Get('balance')
  async getBalance(@CurrentUser() user: { id: string }) {
    const balance = await this.walletService.getBalance(user.id);

    return {
      success: true,
      data: {
        available: balance.available,
        frozen: balance.frozen,
        total: balance.total,
        formatted: {
          available: `R$ ${(balance.available / 100).toFixed(2)}`,
          frozen: `R$ ${(balance.frozen / 100).toFixed(2)}`,
          total: `R$ ${(balance.total / 100).toFixed(2)}`,
        },
      },
    };
  }

  /**
   * Retorna resumo completo da carteira
   */
  @Get('summary')
  async getSummary(@CurrentUser() user: { id: string }) {
    const summary = await this.walletService.getWalletSummary(user.id);

    return {
      success: true,
      data: {
        balance: {
          available: summary.balance.available,
          frozen: summary.balance.frozen,
          total: summary.balance.total,
        },
        pendingPayouts: summary.pendingPayouts,
        totalEarnings: summary.totalEarnings,
        totalPayouts: summary.totalPayouts,
        formatted: {
          available: `R$ ${(summary.balance.available / 100).toFixed(2)}`,
          frozen: `R$ ${(summary.balance.frozen / 100).toFixed(2)}`,
          total: `R$ ${(summary.balance.total / 100).toFixed(2)}`,
          pendingPayouts: `R$ ${(summary.pendingPayouts / 100).toFixed(2)}`,
          totalEarnings: `R$ ${(summary.totalEarnings / 100).toFixed(2)}`,
          totalPayouts: `R$ ${(summary.totalPayouts / 100).toFixed(2)}`,
        },
      },
    };
  }

  /**
   * Retorna histórico de transações
   */
  @Get('transactions')
  async getTransactions(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.walletService.getTransactionHistory(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });

    return {
      success: true,
      data: result.transactions.map((tx) => ({
        ...tx,
        formatted: {
          amount: `R$ ${(tx.amount / 100).toFixed(2)}`,
          createdAt: tx.createdAt.toISOString(),
        },
      })),
      pagination: result.pagination,
    };
  }
}
