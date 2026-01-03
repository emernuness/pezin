import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac, timingSafeEqual } from 'crypto';
import { BaseGatewayAdapter } from './base-gateway.adapter';
import {
  GATEWAY_NAMES,
  PixChargeRequest,
  PixChargeResponse,
  PaymentStatusResponse,
  PayoutRequest,
  PayoutResponse,
  ParsedWebhookEvent,
  GatewayError,
  PaymentGatewayStatus,
  PayoutGatewayStatus,
  WebhookEventType,
} from '../interfaces';

/**
 * Adapter para o gateway EzzePay
 *
 * Documentação: https://docs.ezzepay.com.br
 *
 * Variáveis de ambiente necessárias:
 * - EZZEPAY_API_KEY
 * - EZZEPAY_API_URL
 * - EZZEPAY_WEBHOOK_SECRET
 */
@Injectable()
export class EzzePayAdapter extends BaseGatewayAdapter {
  readonly name = GATEWAY_NAMES.EZZEPAY;

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    super(configService, 'EzzePay');

    this.apiKey = this.configService.get<string>('EZZEPAY_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('EZZEPAY_API_URL') || 'https://api.ezzepay.com.br';
    this.webhookSecret = this.configService.get<string>('EZZEPAY_WEBHOOK_SECRET') || '';

    if (!this.apiKey) {
      this.logger.warn('EZZEPAY_API_KEY não configurada');
    }
  }

  async generatePixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    this.validateChargeRequest(request);
    this.logRequest('generatePixCharge', request);

