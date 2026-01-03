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
 * Adapter para o gateway SuitPay
 *
 * Documentação: https://docs.suitpay.app
 *
 * Variáveis de ambiente necessárias:
 * - SUITPAY_API_KEY
 * - SUITPAY_API_URL
 * - SUITPAY_WEBHOOK_SECRET
 */
@Injectable()
export class SuitPayAdapter extends BaseGatewayAdapter {
  readonly name = GATEWAY_NAMES.SUITPAY;

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;

  constructor(configService: ConfigService) {
    super(configService, 'SuitPay');

    this.apiKey = this.configService.get<string>('SUITPAY_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('SUITPAY_API_URL') || 'https://api.suitpay.app';
    this.webhookSecret = this.configService.get<string>('SUITPAY_WEBHOOK_SECRET') || '';

    if (!this.apiKey) {
      this.logger.warn('SUITPAY_API_KEY não configurada');
    }
  }

  async generatePixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    this.validateChargeRequest(request);
    this.logRequest('generatePixCharge', request);

    try {
      const response = await this.makeRequest('/pix/charge', 'POST', {
        value: this.formatAmount(request.amount),
        external_id: request.externalId,
        description: request.description,
        customer: {
          name: request.customer.name,
          email: request.customer.email,
          document: this.normalizeDocument(request.customer.document),
        },
        expires_in: request.expiresInMinutes || 60,
        metadata: request.metadata,
      });

      this.logResponse('generatePixCharge', response);

      return {
        gatewayId: response.id,
        qrCode: response.qr_code,
        qrCodeText: response.qr_code_text || response.pix_code,
        expiresAt: new Date(response.expires_at),
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
      const response = await this.makeRequest(`/pix/charge/${gatewayId}`, 'GET');

      this.logResponse('getPaymentStatus', response);

      return {
        gatewayId: response.id,
        status: this.mapPaymentStatus(response.status),
        paidAt: response.paid_at ? new Date(response.paid_at) : undefined,
        paidAmount: response.paid_amount ? this.toCents(response.paid_amount) : undefined,
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
      const response = await this.makeRequest('/pix/payout', 'POST', {
        value: this.formatAmount(request.amount),
        external_id: request.externalId,
        pix_key: request.pixKey,
        pix_key_type: request.pixKeyType,
        recipient_name: request.recipientName,
        recipient_document: this.normalizeDocument(request.recipientDocument),
        description: request.description,
      });

      this.logResponse('executePayout', response);

      return {
        gatewayId: response.id,
        status: this.mapPayoutStatus(response.status),
        estimatedCompletionAt: response.estimated_at ? new Date(response.estimated_at) : undefined,
      };
    } catch (error) {
      this.logError('executePayout', error);
      throw this.handleError(error);
    }
  }

  async getPayoutStatus(gatewayId: string): Promise<PayoutResponse> {
    this.logRequest('getPayoutStatus', { gatewayId });

    try {
      const response = await this.makeRequest(`/pix/payout/${gatewayId}`, 'GET');

      this.logResponse('getPayoutStatus', response);

      return {
        gatewayId: response.id,
        status: this.mapPayoutStatus(response.status),
        completedAt: response.completed_at ? new Date(response.completed_at) : undefined,
        failureReason: response.failure_reason,
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
        type: this.mapWebhookEventType(data.event),
        gatewayId: data.id || data.transaction_id,
        eventId: data.event_id || `${data.id}-${data.event}`,
        data,
        timestamp: data.timestamp ? new Date(data.timestamp) : new Date(),
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
        'Authorization': `Bearer ${this.apiKey}`,
        'Accept': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || data.error || 'Erro desconhecido',
        data,
      };
    }

    return data;
  }

  private mapPaymentStatus(status: string): PaymentGatewayStatus {
    const statusMap: Record<string, PaymentGatewayStatus> = {
      pending: 'pending',
      waiting: 'pending',
      paid: 'paid',
      confirmed: 'paid',
      expired: 'expired',
      cancelled: 'cancelled',
      canceled: 'cancelled',
      refunded: 'refunded',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }

  private mapPayoutStatus(status: string): PayoutGatewayStatus {
    const statusMap: Record<string, PayoutGatewayStatus> = {
      pending: 'pending',
      processing: 'processing',
      in_progress: 'processing',
      completed: 'completed',
      success: 'completed',
      failed: 'failed',
      error: 'failed',
    };

    return statusMap[status.toLowerCase()] || 'pending';
  }

  private mapWebhookEventType(event: string): WebhookEventType {
    const eventMap: Record<string, WebhookEventType> = {
      'charge.paid': 'payment.paid',
      'charge.expired': 'payment.expired',
      'charge.cancelled': 'payment.cancelled',
      'charge.refunded': 'payment.refunded',
      'payout.completed': 'payout.completed',
      'payout.failed': 'payout.failed',
      'payout.processing': 'payout.processing',
    };

    return eventMap[event.toLowerCase()] || 'payment.pending';
  }

  private handleError(error: unknown): GatewayError {
    if (error instanceof GatewayError) {
      return error;
    }

    const err = error as { status?: number; message?: string; data?: unknown };

    if (err.status === 401) {
      return new GatewayError('AUTHENTICATION_FAILED', 'Autenticação falhou', err.data);
    }

    if (err.status === 404) {
      return new GatewayError('TRANSACTION_NOT_FOUND', 'Transação não encontrada', err.data);
    }

    if (err.status === 429) {
      return new GatewayError('RATE_LIMIT_EXCEEDED', 'Limite de requisições excedido', err.data);
    }

    if (err.status === 400) {
      return new GatewayError('INVALID_REQUEST', err.message || 'Requisição inválida', err.data);
    }

    if (err.status && err.status >= 500) {
      return new GatewayError('GATEWAY_UNAVAILABLE', 'Gateway indisponível', err.data);
    }

    return new GatewayError('UNKNOWN_ERROR', err.message || 'Erro desconhecido', err.data);
  }
}
