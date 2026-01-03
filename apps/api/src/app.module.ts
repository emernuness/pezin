import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { LoggerModule } from 'nestjs-pino';
import { RawBodyMiddleware } from './common/middleware/raw-body.middleware';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { StripeModule } from './modules/stripe/stripe.module';
import { PaymentModule } from './modules/payment/payment.module';
import { WebhookModule } from './modules/webhook/webhook.module';
import { PacksModule } from './modules/packs/packs.module';
import { PublicModule } from './modules/public/public.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { PurchasesModule } from './modules/purchases/purchases.module';
import { AssetsModule } from './modules/assets/assets.module';
import { MediaModule } from './modules/media/media.module';
import { MediaTokenModule } from './modules/media-token/media-token.module';
import { HealthController } from './modules/health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    LoggerModule.forRoot({
      pinoHttp: {
        transport:
          process.env.NODE_ENV === 'development'
            ? {
                target: 'pino-pretty',
                options: {
                  colorize: true,
                  singleLine: true,
                },
              }
            : undefined,
        level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
        serializers: {
          req: (req) => ({
            id: req.id,
            method: req.method,
            url: req.url,
          }),
          res: (res) => ({
            statusCode: res.statusCode,
          }),
        },
      },
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 100,
      },
      {
        name: 'auth',
        ttl: 60000,
        limit: 10,
      },
    ]),
    PrismaModule,
    MediaModule,
    MediaTokenModule,
    AuthModule,
    StripeModule,    // Legacy - será removido na Sprint 8
    PaymentModule,   // Gateway Agnostic - novo sistema
    WebhookModule,   // Webhooks de todos os gateways
    PacksModule,
    PublicModule,
    DashboardModule,
    PurchasesModule,
    AssetsModule,
  ],
  controllers: [HealthController],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply raw body middleware to webhook routes
    // Stripe (legacy) e novos gateways PIX
    consumer.apply(RawBodyMiddleware).forRoutes(
      'webhooks/stripe',
      'webhooks/suitpay',
      'webhooks/ezzepay',
      'webhooks/voluti',
    );
  }
}
