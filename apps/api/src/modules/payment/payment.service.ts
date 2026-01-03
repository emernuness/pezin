import {
  Injectable,
  Logger,
  BadRequestException,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { GatewayFactory } from './factories/gateway.factory';
import {
  PixChargeRequest,
  GatewayError,
} from './interfaces';

/**
 * Resposta do checkout PIX
 */
export interface CheckoutResponse {
  paymentId: string;
  qrCode: string;
  qrCodeText: string;
  expiresAt: Date;
  amount: number;
  pack: {
    id: string;
    title: string;
    price: number;
  };
}

/**
 * Resposta do status do pagamento
 */
export interface PaymentStatusResult {
  paymentId: string;
  status: string;
  paidAt: Date | null;
}

/**
 * PaymentService
 *
 * Responsável por orquestrar o fluxo de checkout PIX:
 * 1. Validar pack e usuário
 * 2. Calcular fees (80/20)
 * 3. Gerar cobrança PIX via gateway
 * 4. Salvar Payment no banco
 */
@Injectable()
export class PaymentService {
  private readonly logger = new Logger(PaymentService.name);
  private readonly platformFeePercent: number;
  private readonly antiFraudHoldDays: number;
  private readonly pixExpirationMinutes: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly gatewayFactory: GatewayFactory,
    private readonly configService: ConfigService,
  ) {
    this.platformFeePercent = this.configService.get<number>('PLATFORM_FEE_PERCENT') || 20;
    this.antiFraudHoldDays = this.configService.get<number>('ANTI_FRAUD_HOLD_DAYS') || 14;
    this.pixExpirationMinutes = this.configService.get<number>('PIX_EXPIRATION_MINUTES') || 60;
  }

  /**
   * Cria um checkout PIX para um pack
   *
   * @param buyerId - ID do comprador
   * @param packId - ID do pack
   * @returns Dados do PIX para pagamento
   */
  async createCheckout(buyerId: string, packId: string): Promise<CheckoutResponse> {
    // 1. Buscar pack e validar
    const pack = await this.prisma.pack.findUnique({
      where: { id: packId },
      include: {
        creator: {
          select: {
            id: true,
            displayName: true,
            email: true,
            cpf: true,
          },
        },
      },
    });

    if (!pack) {
      throw new NotFoundException('Pack não encontrado');
    }

    if (pack.status !== 'published') {
      throw new BadRequestException('Pack não está disponível para compra');
    }

    if (pack.creatorId === buyerId) {
      throw new BadRequestException('Você não pode comprar seu próprio pack');
    }

    // 2. Buscar comprador
    const buyer = await this.prisma.user.findUnique({
      where: { id: buyerId },
      select: {
        id: true,
        displayName: true,
        email: true,
        cpf: true,
      },
    });

    if (!buyer) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 3. Verificar se já existe compra pendente ou paga
    const existingPayment = await this.prisma.payment.findFirst({
      where: {
        buyerId,
        packId,
        status: { in: ['pending', 'paid'] },
      },
    });

    if (existingPayment) {
      if (existingPayment.status === 'paid') {
        throw new ConflictException('Você já comprou este pack');
      }

      // Se está pendente e ainda não expirou, retorna o mesmo
      if (existingPayment.pixExpiresAt && existingPayment.pixExpiresAt > new Date()) {
        return {
          paymentId: existingPayment.id,
          qrCode: existingPayment.pixQrCode || '',
          qrCodeText: existingPayment.pixQrCodeText || '',
          expiresAt: existingPayment.pixExpiresAt,
          amount: existingPayment.amount,
          pack: {
            id: pack.id,
            title: pack.title,
            price: pack.price,
          },
        };
      }

      // Se expirou, marcar como expirado
      await this.prisma.payment.update({
        where: { id: existingPayment.id },
        data: {
          status: 'expired',
          expiredAt: new Date(),
        },
      });
    }

    // Verificar compra legacy no Purchase (Stripe)
    const existingPurchase = await this.prisma.purchase.findFirst({
      where: {
        userId: buyerId,
        packId,
        status: 'paid',
      },
    });

    if (existingPurchase) {
      throw new ConflictException('Você já comprou este pack');
    }

    // 4. Calcular fees
    const amount = pack.price;
    const platformFee = Math.round(amount * (this.platformFeePercent / 100));
    const creatorEarnings = amount - platformFee;

    // 5. Gerar cobrança PIX via gateway
    const gateway = this.gatewayFactory.getGateway();

    const chargeRequest: PixChargeRequest = {
      amount,
      externalId: `pack-${packId}-buyer-${buyerId}-${Date.now()}`,
      description: `Pack: ${pack.title}`,
      customer: {
        name: buyer.displayName || 'Cliente',
        email: buyer.email,
        document: buyer.cpf || '',
      },
      expiresInMinutes: this.pixExpirationMinutes,
      metadata: {
        packId,
        buyerId,
        creatorId: pack.creatorId,
      },
    };

    let chargeResponse;
    try {
      chargeResponse = await gateway.generatePixCharge(chargeRequest);
    } catch (error) {
      this.logger.error('Erro ao gerar cobrança PIX', error);

      if (error instanceof GatewayError) {
        throw new BadRequestException(`Erro no gateway: ${error.message}`);
      }

      throw new BadRequestException('Não foi possível gerar o PIX. Tente novamente.');
    }

    // 6. Calcular data de disponibilidade (anti-fraude)
    const availableAt = new Date();
    availableAt.setDate(availableAt.getDate() + this.antiFraudHoldDays);

    // 7. Salvar Payment no banco
    const payment = await this.prisma.payment.create({
      data: {
        buyerId,
        creatorId: pack.creatorId,
        packId,
        amount,
        platformFee,
        creatorEarnings,
        gateway: gateway.name,
        gatewayId: chargeResponse.gatewayId,
        pixQrCode: chargeResponse.qrCode,
        pixQrCodeText: chargeResponse.qrCodeText,
        pixExpiresAt: chargeResponse.expiresAt,
        status: 'pending',
        availableAt,
      },
    });

    this.logger.log(`Checkout PIX criado: ${payment.id} para pack ${packId}`);

    return {
      paymentId: payment.id,
      qrCode: chargeResponse.qrCode,
      qrCodeText: chargeResponse.qrCodeText,
      expiresAt: chargeResponse.expiresAt,
      amount,
      pack: {
        id: pack.id,
        title: pack.title,
        price: pack.price,
      },
    };
  }

  /**
   * Consulta o status de um pagamento
   *
   * @param paymentId - ID do pagamento
   * @param userId - ID do usuário (para validação)
   * @returns Status do pagamento
   */
  async getPaymentStatus(paymentId: string, userId: string): Promise<PaymentStatusResult> {
    const payment = await this.prisma.payment.findUnique({
      where: { id: paymentId },
    });

    if (!payment) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Apenas o comprador pode ver o status
    if (payment.buyerId !== userId) {
      throw new NotFoundException('Pagamento não encontrado');
    }

    // Se está pendente, consultar gateway para atualizar
    if (payment.status === 'pending' && payment.gatewayId) {
      try {
        const gateway = this.gatewayFactory.getGateway(payment.gateway as any);
        const gatewayStatus = await gateway.getPaymentStatus(payment.gatewayId);

        // Atualizar status se mudou
        if (gatewayStatus.status !== payment.status) {
          await this.updatePaymentStatus(
            payment.id,
            gatewayStatus.status,
            gatewayStatus.paidAt,
          );

          return {
            paymentId: payment.id,
            status: gatewayStatus.status,
            paidAt: gatewayStatus.paidAt || null,
          };
        }
      } catch (error) {
        this.logger.warn(`Erro ao consultar status no gateway: ${error}`);
        // Continuar com status do banco
      }
    }

    return {
      paymentId: payment.id,
      status: payment.status,
      paidAt: payment.paidAt,
    };
  }

  /**
   * Atualiza o status de um pagamento
   * (Chamado pelo webhook ou polling)
   */
  async updatePaymentStatus(
    paymentId: string,
    status: string,
    paidAt?: Date,
  ): Promise<void> {
    const updateData: any = { status };

    if (status === 'paid' && paidAt) {
      updateData.paidAt = paidAt;
    } else if (status === 'expired') {
      updateData.expiredAt = new Date();
    } else if (status === 'refunded') {
      updateData.refundedAt = new Date();
    }

    await this.prisma.payment.update({
      where: { id: paymentId },
      data: updateData,
    });

    this.logger.log(`Payment ${paymentId} atualizado para ${status}`);
  }

  /**
   * Busca um pagamento pelo ID do gateway
   */
  async findByGatewayId(gateway: string, gatewayId: string) {
    return this.prisma.payment.findFirst({
      where: { gateway, gatewayId },
    });
  }

  /**
   * Lista pagamentos de um comprador
   */
  async listBuyerPayments(buyerId: string, options: { page?: number; limit?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { buyerId, status: 'paid' },
        include: {
          pack: {
            select: {
              id: true,
              title: true,
              previews: { take: 1 },
            },
          },
          creator: {
            select: {
              id: true,
              displayName: true,
              slug: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { buyerId, status: 'paid' } }),
    ]);

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Lista pagamentos recebidos por um criador
   */
  async listCreatorPayments(creatorId: string, options: { page?: number; limit?: number } = {}) {
    const page = options.page || 1;
    const limit = options.limit || 10;
    const skip = (page - 1) * limit;

    const [payments, total] = await Promise.all([
      this.prisma.payment.findMany({
        where: { creatorId, status: 'paid' },
        include: {
          pack: {
            select: {
              id: true,
              title: true,
            },
          },
          buyer: {
            select: {
              id: true,
              displayName: true,
            },
          },
        },
        orderBy: { paidAt: 'desc' },
        skip,
        take: limit,
      }),
      this.prisma.payment.count({ where: { creatorId, status: 'paid' } }),
    ]);

    return {
      data: payments,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}
