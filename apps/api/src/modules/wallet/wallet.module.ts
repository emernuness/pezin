import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { PrismaModule } from '../../prisma/prisma.module';
import { WebhookModule } from '../webhook/webhook.module';
import { WalletController } from './wallet.controller';
import { WalletService } from './wallet.service';

/**
 * WalletModule
 *
 * Módulo de carteira virtual para criadores.
 *
 * Funcionalidades:
 * - Consulta de saldo (disponível/congelado)
 * - Histórico de transações
 * - CRON job para liberar saldos após 14 dias
 *
 * Endpoints:
 * - GET /wallet/balance
 * - GET /wallet/summary
 * - GET /wallet/transactions
 */
@Module({
  imports: [
    PrismaModule,
    WebhookModule, // Para LedgerService
    ScheduleModule.forRoot(), // Para CRON jobs
  ],
  controllers: [WalletController],
  providers: [WalletService],
  exports: [WalletService],
})
export class WalletModule {}
