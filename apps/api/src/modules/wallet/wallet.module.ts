import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebhookModule } from '../webhook/webhook.module';
import { PaymentModule } from '../payment/payment.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';
import { PayoutService } from './payout.service';

/**
 * WalletModule
 *
 * Módulo de carteira virtual para criadores.
 *
 * Funcionalidades:
 * - Consulta de saldo (disponível/congelado)
 * - Histórico de transações
 * - CRON job para liberar saldos após 14 dias
 * - Saques via PIX
 *
 * Endpoints:
 * - GET /wallet/balance
 * - GET /wallet/summary
 * - GET /wallet/transactions
 * - POST /wallet/payout
 * - GET /wallet/payouts
 * - GET /wallet/payouts/:id
 */
@Module({
  imports: [
    PrismaModule,
    WebhookModule, // Para LedgerService
    PaymentModule, // Para GatewayFactory
    ScheduleModule.forRoot(), // Para CRON jobs
  ],
  controllers: [WalletController],
  providers: [WalletService, PayoutService],
  exports: [WalletService, PayoutService],
})
export class WalletModule {}
