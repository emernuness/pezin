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

// Tipos de resposta da API Voluti
interface VolutiChargeResponse {
  txid?: string;
  id?: string;
  pixCopiaECola?: string;
  qrcode?: string;
  brcode?: string;
  status: string;
}

interface VolutiPaymentStatusResponse {
  txid: string;
  status: string;
  pix?: Array<{
    horario?: string;
    valor?: string;
  }>;
}

interface VolutiPayoutResponse {
  idTransacao?: string;
  id?: string;
  status: string;
  previsaoEnvio?: string;
  dataEfetivacao?: string;
  motivoRejeicao?: string;
}

interface VolutiWebhookPayload {
  txid?: string;
  idTransacao?: string;
  idTransferencia?: string;
  pix?: unknown[];
  tipo?: string;
  status?: string;
  webhookId?: string;
  horario?: string;
  [key: string]: unknown;
}

/**
 * Adapter para o gateway Voluti
 *
 * Documentação: https://docs.voluti.com.br
 *
 * Variáveis de ambiente necessárias:
 * - VOLUTI_API_KEY
 * - VOLUTI_API_URL
 * - VOLUTI_WEBHOOK_SECRET
 * - VOLUTI_CLIENT_ID (opcional)
 */
@Injectable()
export class VolutiAdapter extends BaseGatewayAdapter {
  readonly name = GATEWAY_NAMES.VOLUTI;

  private readonly apiKey: string;
  private readonly apiUrl: string;
  private readonly webhookSecret: string;
  private readonly clientId: string;

  constructor(configService: ConfigService) {
    super(configService, 'Voluti');

    this.apiKey = this.configService.get<string>('VOLUTI_API_KEY') || '';
    this.apiUrl = this.configService.get<string>('VOLUTI_API_URL') || 'https://api.voluti.com.br';
    this.webhookSecret = this.configService.get<string>('VOLUTI_WEBHOOK_SECRET') || '';
    this.clientId = this.configService.get<string>('VOLUTI_CLIENT_ID') || '';

    if (!this.apiKey) {
      this.logger.warn('VOLUTI_API_KEY não configurada');
    }
  }

  async generatePixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    this.validateChargeRequest(request);
    this.logRequest('generatePixCharge', request);

    const normalizedDoc = this.normalizeDocument(request.customer.document);
    const isCpf = normalizedDoc.length === 11;

    try {
      const response = await this.makeRequest<VolutiChargeResponse>('/api/v1/pix/cob', 'POST', {
        valor: {
          original: this.formatAmount(request.amount),
        },
        chave: this.clientId,
        txid: request.externalId,
        calendario: {
          expiracao: (request.expiresInMinutes || 60) * 60,
        },
        devedor: {
          nome: request.customer.name,
          cpf: isCpf ? normalizedDoc : undefined,
          cnpj: !isCpf ? normalizedDoc : undefined,
        },
        solicitacaoPagador: request.description,
        infoAdicionais: request.metadata
          ? Object.entries(request.metadata).map(([nome, valor]) => ({ nome, valor }))
          : undefined,
      });

      this.logResponse('generatePixCharge', response);

      const qrCodeText = response.pixCopiaECola || response.brcode || '';

      return {
        gatewayId: response.txid || response.id || '',
        qrCode: qrCodeText ? Buffer.from(qrCodeText).toString('base64') : response.qrcode || '',
        qrCodeText,
        expiresAt: new Date(Date.now() + (request.expiresInMinutes || 60) * 60 * 1000),
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
      const response = await this.makeRequest<VolutiPaymentStatusResponse>(`/api/v1/pix/cob/${gatewayId}`, 'GET');

      this.logResponse('getPaymentStatus', response);

      const pixInfo = response.pix?.[0];

      return {
        gatewayId: response.txid,
        status: this.mapPaymentStatus(response.status),
        paidAt: pixInfo?.horario ? new Date(pixInfo.horario) : undefined,
        paidAmount: pixInfo?.valor ? this.toCents(parseFloat(pixInfo.valor)) : undefined,
      };
    } catch (error) {
      this.logError('getPaymentStatus', error);
      throw this.handleError(error);
    }
  }

  async executePayout(request: PayoutRequest): Promise<PayoutResponse> {
    this.validatePayoutRequest(request);
    this.logRequest('executePayout', request);

    const normalizedDoc = this.normalizeDocument(request.recipientDocument);
    const isCpf = normalizedDoc.length === 11;

    try {
      const response = await this.makeRequest<VolutiPayoutResponse>('/api/v1/pix/envio', 'POST', {
        valor: this.formatAmount(request.amount),
        idTransacao: request.externalId,
        chave: request.pixKey,
        tipoChave: this.mapPixKeyType(request.pixKeyType),
        favorecido: {
          nome: request.recipientName,
          cpf: isCpf ? normalizedDoc : undefined,
          cnpj: !isCpf ? normalizedDoc : undefined,
        },
        descricao: request.description || 'Saque',
      });

      this.logResponse('executePayout', response);

      return {
        gatewayId: response.idTransacao || response.id || '',
        status: this.mapPayoutStatus(response.status),
        estimatedCompletionAt: response.previsaoEnvio
          ? new Date(response.previsaoEnvio)
          : new Date(Date.now() + 5 * 60 * 1000),
      };
    } catch (error) {
      this.logError('executePayout', error);
      throw this.handleError(error);
    }
  }

