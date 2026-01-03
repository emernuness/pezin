import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';
import { requestPayoutSchema, RequestPayoutInput } from '@pack-do-pezin/shared';

/**
 * WalletController
 *
 * Endpoints para gerenciar carteira do criador.
 *
 * Endpoints:
 * - GET /wallet/balance - Saldo atual
 * - GET /wallet/summary - Resumo completo
 * - GET /wallet/transactions - Histórico de transações
 * - POST /wallet/payout - Solicitar saque
 * - GET /wallet/payouts - Listar saques
 * - GET /wallet/payouts/:id - Detalhes do saque
 */
@Controller('wallet')
@UseGuards(JwtAuthGuard)
export class WalletController {
  constructor(
    private readonly walletService: WalletService,
    private readonly payoutService: PayoutService,
  ) {}

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

  /**
   * Solicita um saque via PIX
   */
  @Post('payout')
  async requestPayout(
    @Body(new ZodValidationPipe(requestPayoutSchema)) body: RequestPayoutInput,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.payoutService.requestPayout({
      userId: user.id,
      amount: body.amount,
    });

    return {
      success: true,
      data: {
        payoutId: result.payoutId,
        amount: result.amount,
        status: result.status,
        estimatedCompletionAt: result.estimatedCompletionAt?.toISOString(),
        formatted: {
          amount: `R$ ${(result.amount / 100).toFixed(2)}`,
        },
      },
    };
  }

  /**
   * Lista saques do usuário
   */
  @Get('payouts')
  async listPayouts(
    @CurrentUser() user: { id: string },
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const result = await this.payoutService.listPayouts(user.id, {
      page: page ? parseInt(page, 10) : 1,
      limit: limit ? Math.min(parseInt(limit, 10), 50) : 20,
    });

    return {
      success: true,
      data: result.payouts.map((p) => ({
        id: p.id,
        amount: p.amount,
        maskedPixKey: p.maskedPixKey,
        pixKeyType: p.pixKeyType,
        status: p.status,
        requestedAt: p.requestedAt.toISOString(),
        completedAt: p.completedAt?.toISOString(),
        failureReason: p.failureReason,
        formatted: {
          amount: `R$ ${(p.amount / 100).toFixed(2)}`,
        },
      })),
      pagination: result.pagination,
    };
  }

  /**
   * Obtém detalhes de um saque
   */
  @Get('payouts/:id')
  async getPayoutDetails(
    @Param('id') payoutId: string,
    @CurrentUser() user: { id: string },
  ) {
    const payout = await this.payoutService.getPayoutDetails(payoutId, user.id);

    return {
      success: true,
      data: {
        id: payout.id,
        amount: payout.amount,
        maskedPixKey: payout.maskedPixKey,
        pixKeyType: payout.pixKeyType,
        status: payout.status,
        requestedAt: payout.requestedAt.toISOString(),
        completedAt: payout.completedAt?.toISOString(),
        failureReason: payout.failureReason,
        formatted: {
          amount: `R$ ${(payout.amount / 100).toFixed(2)}`,
        },
      },
    };
  }
}
