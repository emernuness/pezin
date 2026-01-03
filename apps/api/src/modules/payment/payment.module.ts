import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SuitPayAdapter } from './adapters/suitpay.adapter';
import { EzzePayAdapter } from './adapters/ezzepay.adapter';
import { VolutiAdapter } from './adapters/voluti.adapter';
import { GatewayFactory } from './factories/gateway.factory';

/**
 * Módulo de Pagamentos - Gateway Agnostic
 *
 * Este módulo fornece a infraestrutura para integração com múltiplos
 * gateways de pagamento PIX (SuitPay, EzzePay, Voluti).
 *
 * O gateway ativo é selecionado via ENV_CURRENT_GATEWAY.
 *
 * @example
 * ```typescript
 * // Injetar o factory em qualquer service
 * constructor(private readonly gatewayFactory: GatewayFactory) {}
 *
 * // Usar o gateway ativo
 * const gateway = this.gatewayFactory.getGateway();
 * const charge = await gateway.generatePixCharge(request);
 * ```
 */
@Module({
  imports: [ConfigModule],
  providers: [
    // Adapters (um para cada gateway)
    SuitPayAdapter,
    EzzePayAdapter,
    VolutiAdapter,

    // Factory que seleciona o gateway ativo
    GatewayFactory,
  ],
  exports: [
    // Exportar factory para uso em outros módulos
    GatewayFactory,

    // Exportar adapters individuais para casos específicos
    SuitPayAdapter,
    EzzePayAdapter,
    VolutiAdapter,
  ],
})
export class PaymentModule {}
