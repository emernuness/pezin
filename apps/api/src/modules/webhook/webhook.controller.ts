import {
  Controller,
  Post,
  Headers,
  Req,
  Logger,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { Request } from 'express';
import { WebhookService } from './webhook.service';
import { GATEWAY_NAMES } from '../payment/interfaces';

/**
 * WebhookController
 *
 * Recebe webhooks de todos os gateways de pagamento.
 * Cada gateway tem seu endpoint específico.
 *
 * Endpoints:
 * - POST /webhooks/suitpay
 * - POST /webhooks/ezzepay
 * - POST /webhooks/voluti
 *
 * Headers esperados:
 * - SuitPay: X-Webhook-Signature
 * - EzzePay: X-Signature
 * - Voluti: X-Voluti-Signature
 */
@Controller('webhooks')
export class WebhookController {
  private readonly logger = new Logger(WebhookController.name);

  constructor(private readonly webhookService: WebhookService) {}

  /**
   * Webhook do SuitPay
   */
  @Post('suitpay')
  @HttpCode(HttpStatus.OK)
  async handleSuitPayWebhook(
    @Req() req: Request,
    @Headers('x-webhook-signature') signature: string,
  ) {
    this.logger.log('Webhook recebido: SuitPay');

    const payload = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!payload) {
      this.logger.error('Raw body não disponível para webhook SuitPay');
      return { success: false, message: 'Raw body não disponível' };
    }

    return this.webhookService.processWebhook(
      GATEWAY_NAMES.SUITPAY,
      payload,
      signature || '',
    );
  }

  /**
   * Webhook do EzzePay
   */
  @Post('ezzepay')
  @HttpCode(HttpStatus.OK)
  async handleEzzePayWebhook(
    @Req() req: Request,
    @Headers('x-signature') signature: string,
  ) {
    this.logger.log('Webhook recebido: EzzePay');

    const payload = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!payload) {
      this.logger.error('Raw body não disponível para webhook EzzePay');
      return { success: false, message: 'Raw body não disponível' };
    }

    return this.webhookService.processWebhook(
      GATEWAY_NAMES.EZZEPAY,
      payload,
      signature || '',
    );
  }

  /**
   * Webhook do Voluti
   */
  @Post('voluti')
  @HttpCode(HttpStatus.OK)
  async handleVolutiWebhook(
    @Req() req: Request,
    @Headers('x-voluti-signature') signature: string,
  ) {
    this.logger.log('Webhook recebido: Voluti');

    const payload = (req as Request & { rawBody?: Buffer }).rawBody;
    if (!payload) {
      this.logger.error('Raw body não disponível para webhook Voluti');
      return { success: false, message: 'Raw body não disponível' };
    }

    return this.webhookService.processWebhook(
      GATEWAY_NAMES.VOLUTI,
      payload,
      signature || '',
    );
  }
}
