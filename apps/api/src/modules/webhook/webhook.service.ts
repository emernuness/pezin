import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayFactory } from '../payment/factories/gateway.factory';
import { GatewayName, ParsedWebhookEvent } from '../payment/interfaces';
import { LedgerService } from './ledger.service';

/**
 * WebhookService
 *
 * Processa webhooks de todos os gateways de pagamento com:
 * - Validação de assinatura
 * - Idempotência (WebhookEvent)
 * - Transações ACID
 * - Integração com Ledger
 */
@Injectable()
export class WebhookService {
  private readonly logger = new Logger(WebhookService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly gatewayFactory: GatewayFactory,
    private readonly ledgerService: LedgerService,
  ) {}

  /**
   * Processa webhook de qualquer gateway
   *
   * @param gatewayName Nome do gateway (suitpay, ezzepay, voluti)
   * @param payload Raw body do webhook
   * @param signature Assinatura do webhook (header)
   */
  async processWebhook(
    gatewayName: GatewayName,
    payload: Buffer,
    signature: string,
  ): Promise<{ success: boolean; message: string }> {
    const gateway = this.gatewayFactory.getGateway(gatewayName);

    // 1. Validar assinatura
    const isValid = gateway.validateWebhookSignature(payload, signature);
    if (!isValid) {
      this.logger.warn(`Webhook inválido: assinatura incorreta [${gatewayName}]`);
      throw new BadRequestException('Assinatura inválida');
    }

    // 2. Parse do evento
    const event = gateway.parseWebhookEvent(payload);
    this.logger.log(`Webhook recebido: ${event.type} [${gatewayName}] gatewayId=${event.gatewayId}`);

    // 3. Verificar idempotência
    const existingEvent = await this.prisma.webhookEvent.findUnique({
      where: {
        gateway_gatewayEventId: {
          gateway: gatewayName,
          gatewayEventId: event.eventId,
        },
      },
    });

    if (existingEvent) {
      this.logger.log(`Webhook duplicado ignorado: ${event.eventId}`);
      return { success: true, message: 'Evento já processado' };
    }

    // 4. Processar evento com transação
    try {
      await this.prisma.$transaction(async (tx) => {
        // Registrar evento para idempotência
        await tx.webhookEvent.create({
          data: {
            gateway: gatewayName,
            gatewayEventId: event.eventId,
            eventType: event.type,
            payload: JSON.stringify(event.data),
            processed: true,
            processedAt: new Date(),
          },
        });

        // Processar baseado no tipo
        await this.handleEvent(tx, event, gatewayName);
      });

      this.logger.log(`Webhook processado com sucesso: ${event.eventId}`);
      return { success: true, message: 'Evento processado' };
    } catch (error) {
      this.logger.error(`Erro ao processar webhook: ${event.eventId}`, error);
      throw error;
    }
  }

  /**
   * Processa evento baseado no tipo
   */
  private async handleEvent(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
    gateway: string,
  ): Promise<void> {
    switch (event.type) {
      case 'payment.paid':
        await this.handlePaymentPaid(tx, event, gateway);
        break;

      case 'payment.expired':
        await this.handlePaymentExpired(tx, event);
        break;

      case 'payment.cancelled':
        await this.handlePaymentCancelled(tx, event);
        break;

      case 'payment.refunded':
        await this.handlePaymentRefunded(tx, event, gateway);
        break;

      case 'payout.completed':
        await this.handlePayoutCompleted(tx, event);
        break;

      case 'payout.failed':
        await this.handlePayoutFailed(tx, event);
        break;

      case 'payout.processing':
        await this.handlePayoutProcessing(tx, event);
        break;

      default:
        this.logger.warn(`Tipo de evento não tratado: ${event.type}`);
    }
  }

