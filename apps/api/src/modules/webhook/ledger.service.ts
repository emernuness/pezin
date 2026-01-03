import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LedgerEntryType, TransactionType, Prisma } from '@prisma/client';

interface CreateLedgerEntryParams {
  walletId?: string;
  isPlatformEntry?: boolean;
  type: 'CREDIT' | 'DEBIT';
  transactionType: 'SALE' | 'PLATFORM_FEE' | 'PAYOUT' | 'REFUND' | 'ADJUSTMENT' | 'RELEASE';
  amount: number;
  balanceAfter: number;
  paymentId?: string;
  payoutId?: string;
  description?: string;
  metadata?: Record<string, unknown>;
}

/**
 * LedgerService
 *
 * Gerencia o livro razão financeiro (double-entry bookkeeping).
 * Toda operação financeira deve gerar uma entrada no ledger.
 *
 * Regras:
 * - Toda CREDIT deve ter uma DEBIT correspondente (ou ser taxa da plataforma)
 * - Saldo nunca pode ficar negativo
 * - Entries são imutáveis após criação
 */
@Injectable()
export class LedgerService {
  private readonly logger = new Logger(LedgerService.name);

  constructor(private readonly prisma: PrismaService) {}

  /**
   * Cria uma entrada no ledger dentro de uma transação existente
   *
   * @param tx Transação Prisma
   * @param params Dados da entrada
   */
  async createEntryInTransaction(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    params: CreateLedgerEntryParams,
  ): Promise<void> {
    await tx.ledgerEntry.create({
      data: {
        walletId: params.walletId,
        isPlatformEntry: params.isPlatformEntry || false,
        type: params.type as LedgerEntryType,
        transactionType: params.transactionType as TransactionType,
        amount: params.amount,
        balanceAfter: params.balanceAfter,
        paymentId: params.paymentId,
        payoutId: params.payoutId,
        description: params.description,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    this.logger.debug(
      `LedgerEntry criado: ${params.type} ${params.transactionType} ${params.amount} cents`,
    );
  }

  /**
   * Cria uma entrada no ledger (standalone)
   */
  async createEntry(params: CreateLedgerEntryParams): Promise<void> {
    await this.prisma.ledgerEntry.create({
      data: {
        walletId: params.walletId,
        isPlatformEntry: params.isPlatformEntry || false,
        type: params.type as LedgerEntryType,
        transactionType: params.transactionType as TransactionType,
        amount: params.amount,
        balanceAfter: params.balanceAfter,
        paymentId: params.paymentId,
        payoutId: params.payoutId,
        description: params.description,
        metadata: params.metadata as Prisma.InputJsonValue | undefined,
      },
    });

    this.logger.debug(
      `LedgerEntry criado: ${params.type} ${params.transactionType} ${params.amount} cents`,
    );
  }

  /**
   * Busca o histórico de transações de uma wallet
   */
  async getWalletHistory(
    walletId: string,
    options: {
      limit?: number;
      offset?: number;
      type?: 'CREDIT' | 'DEBIT';
      transactionType?: 'SALE' | 'PLATFORM_FEE' | 'PAYOUT' | 'REFUND' | 'ADJUSTMENT' | 'RELEASE';
    } = {},
  ) {
    const { limit = 20, offset = 0, type, transactionType } = options;

    const where: Record<string, unknown> = { walletId };

    if (type) {
      where.type = type;
    }
    if (transactionType) {
      where.transactionType = transactionType;
    }

    const [entries, total] = await Promise.all([
      this.prisma.ledgerEntry.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        include: {
          payment: {
            select: {
              id: true,
              amount: true,
              pack: {
                select: {
                  id: true,
                  title: true,
                },
              },
            },
          },
          payout: {
            select: {
              id: true,
              amount: true,
              status: true,
            },
          },
        },
      }),
      this.prisma.ledgerEntry.count({ where }),
    ]);

    return {
      entries,
      total,
      limit,
      offset,
    };
  }

  /**
   * Busca receitas da plataforma
   */
  async getPlatformRevenue(
    options: {
      startDate?: Date;
      endDate?: Date;
    } = {},
  ) {
    const { startDate, endDate } = options;

    const where: Record<string, unknown> = {
      isPlatformEntry: true,
      transactionType: 'PLATFORM_FEE',
    };

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) {
        (where.createdAt as Record<string, Date>).gte = startDate;
      }
      if (endDate) {
        (where.createdAt as Record<string, Date>).lte = endDate;
      }
    }

    const result = await this.prisma.ledgerEntry.aggregate({
      where,
      _sum: {
        amount: true,
      },
      _count: true,
    });

    return {
      totalRevenue: result._sum.amount || 0,
      transactionCount: result._count,
    };
  }

  /**
   * Verifica integridade do ledger para uma wallet
   * Soma de CREDITs - soma de DEBITs deve ser igual ao balance atual
   */
  async verifyWalletIntegrity(walletId: string): Promise<{
    isValid: boolean;
    calculatedBalance: number;
    actualBalance: number;
    difference: number;
  }> {
    const wallet = await this.prisma.wallet.findUnique({
      where: { id: walletId },
    });

    if (!wallet) {
      throw new Error(`Wallet não encontrada: ${walletId}`);
    }

    const [credits, debits] = await Promise.all([
      this.prisma.ledgerEntry.aggregate({
        where: { walletId, type: 'CREDIT' },
        _sum: { amount: true },
      }),
      this.prisma.ledgerEntry.aggregate({
        where: { walletId, type: 'DEBIT' },
        _sum: { amount: true },
      }),
    ]);

    const calculatedBalance = (credits._sum.amount || 0) - (debits._sum.amount || 0);
    const actualBalance = wallet.currentBalance + wallet.frozenBalance;
    const difference = calculatedBalance - actualBalance;

    return {
      isValid: difference === 0,
      calculatedBalance,
      actualBalance,
      difference,
    };
  }
}
