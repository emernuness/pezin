import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron, CronExpression } from '@nestjs/schedule';
import { LedgerService } from '../webhook/ledger.service';

interface WalletBalance {
  available: number;
  frozen: number;
  total: number;
}

interface WalletSummary {
  balance: WalletBalance;
  pendingPayouts: number;
  totalEarnings: number;
  totalPayouts: number;
}

/**
 * WalletService
 *
 * Gerencia carteiras virtuais dos criadores.
 * Responsável por:
 * - Consultar saldos
 * - Liberar saldos congelados (CRON)
 * - Preparar dados para saques
 */
@Injectable()
export class WalletService {
  private readonly logger = new Logger(WalletService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Obtém ou cria uma wallet para um usuário
   */
  async getOrCreateWallet(userId: string) {
    let wallet = await this.prisma.wallet.findUnique({
      where: { userId },
    });

    if (!wallet) {
      wallet = await this.prisma.wallet.create({
        data: {
          userId,
          currentBalance: 0,
          frozenBalance: 0,
        },
      });
      this.logger.log(`Wallet criada para usuário: ${userId}`);
    }

    return wallet;
  }

  /**
   * Obtém o saldo de um usuário
   */
  async getBalance(userId: string): Promise<WalletBalance> {
    const wallet = await this.getOrCreateWallet(userId);

    return {
      available: wallet.currentBalance,
      frozen: wallet.frozenBalance,
      total: wallet.currentBalance + wallet.frozenBalance,
    };
  }

  /**
   * Obtém resumo completo da carteira
   */
  async getWalletSummary(userId: string): Promise<WalletSummary> {
    const wallet = await this.getOrCreateWallet(userId);

    // Buscar payouts pendentes
    const pendingPayouts = await this.prisma.payout.aggregate({
      where: {
        creatorId: userId,
        status: { in: ['pending', 'processing'] },
      },
      _sum: { amount: true },
    });

    // Buscar total de ganhos
    const totalEarnings = await this.prisma.ledgerEntry.aggregate({
      where: {
        walletId: wallet.id,
        type: 'CREDIT',
        transactionType: 'SALE',
      },
      _sum: { amount: true },
    });

    // Buscar total de saques
    const totalPayouts = await this.prisma.ledgerEntry.aggregate({
      where: {
        walletId: wallet.id,
        type: 'DEBIT',
        transactionType: 'PAYOUT',
      },
      _sum: { amount: true },
    });

    return {
      balance: {
        available: wallet.currentBalance,
        frozen: wallet.frozenBalance,
        total: wallet.currentBalance + wallet.frozenBalance,
      },
      pendingPayouts: pendingPayouts._sum.amount || 0,
      totalEarnings: totalEarnings._sum.amount || 0,
      totalPayouts: totalPayouts._sum.amount || 0,
    };
  }

  /**
   * Obtém histórico de transações
   */
  async getTransactionHistory(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const offset = (page - 1) * limit;

    const wallet = await this.getOrCreateWallet(userId);

    const history = await this.ledgerService.getWalletHistory(wallet.id, {
      limit,
      offset,
    });

    return {
      transactions: history.entries.map((entry) => ({
        id: entry.id,
        type: entry.type,
        transactionType: entry.transactionType,
        amount: entry.amount,
        description: entry.description,
        createdAt: entry.createdAt,
        payment: entry.payment
          ? {
              id: entry.payment.id,
              packTitle: entry.payment.pack?.title,
            }
          : null,
        payout: entry.payout
          ? {
              id: entry.payout.id,
              status: entry.payout.status,
            }
          : null,
      })),
      pagination: {
        total: history.total,
        page,
        limit,
        totalPages: Math.ceil(history.total / limit),
      },
    };
  }

  /**
   * Verifica se usuário tem saldo suficiente para saque
   */
  async validatePayoutAmount(userId: string, amount: number): Promise<void> {
    const balance = await this.getBalance(userId);

    if (amount > balance.available) {
      throw new BadRequestException(
        `Saldo insuficiente. Disponível: R$ ${(balance.available / 100).toFixed(2)}`,
      );
    }

    const minPayout = 5000; // R$ 50.00 em centavos
    if (amount < minPayout) {
      throw new BadRequestException('Valor mínimo para saque é R$ 50,00');
    }
  }

  /**
   * Busca dados da chave PIX do usuário
   */
  async getUserPixInfo(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: {
        pixKey: true,
        pixKeyType: true,
        fullName: true,
        cpf: true,
      },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    if (!user.pixKey || !user.pixKeyType) {
      throw new BadRequestException(
        'Chave PIX não configurada. Configure sua chave PIX nas configurações.',
      );
    }

    return {
      pixKey: user.pixKey,
      pixKeyType: user.pixKeyType,
      recipientName: user.fullName,
      recipientDocument: user.cpf,
    };
  }

  /**
   * CRON Job: Libera saldos congelados após 14 dias
   *
   * Executa a cada hora para processar pagamentos que completaram
   * o período de anti-fraude.
   */
  @Cron(CronExpression.EVERY_HOUR)
  async releaseFrozenBalances(): Promise<void> {
    this.logger.log('Iniciando liberação de saldos congelados...');

    const now = new Date();

    // Buscar payments pagos que ainda não tiveram saldo liberado
    // e já passaram da data de disponibilidade
    const paymentsToRelease = await this.prisma.payment.findMany({
      where: {
        status: 'paid',
        balanceReleased: false,
        availableAt: { lte: now },
      },
      include: {
        creator: {
          include: {
            wallet: true,
          },
        },
      },
    });

    if (paymentsToRelease.length === 0) {
      this.logger.log('Nenhum saldo para liberar');
      return;
    }

    this.logger.log(`Liberando ${paymentsToRelease.length} pagamentos...`);

    for (const payment of paymentsToRelease) {
      try {
        await this.prisma.$transaction(async (tx) => {
          const wallet = payment.creator.wallet;

          if (!wallet) {
            this.logger.warn(`Wallet não encontrada para criador: ${payment.creatorId}`);
            return;
          }

          // Mover saldo de frozen para available
          const newFrozenBalance = wallet.frozenBalance - payment.creatorEarnings;
          const newCurrentBalance = wallet.currentBalance + payment.creatorEarnings;

          await tx.wallet.update({
            where: { id: wallet.id },
            data: {
              frozenBalance: Math.max(0, newFrozenBalance),
              currentBalance: newCurrentBalance,
            },
          });

          // Marcar payment como liberado
          await tx.payment.update({
            where: { id: payment.id },
            data: { balanceReleased: true },
          });

          // Registrar LedgerEntry de liberação
          await tx.ledgerEntry.create({
            data: {
              walletId: wallet.id,
              type: 'CREDIT',
              transactionType: 'RELEASE',
              amount: 0, // Não altera o total, apenas move frozen → available
              balanceAfter: newCurrentBalance + newFrozenBalance,
              paymentId: payment.id,
              description: `Liberação de saldo: Pack ${payment.packId}`,
              metadata: {
                previousFrozen: wallet.frozenBalance,
                newFrozen: newFrozenBalance,
                released: payment.creatorEarnings,
              },
            },
          });
        });

        this.logger.log(`Saldo liberado: Payment ${payment.id}, valor: ${payment.creatorEarnings}`);
      } catch (error) {
        this.logger.error(`Erro ao liberar saldo do payment ${payment.id}:`, error);
      }
    }

    this.logger.log('Liberação de saldos concluída');
  }
}
