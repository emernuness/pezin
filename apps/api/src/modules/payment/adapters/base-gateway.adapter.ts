import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import {
  IPaymentGateway,
  PixChargeRequest,
  PixChargeResponse,
  PaymentStatusResponse,
  PayoutRequest,
  PayoutResponse,
  ParsedWebhookEvent,
  GatewayError,
} from '../interfaces';

/**
 * Classe base abstrata para adapters de gateway
 *
 * Fornece funcionalidades comuns como logging, tratamento de erros
 * e validações básicas. Cada gateway específico deve estender esta classe.
 */
export abstract class BaseGatewayAdapter implements IPaymentGateway {
  protected readonly logger: Logger;

  constructor(
    protected readonly configService: ConfigService,
    gatewayName: string,
  ) {
    this.logger = new Logger(`${gatewayName}Adapter`);
  }

  abstract readonly name: string;

  /**
   * Implementações específicas de cada gateway
   */
  abstract generatePixCharge(
    request: PixChargeRequest,
  ): Promise<PixChargeResponse>;

  abstract getPaymentStatus(gatewayId: string): Promise<PaymentStatusResponse>;

  abstract executePayout(request: PayoutRequest): Promise<PayoutResponse>;

  abstract getPayoutStatus(gatewayId: string): Promise<PayoutResponse>;

  abstract validateWebhookSignature(
    payload: Buffer,
    signature: string,
  ): boolean;

  abstract parseWebhookEvent(payload: Buffer): ParsedWebhookEvent;

  /**
   * Valida request de cobrança PIX
   */
  protected validateChargeRequest(request: PixChargeRequest): void {
    if (request.amount <= 0) {
      throw new GatewayError('INVALID_REQUEST', 'Valor deve ser maior que zero');
    }

    if (!request.externalId) {
      throw new GatewayError('INVALID_REQUEST', 'externalId é obrigatório');
    }

    if (!request.customer?.document) {
      throw new GatewayError('INVALID_REQUEST', 'CPF/CNPJ do cliente é obrigatório');
    }

    // Valida formato do documento (apenas números)
    const docNumbers = request.customer.document.replace(/\D/g, '');
    if (docNumbers.length !== 11 && docNumbers.length !== 14) {
      throw new GatewayError('INVALID_REQUEST', 'CPF deve ter 11 dígitos ou CNPJ 14 dígitos');
    }
  }

  /**
   * Valida request de saque
   */
  protected validatePayoutRequest(request: PayoutRequest): void {
    if (request.amount <= 0) {
      throw new GatewayError('INVALID_REQUEST', 'Valor deve ser maior que zero');
    }

    if (!request.externalId) {
      throw new GatewayError('INVALID_REQUEST', 'externalId é obrigatório');
    }

    if (!request.pixKey) {
      throw new GatewayError('INVALID_REQUEST', 'Chave PIX é obrigatória');
    }

    if (!request.recipientDocument) {
      throw new GatewayError('INVALID_REQUEST', 'CPF/CNPJ do destinatário é obrigatório');
    }
  }

  /**
   * Formata valor de centavos para string com 2 casas decimais
   */
  protected formatAmount(amountInCents: number): string {
    return (amountInCents / 100).toFixed(2);
  }

  /**
   * Converte valor em reais para centavos
   */
  protected toCents(amountInReais: number): number {
    return Math.round(amountInReais * 100);
  }

  /**
   * Remove formatação de documento (CPF/CNPJ)
   */
  protected normalizeDocument(document: string): string {
    return document.replace(/\D/g, '');
  }

  /**
   * Remove formatação de telefone
   */
  protected normalizePhone(phone: string): string {
    return phone.replace(/\D/g, '');
  }

  /**
   * Gera um ID único para transações
   */
  protected generateTransactionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 8);
    return `${timestamp}-${random}`;
  }

  /**
   * Log de requisição ao gateway
   */
  protected logRequest(method: string, data: unknown): void {
    this.logger.debug(`[${method}] Request: ${JSON.stringify(data)}`);
  }

  /**
   * Log de resposta do gateway
   */
  protected logResponse(method: string, data: unknown): void {
    this.logger.debug(`[${method}] Response: ${JSON.stringify(data)}`);
  }

  /**
   * Log de erro do gateway
   */
  protected logError(method: string, error: unknown): void {
    this.logger.error(`[${method}] Error: ${JSON.stringify(error)}`);
  }
}