  async getPayoutStatus(gatewayId: string): Promise<PayoutResponse> {
    this.logRequest('getPayoutStatus', { gatewayId });

    try {
      const response = await this.makeRequest<VolutiPayoutResponse>(`/api/v1/pix/envio/${gatewayId}`, 'GET');

      this.logResponse('getPayoutStatus', response);

      return {
        gatewayId: response.idTransacao || response.id || '',
        status: this.mapPayoutStatus(response.status),
        completedAt: response.dataEfetivacao ? new Date(response.dataEfetivacao) : undefined,
        failureReason: response.motivoRejeicao,
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
      const expectedSignature = createHmac('sha512', this.webhookSecret)
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
      const data = JSON.parse(payload.toString()) as VolutiWebhookPayload;

      const isPayment = !!data.pix || data.tipo === 'COBRANCA';
      const isPayout = data.tipo === 'ENVIO' || !!data.idTransferencia;

      let type: WebhookEventType = 'payment.pending';
      const gatewayId = data.txid || data.idTransacao || data.idTransferencia || '';

      if (isPayment) {
        type = this.mapWebhookEventType(data.status || 'CONCLUIDA');
      } else if (isPayout) {
        type = data.status === 'EFETIVADO'
          ? 'payout.completed'
          : data.status === 'REJEITADO'
            ? 'payout.failed'
            : 'payout.processing';
      }

      return {
        type,
        gatewayId,
        eventId: data.webhookId || `${gatewayId}-${Date.now()}`,
        data: data as Record<string, unknown>,
        timestamp: data.horario ? new Date(data.horario) : new Date(),
      };
    } catch {
      throw new GatewayError('INVALID_REQUEST', 'Payload de webhook inválido');
    }
  }

  // ==========================================
  // PRIVATE METHODS
  // ==========================================

  private async makeRequest<T>(
    endpoint: string,
    method: 'GET' | 'POST',
    body?: Record<string, unknown>,
  ): Promise<T> {
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

    const data = await response.json() as T & { mensagem?: string; message?: string; error?: string };

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.mensagem || data.message || data.error || 'Erro desconhecido',
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
      phone: 'TELEFONE',
      evp: 'CHAVE_ALEATORIA',
    };

    return typeMap[type] || type.toUpperCase();
  }

  private mapPaymentStatus(status: string): PaymentGatewayStatus {
    const statusMap: Record<string, PaymentGatewayStatus> = {
      ATIVA: 'pending',
      PENDENTE: 'pending',
      CONCLUIDA: 'paid',
      PAGA: 'paid',
      EXPIRADA: 'expired',
      REMOVIDA_PELO_USUARIO_RECEBEDOR: 'cancelled',
      CANCELADA: 'cancelled',
      DEVOLVIDA: 'refunded',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  private mapPayoutStatus(status: string): PayoutGatewayStatus {
    const statusMap: Record<string, PayoutGatewayStatus> = {
      PENDENTE: 'pending',
      EM_PROCESSAMENTO: 'processing',
      PROCESSANDO: 'processing',
      EFETIVADO: 'completed',
      CONCLUIDO: 'completed',
      REJEITADO: 'failed',
      ERRO: 'failed',
    };

    return statusMap[status.toUpperCase()] || 'pending';
  }

  private mapWebhookEventType(status: string): WebhookEventType {
    const eventMap: Record<string, WebhookEventType> = {
      CONCLUIDA: 'payment.paid',
      PAGA: 'payment.paid',
      EXPIRADA: 'payment.expired',
      CANCELADA: 'payment.cancelled',
      DEVOLVIDA: 'payment.refunded',
    };

    return eventMap[status.toUpperCase()] || 'payment.pending';
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
      if (err.message?.toLowerCase().includes('chave') || err.message?.toLowerCase().includes('pix')) {
        return new GatewayError('INVALID_PIX_KEY', err.message || 'Chave PIX inválida', err.data);
      }
      return new GatewayError('INVALID_REQUEST', err.message || 'Requisição inválida', err.data);
    }

    if (err.status && err.status >= 500) {
      return new GatewayError('GATEWAY_UNAVAILABLE', 'Gateway indisponível', err.data);
    }

    return new GatewayError('UNKNOWN_ERROR', err.message || 'Erro desconhecido', err.data);
  }
}