    try {
      const response = await this.makeRequest('/v1/pix/qrcode', 'POST', {
        amount: request.amount, // EzzePay aceita em centavos
        reference_id: request.externalId,
        description: request.description,
        payer: {
          name: request.customer.name,
          email: request.customer.email,
          cpf_cnpj: this.normalizeDocument(request.customer.document),
        },
        expiration_minutes: request.expiresInMinutes || 60,
        additional_info: request.metadata,
      });

      this.logResponse('generatePixCharge', response);

      return {
        gatewayId: response.transaction_id,
        qrCode: response.qrcode_base64 || response.qrcode,
        qrCodeText: response.copy_paste || response.emv,
        expiresAt: new Date(response.expiration_date),
        status: this.mapPaymentStatus(response.status),
      };
    } catch (error) {
      this.logError('generatePixCharge', error);
      throw this.handleError(error);
    }
  }

  async getPaymentStatus(gatewayId: string): Promise<PaymentStatusResponse> {
    this.logRequest('getPaymentStatus', { gatewayId });

    try {
      const response = await this.makeRequest(`/v1/pix/transaction/${gatewayId}`, 'GET');

      this.logResponse('getPaymentStatus', response);

      return {
        gatewayId: response.transaction_id,
        status: this.mapPaymentStatus(response.status),
        paidAt: response.paid_at ? new Date(response.paid_at) : undefined,
        paidAmount: response.amount_paid,
      };
    } catch (error) {
      this.logError('getPaymentStatus', error);
      throw this.handleError(error);
    }
  }

  async executePayout(request: PayoutRequest): Promise<PayoutResponse> {
    this.validatePayoutRequest(request);
    this.logRequest('executePayout', request);

    try {
      const response = await this.makeRequest('/v1/pix/transfer', 'POST', {
        amount: request.amount,
        reference_id: request.externalId,
        pix_key: request.pixKey,
        pix_key_type: this.mapPixKeyType(request.pixKeyType),
        receiver: {
          name: request.recipientName,
          cpf_cnpj: this.normalizeDocument(request.recipientDocument),
        },
        description: request.description || 'Saque',
      });

      this.logResponse('executePayout', response);

      return {
        gatewayId: response.transfer_id,
        status: this.mapPayoutStatus(response.status),
        estimatedCompletionAt: response.estimated_completion
          ? new Date(response.estimated_completion)
          : undefined,
      };
    } catch (error) {
      this.logError('executePayout', error);
      throw this.handleError(error);
    }
  }

  async getPayoutStatus(gatewayId: string): Promise<PayoutResponse> {
    this.logRequest('getPayoutStatus', { gatewayId });

    try {
      const response = await this.makeRequest(`/v1/pix/transfer/${gatewayId}`, 'GET');

      this.logResponse('getPayoutStatus', response);

      return {
        gatewayId: response.transfer_id,
        status: this.mapPayoutStatus(response.status),
        completedAt: response.completed_at ? new Date(response.completed_at) : undefined,
        failureReason: response.error_message,
      };
    } catch (error) {
      this.logError('getPayoutStatus', error);
      throw this.handleError(error);
    }
  }

  validateWebhookSignature(payload: Buffer, signature: string): boolean {
    if (!this.webhookSecret) {
      this.logger.warn('Webhook secret não configurado, assinatura não validada');
      return false;
    }

    try {
      const expectedSignature = createHmac('sha256', this.webhookSecret)
        .update(payload)
        .digest('hex');

      const signatureBuffer = Buffer.from(signature, 'hex');
      const expectedBuffer = Buffer.from(expectedSignature, 'hex');

      if (signatureBuffer.length !== expectedBuffer.length) {
        return false;
      }

      return timingSafeEqual(signatureBuffer, expectedBuffer);
    } catch {
      return false;
    }
  }

  parseWebhookEvent(payload: Buffer): ParsedWebhookEvent {
    try {
      const data = JSON.parse(payload.toString());

      return {
        type: this.mapWebhookEventType(data.event_type || data.type),
        gatewayId: data.transaction_id || data.transfer_id,
        eventId: data.webhook_id || `${data.transaction_id}-${Date.now()}`,
        data,
        timestamp: data.created_at ? new Date(data.created_at) : new Date(),
      };
    } catch {
      throw new GatewayError('INVALID_REQUEST', 'Payload de webhook inválido');
    }
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private async makeRequest(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
  ): Promise<Record<string, unknown>> {
    const url = `${this.apiUrl}${endpoint}`;

    const response = await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'X-Api-Key': this.apiKey,
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data.error_description || 'Erro desconhecido',
        data,
      };
    }

    return data;
  }

  private mapPixKeyType(type: string): string {
    const typeMap: Record<string, string> = {
      cpf: 'CPF',
      cnpj: 'CNPJ',
      email: 'EMAIL',
      phone: 'PHONE',
      evp: 'EVP',
    };

    return typeMap[type] || type.toUpperCase();
  }

  private mapPaymentStatus(status: string): PaymentGatewayStatus {
    const statusMap: Record<string, PaymentGatewayStatus> = {
      PENDING: 'pending',
      WAITING_PAYMENT: 'pending',
      PAID: 'paid',
      CONFIRMED: 'paid',
      EXPIRED: 'expired',
      CANCELLED: 'cancelled',
      REFUNDED: 'refunded',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  private mapPayoutStatus(status: string): PayoutGatewayStatus {
    const statusMap: Record<string, PayoutGatewayStatus> = {
      PENDING: 'pending',
      PROCESSING: 'processing',
      IN_TRANSIT: 'processing',
      COMPLETED: 'completed',
      SUCCESS: 'completed',
      FAILED: 'failed',
      ERROR: 'failed',
      REJECTED: 'failed',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  private mapWebhookEventType(event: string): WebhookEventType {
    const eventMap: Record<string, WebhookEventType> = {
      'PIX_RECEIVED': 'payment.paid',
      'PIX_PAID': 'payment.paid',
      'PIX_EXPIRED': 'payment.expired',
      'PIX_CANCELLED': 'payment.cancelled',
      'PIX_REFUNDED': 'payment.refunded',
      'TRANSFER_COMPLETED': 'payout.completed',
      'TRANSFER_FAILED': 'payout.failed',
      'TRANSFER_PROCESSING': 'payout.processing',
    };

    return eventMap[event.toUpperCase()] || 'payment.pending';
  }

  private handleError(error: unknown): GatewayError {
    if (error instanceof GatewayError) {
      return error;
    }

    const err = error as { status?: number; message?: string; data?: unknown };

    if (err.status === 401 || err.status === 403) {
      return new GatewayError('AUTHENTICATION_FAILED', 'Autenticação falhou', err.data);
    }

    if (err.status === 404) {
      return new GatewayError('TRANSACTION_NOT_FOUND', 'Transação não encontrada', err.data);
    }

    if (err.status === 429) {
      return new GatewayError('RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido', err.data);
    }

    if (err.status === 400 || err.status === 422) {
      return new GatewayError('INVALID_REQUEST', err.message || 'Requisição inválida', err.data);
    }

    if (err.status && err.status >= 500) {
      return new GatewayError('GATEWAY_UNAVAILABLE', 'Gateway indisponível', err.data);
    }

    return new GatewayError('UNKNOWN_ERROR', err.message || 'Erro desconhecido', err.data);
  }
}