  /**
   * Pagamento confirmado
   * - Atualiza Payment status
   * - Cria/atualiza Wallet do criador
   * - Registra LedgerEntry (CREDIT frozen)
   * - Registra LedgerEntry (CREDIT platform fee)
   */
  private async handlePaymentPaid(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
    gateway: string,
  ): Promise<void> {
    // Buscar payment pelo gatewayId
    const payment = await tx.payment.findFirst({
      where: {
        gatewayId: event.gatewayId,
        gateway,
      },
      include: {
        creator: true,
      },
    });

    if (!payment) {
      this.logger.warn(`Payment não encontrado: gatewayId=${event.gatewayId}`);
      return;
    }

    if (payment.status === 'paid') {
      this.logger.log(`Payment já está pago: ${payment.id}`);
      return;
    }

    // Atualizar payment
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'paid',
        paidAt: event.timestamp,
      },
    });

    // Garantir que o criador tem wallet
    let wallet = await tx.wallet.findUnique({
      where: { userId: payment.creatorId },
    });

    if (!wallet) {
      wallet = await tx.wallet.create({
        data: {
          userId: payment.creatorId,
          currentBalance: 0,
          frozenBalance: 0,
        },
      });
    }

    // Adicionar ao saldo congelado (será liberado após 14 dias)
    const newFrozenBalance = wallet.frozenBalance + payment.creatorEarnings;

    await tx.wallet.update({
      where: { id: wallet.id },
      data: {
        frozenBalance: newFrozenBalance,
      },
    });

    // Registrar LedgerEntry para o criador (CREDIT frozen)
    await this.ledgerService.createEntryInTransaction(tx, {
      walletId: wallet.id,
      type: 'CREDIT',
      transactionType: 'SALE',
      amount: payment.creatorEarnings,
      balanceAfter: wallet.currentBalance + newFrozenBalance,
      paymentId: payment.id,
      description: `Venda: Pack ${payment.packId}`,
      metadata: {
        frozen: true,
        availableAt: payment.availableAt.toISOString(),
      },
    });

    // Registrar LedgerEntry para a plataforma (taxa)
    await this.ledgerService.createEntryInTransaction(tx, {
      isPlatformEntry: true,
      type: 'CREDIT',
      transactionType: 'PLATFORM_FEE',
      amount: payment.platformFee,
      balanceAfter: 0, // Plataforma não tem wallet, apenas registro
      paymentId: payment.id,
      description: `Taxa de plataforma: Pack ${payment.packId}`,
    });

    this.logger.log(`Payment confirmado: ${payment.id}, creatorEarnings=${payment.creatorEarnings}`);
  }

  /**
   * Pagamento expirado
   */
  private async handlePaymentExpired(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
  ): Promise<void> {
    await tx.payment.updateMany({
      where: {
        gatewayId: event.gatewayId,
        status: 'pending',
      },
      data: {
        status: 'expired',
      },
    });

    this.logger.log(`Payment expirado: gatewayId=${event.gatewayId}`);
  }

  /**
   * Pagamento cancelado
   */
  private async handlePaymentCancelled(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
  ): Promise<void> {
    await tx.payment.updateMany({
      where: {
        gatewayId: event.gatewayId,
        status: 'pending',
      },
      data: {
        status: 'cancelled',
      },
    });

    this.logger.log(`Payment cancelado: gatewayId=${event.gatewayId}`);
  }

  /**
   * Pagamento reembolsado
   * - Atualiza Payment status
   * - Debita da Wallet do criador
   * - Registra LedgerEntry (DEBIT)
   */
  private async handlePaymentRefunded(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
    gateway: string,
  ): Promise<void> {
    const payment = await tx.payment.findFirst({
      where: {
        gatewayId: event.gatewayId,
        gateway,
        status: 'paid',
      },
    });

    if (!payment) {
      this.logger.warn(`Payment não encontrado para reembolso: gatewayId=${event.gatewayId}`);
      return;
    }

    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: 'refunded',
      },
    });

    // Debitar da wallet do criador
    const wallet = await tx.wallet.findUnique({
      where: { userId: payment.creatorId },
    });

    if (wallet) {
      // Verificar se o saldo ainda está frozen ou já foi liberado
      if (payment.balanceReleased) {
        // Debitar do saldo disponível
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            currentBalance: wallet.currentBalance - payment.creatorEarnings,
          },
        });
      } else {
        // Debitar do saldo congelado
        await tx.wallet.update({
          where: { id: wallet.id },
          data: {
            frozenBalance: wallet.frozenBalance - payment.creatorEarnings,
          },
        });
      }

      // Registrar LedgerEntry de estorno
      await this.ledgerService.createEntryInTransaction(tx, {
        walletId: wallet.id,
        type: 'DEBIT',
        transactionType: 'REFUND',
        amount: payment.creatorEarnings,
        balanceAfter: payment.balanceReleased
          ? wallet.currentBalance - payment.creatorEarnings
          : wallet.currentBalance,
        paymentId: payment.id,
        description: `Reembolso: Pack ${payment.packId}`,
      });
    }

    this.logger.log(`Payment reembolsado: ${payment.id}`);
  }

  /**
   * Payout (saque) completado
   */
  private async handlePayoutCompleted(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
  ): Promise<void> {
    await tx.payout.updateMany({
      where: {
        gatewayId: event.gatewayId,
        status: { in: ['pending', 'processing'] },
      },
      data: {
        status: 'completed',
        completedAt: event.timestamp,
      },
    });

    this.logger.log(`Payout completado: gatewayId=${event.gatewayId}`);
  }

  /**
   * Payout (saque) falhou
   */
  private async handlePayoutFailed(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
  ): Promise<void> {
    const payout = await tx.payout.findFirst({
      where: {
        gatewayId: event.gatewayId,
      },
    });

    if (!payout) {
      this.logger.warn(`Payout não encontrado: gatewayId=${event.gatewayId}`);
      return;
    }

    // Atualizar payout
    await tx.payout.update({
      where: { id: payout.id },
      data: {
        status: 'failed',
        failureReason: (event.data as Record<string, unknown>)?.error_message as string || 'Falha no processamento',
      },
    });

    // Devolver saldo para a wallet
    const wallet = await tx.wallet.findUnique({
      where: { id: payout.walletId },
    });

    if (wallet) {
      await tx.wallet.update({
        where: { id: wallet.id },
        data: {
          currentBalance: wallet.currentBalance + payout.amount,
        },
      });

      // Registrar LedgerEntry de estorno do saque
      await this.ledgerService.createEntryInTransaction(tx, {
        walletId: wallet.id,
        type: 'CREDIT',
        transactionType: 'ADJUSTMENT',
        amount: payout.amount,
        balanceAfter: wallet.currentBalance + payout.amount,
        payoutId: payout.id,
        description: 'Estorno de saque falho',
      });
    }

    this.logger.log(`Payout falhou: ${payout.id}, reason=${payout.failureReason}`);
  }

  /**
   * Payout em processamento
   */
  private async handlePayoutProcessing(
    tx: Parameters<Parameters<typeof this.prisma.$transaction>[0]>[0],
    event: ParsedWebhookEvent,
  ): Promise<void> {
    await tx.payout.updateMany({
      where: {
        gatewayId: event.gatewayId,
        status: 'pending',
      },
      data: {
        status: 'processing',
      },
    });

    this.logger.log(`Payout em processamento: gatewayId=${event.gatewayId}`);
  }
}
