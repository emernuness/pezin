import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  UseGuards,
  Logger,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { ZodValidationPipe } from '../../common/pipes/zod-validation.pipe';
import { PaymentService } from './payment.service';
import {
  createPixCheckoutSchema,
  CreatePixCheckoutInput,
} from '@pack-do-pezin/shared';

/**
 * PaymentController
 *
 * Endpoints para checkout PIX e consulta de pagamentos.
 *
 * Endpoints:
 * - POST /payment/checkout - Criar checkout PIX
 * - GET /payment/:id/status - Consultar status do pagamento
 * - GET /payment/my-purchases - Listar minhas compras
 */
@Controller('payment')
@UseGuards(JwtAuthGuard)
export class PaymentController {
  private readonly logger = new Logger(PaymentController.name);

  constructor(private readonly paymentService: PaymentService) {}

  /**
   * Cria um checkout PIX para um pack
   *
   * @returns QR Code e dados do PIX
   */
  @Post('checkout')
  async createCheckout(
    @Body(new ZodValidationPipe(createPixCheckoutSchema)) body: CreatePixCheckoutInput,
    @CurrentUser() user: { id: string },
  ) {
    this.logger.log(`Checkout PIX: user=${user.id} pack=${body.packId}`);

    const result = await this.paymentService.createCheckout(user.id, body.packId);

    return {
      success: true,
      data: {
        paymentId: result.paymentId,
        qrCode: result.qrCode,
        qrCodeText: result.qrCodeText,
        expiresAt: result.expiresAt.toISOString(),
        amount: result.amount,
        pack: result.pack,
      },
    };
  }

  /**
   * Consulta o status de um pagamento
   */
  @Get(':id/status')
  async getPaymentStatus(
    @Param('id') paymentId: string,
    @CurrentUser() user: { id: string },
  ) {
    const result = await this.paymentService.getPaymentStatus(paymentId, user.id);

    return {
      success: true,
      data: {
        paymentId: result.paymentId,
        status: result.status,
        paidAt: result.paidAt?.toISOString() || null,
      },
    };
  }

  /**
   * Lista compras do usuário (packs que ele comprou)
   */
  @Get('my-purchases')
  async listMyPurchases(@CurrentUser() user: { id: string }) {
    const result = await this.paymentService.listBuyerPayments(user.id);

    return {
      success: true,
      data: result.data.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        paidAt: payment.paidAt?.toISOString(),
        pack: {
          id: payment.pack.id,
          title: payment.pack.title,
          preview: payment.pack.previews[0]?.url || null,
        },
        creator: {
          id: payment.creator.id,
          displayName: payment.creator.displayName,
          slug: payment.creator.slug,
        },
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }

  /**
   * Lista vendas do criador (packs que ele vendeu)
   */
  @Get('my-sales')
  async listMySales(@CurrentUser() user: { id: string }) {
    const result = await this.paymentService.listCreatorPayments(user.id);

    return {
      success: true,
      data: result.data.map((payment) => ({
        id: payment.id,
        amount: payment.amount,
        creatorEarnings: payment.creatorEarnings,
        paidAt: payment.paidAt?.toISOString(),
        pack: {
          id: payment.pack.id,
          title: payment.pack.title,
        },
        buyer: {
          id: payment.buyer.id,
          displayName: payment.buyer.displayName,
        },
      })),
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      },
    };
  }
}
