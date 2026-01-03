import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentGateway,
  GATEWAY_NAMES,
  GatewayName,
  GatewayError,
} from '../interfaces';
import { SuitPayAdapter } from '../adapters/suitpay.adapter';
import { EzzePayAdapter } from '../adapters/ezzepay.adapter';
import { VolutiAdapter } from '../adapters/voluti.adapter';

/**
 * Factory para criação de gateways de pagamento
 *
 * Seleciona o gateway ativo baseado na variável de ambiente ENV_CURRENT_GATEWAY.
 * Permite trocar de gateway sem modificar código, apenas alterando a config.
 *
 * @example
 * ```typescript
 * const gateway = gatewayFactory.getGateway();
 * const charge = await gateway.generatePixCharge(request);
 *
 * // Ou para um gateway específico:
 * const suitpay = gatewayFactory.getGateway('suitpay');
 * ```
 */
@Injectable()
export class GatewayFactory {
  private readonly logger = new Logger(GatewayFactory.name);
  private readonly gateways: Map<GatewayName, IPaymentGateway> = new Map();

  constructor(
    private readonly configService: ConfigService,
    private readonly suitPayAdapter: SuitPayAdapter,
    private readonly ezzePayAdapter: EzzePayAdapter,
    private readonly volutiAdapter: VolutiAdapter,
  ) {
    this.initializeGateways();
  }

  /**
   * Inicializa todos os gateways disponíveis
   */
  private initializeGateways(): void {
    this.gateways.set(GATEWAY_NAMES.SUITPAY, this.suitPayAdapter);
    this.gateways.set(GATEWAY_NAMES.EZZEPAY, this.ezzePayAdapter);
    this.gateways.set(GATEWAY_NAMES.VOLUTI, this.volutiAdapter);

    this.logger.log(`Gateways inicializados: ${Array.from(this.gateways.keys()).join(', ')}`);
  }

  /**
   * Retorna o gateway ativo baseado na configuração
   *
   * @param gatewayName - Nome do gateway (opcional, usa ENV_CURRENT_GATEWAY se não informado)
   * @returns Instância do gateway
   * @throws GatewayError se gateway não encontrado ou não configurado
   */
  getGateway(gatewayName?: GatewayName): IPaymentGateway {
    const name = gatewayName || this.getCurrentGatewayName();

    const gateway = this.gateways.get(name);

    if (!gateway) {
      throw new GatewayError(
        'INVALID_REQUEST',
        `Gateway '${name}' não encontrado. Gateways disponíveis: ${Array.from(this.gateways.keys()).join(', ')}`,
      );
    }

    this.logger.debug(`Gateway selecionado: ${name}`);
    return gateway;
  }

  /**
   * Retorna o nome do gateway ativo baseado na variável de ambiente
   */
  getCurrentGatewayName(): GatewayName {
    const gatewayName = this.configService.get<string>('ENV_CURRENT_GATEWAY');

    if (!gatewayName) {
      throw new GatewayError(
        'INVALID_REQUEST',
        'Variável de ambiente ENV_CURRENT_GATEWAY não configurada',
      );
    }

    const normalizedName = gatewayName.toLowerCase() as GatewayName;

    if (!Object.values(GATEWAY_NAMES).includes(normalizedName)) {
      throw new GatewayError(
        'INVALID_REQUEST',
        `Gateway '${gatewayName}' inválido. Valores aceitos: ${Object.values(GATEWAY_NAMES).join(', ')}`,
      );
    }

    return normalizedName;
  }

  /**
   * Retorna todos os gateways disponíveis
   */
  getAllGateways(): Map<GatewayName, IPaymentGateway> {
    return this.gateways;
  }

  /**
   * Verifica se um gateway específico está configurado
   */
  isGatewayAvailable(gatewayName: GatewayName): boolean {
    return this.gateways.has(gatewayName);
  }
}
