import {
  Injectable,
  Logger,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayFactory } from '../payment/factories/gateway.factory';
import { PixKeyType } from '../payment/interfaces';
import { WalletService } from './wallet.service';
import { LedgerService } from '../webhook/ledger.service';
import { Prisma } from '@prisma/client';

interface PayoutRequest {
  userId: string;
  amount: number;
}

interface PayoutResult {
  payoutId: string;
  amount: number;
  status: string;
  estimatedCompletionAt?: Date;
}

/**
 * PayoutService
 *
 * Gerencia saques (payouts) via PIX para criadores.
 *
 * Fluxo:
 * 1. Validar saldo disponível
 * 2. Verificar dados PIX do usuário
 * 3. Reservar saldo (row lock)
 * 4. Chamar API do gateway
 * 5. Criar registro de Payout
 * 6. Webhook atualiza status
 */
@Injectable()
export class PayoutService {
  private readonly logger = new Logger(PayoutService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gatewayFactory: GatewayFactory,
    private readonly walletService: WalletService,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Solicita um saque via PIX
   *
   * Usa row locking para prevenir race conditions
   */
  async requestPayout(request: PayoutRequest): Promise<PayoutResult> {
    const { userId, amount } = request;

    // 1. Validar valor do saque
    await this.walletService.validatePayoutAmount(userId, amount);

    // 2. Obter dados PIX do usuário
    const pixInfo = await this.walletService.getUserPixInfo(userId);

    // 3. Obter gateway ativo
    const gateway = this.gatewayFactory.getGateway();
    const gatewayName = this.gatewayFactory.getCurrentGatewayName();

    // 4. Executar transação com row lock
    const payout = await this.prisma.$transaction(
      async (tx) => {
        // Buscar wallet com lock para evitar race conditions
        const wallet = await tx.$queryRaw<Array<{ id: string; userId: string; currentBalance: number; frozenBalance: number }>>`
          SELECT id, "userId", "currentBalance", "frozenBalance"
          FROM "Wallet"
          WHERE "userId" = ${userId}
          FOR UPDATE
        `;

        if (!wallet || wallet.length === 0) {
          throw new BadRequestException('Wallet não encontrada');
        }

        const userWallet = wallet[0];

        // Verificar saldo novamente com lock
        if (userWallet.currentBalance < amount) {
          throw new ConflictException(
            'Saldo insuficiente. Tente novamente.',
          );
        }

        // Debitar do saldo
        await tx.wallet.update({
          where: { id: userWallet.id },
          data: {
            currentBalance: userWallet.currentBalance - amount,
          },
        });

        // Gerar ID único para o payout
        const externalId = `payout_${userId}_${Date.now()}`;

        // Criar registro de payout (status pending)
        const createdPayout = await tx.payout.create({
          data: {
            creatorId: userId,
            walletId: userWallet.id,
            amount,
            gateway: gatewayName,
            pixKey: pixInfo.pixKey,
            pixKeyType: pixInfo.pixKeyType,
            recipientName: pixInfo.recipientName || '',
            recipientDocument: pixInfo.recipientDocument || '',
            status: 'pending',
          },
        });

        // Registrar LedgerEntry de débito
        await this.ledgerService.createEntryInTransaction(tx, {
          walletId: userWallet.id,
          type: 'DEBIT',
          transactionType: 'PAYOUT',
          amount,
          balanceAfter: userWallet.currentBalance - amount,
          payoutId: createdPayout.id,
          description: `Saque via PIX: ${pixInfo.pixKeyType} ${this.maskPixKey(pixInfo.pixKey)}`,
        });

        return { payout: createdPayout, externalId };
      },
      {
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
        timeout: 10000,
      },
    );

    // 5. Chamar API do gateway (fora da transação)
    try {
      const gatewayResponse = await gateway.executePayout({
        amount,
        externalId: payout.externalId,
        pixKey: pixInfo.pixKey,
        pixKeyType: pixInfo.pixKeyType as PixKeyType,
        recipientName: pixInfo.recipientName || '',
        recipientDocument: pixInfo.recipientDocument || '',
        description: 'Saque Pack do Pezin',
      });

      // Atualizar payout com ID do gateway
      await this.prisma.payout.update({
        where: { id: payout.payout.id },
        data: {
          gatewayId: gatewayResponse.gatewayId,
          status: 'processing',
        },
      });

      this.logger.log(
        `Payout solicitado: ${payout.payout.id}, gatewayId: ${gatewayResponse.gatewayId}`,
      );

      return {
        payoutId: payout.payout.id,
        amount,
        status: 'processing',
        estimatedCompletionAt: gatewayResponse.estimatedCompletionAt,
      };
    } catch (error) {
      // Em caso de falha na API, reverter o débito
      this.logger.error(`Erro ao chamar gateway para payout: ${payout.payout.id}`, error);

      await this.revertPayout(payout.payout.id, 'Falha na comunicação com o gateway');

      throw new BadRequestException(
        'Não foi possível processar o saque. Tente novamente.',
      );
    }
  }

  /**
   * Reverte um payout em caso de falha
   */
  private async revertPayout(payoutId: string, reason: string): Promise<void> {
    await this.prisma.$transaction(async (tx) => {
      const payout = await tx.payout.findUnique({
        where: { id: payoutId },
        include: { wallet: true },
      });

      if (!payout || !payout.wallet) {
        return;
      }

      // Atualizar status do payout
      await tx.payout.update({
        where: { id: payoutId },
        data: {
          status: 'failed',
          failureReason: reason,
        },
      });

      // Devolver saldo
      await tx.wallet.update({
        where: { id: payout.walletId },
        data: {
          currentBalance: payout.wallet.currentBalance + payout.amount,
        },
      });

      // Registrar estorno no ledger
      await tx.ledgerEntry.create({
        data: {
          walletId: payout.walletId,
          type: 'CREDIT',
          transactionType: 'ADJUSTMENT',
          amount: payout.amount,
          balanceAfter: payout.wallet.currentBalance + payout.amount,
          payoutId: payout.id,
          description: `Estorno de saque: ${reason}`,
        },
      });
    });

    this.logger.log(`Payout revertido: ${payoutId}`);
  }

  /**
   * Lista payouts do usuário
   */
  async listPayouts(
    userId: string,
    options: { page?: number; limit?: number } = {},
  ) {
    const { page = 1, limit = 20 } = options;
    const skip = (page - 1) * limit;

    const [payouts, total] = await Promise.all([
      this.prisma.payout.findMany({
        where: { creatorId: userId },
        orderBy: { requestedAt: 'desc' },
        take: limit,
        skip,
        select: {
          id: true,
          amount: true,
          pixKey: true,
          pixKeyType: true,
          status: true,
          requestedAt: true,
          completedAt: true,
          failureReason: true,
        },
      }),
      this.prisma.payout.count({ where: { creatorId: userId } }),
    ]);

    return {
      payouts: payouts.map((p) => ({
        ...p,
        maskedPixKey: this.maskPixKey(p.pixKey),
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  /**
   * Obtém detalhes de um payout
   */
  async getPayoutDetails(payoutId: string, userId: string) {
    const payout = await this.prisma.payout.findFirst({
      where: {
        id: payoutId,
        creatorId: userId,
      },
    });

    if (!payout) {
      throw new BadRequestException('Saque não encontrado');
    }

    return {
      ...payout,
      maskedPixKey: this.maskPixKey(payout.pixKey),
    };
  }

  /**
   * Mascara a chave PIX para exibição
   */
  private maskPixKey(pixKey: string): string {
    if (!pixKey) return '';

    if (pixKey.includes('@')) {
      // Email
      const [local, domain] = pixKey.split('@');
      return `${local.slice(0, 2)}***@${domain}`;
    }

    if (pixKey.length === 11) {
      // CPF
      return `***.***.${pixKey.slice(6, 9)}-**`;
    }

    if (pixKey.length === 14) {
      // CNPJ
      return `**.***.***/****-**`;
    }

    if (pixKey.startsWith('+55')) {
      // Telefone
      return `+55 (**) *****-${pixKey.slice(-4)}`;
    }

    // EVP ou outro - mostrar início e fim
    return `${pixKey.slice(0, 4)}...${pixKey.slice(-4)}`;
  }
}
