import { Module } from '@nestjs/common';
import { PrismaModule } from '../../prisma/prisma.module';
import { PaymentModule } from '../payment/payment.module';
import { WebhookController } from './webhook.controller';
import { WebhookService } from './webhook.service';
import { LedgerService } from './ledger.service';

/**
 * WebhookModule
 *
 * Módulo responsável por processar webhooks de gateways de pagamento.
 *
 * Funcionalidades:
 * - Recebe webhooks de SuitPay, EzzePay e Voluti
 * - Valida assinaturas
 * - Processa com idempotência (WebhookEvent)
 * - Atualiza Payment, Wallet e LedgerEntry
 *
 * Endpoints:
 * - POST /webhooks/suitpay
 * - POST /webhooks/ezzepay
 * - POST /webhooks/voluti
 */
@Module({
  imports: [PrismaModule, PaymentModule],
  controllers: [WebhookController],
  providers: [WebhookService, LedgerService],
  exports: [WebhookService, LedgerService],
})
export class WebhookModule {}
