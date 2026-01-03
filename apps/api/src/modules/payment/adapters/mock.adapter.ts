import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createHmac } from 'crypto';
import {
  IPaymentGateway,
  GATEWAY_NAMES,
  PixChargeRequest,
  PixChargeResponse,
  PaymentStatusResponse,
  PayoutRequest,
  PayoutResponse,
  ParsedWebhookEvent,
  PaymentGatewayStatus,
  PayoutGatewayStatus,
  WebhookEventType,
} from '../interfaces';

/**
 * Mock in-memory storage for payments and payouts
 */
interface MockPayment {
  id: string;
  externalId: string;
  amount: number;
  status: PaymentGatewayStatus;
  createdAt: Date;
  expiresAt: Date;
  paidAt?: Date;
}

interface MockPayout {
  id: string;
  externalId: string;
  amount: number;
  status: PayoutGatewayStatus;
  createdAt: Date;
  completedAt?: Date;
  failureReason?: string;
}

/**
 * Mock Gateway Adapter for local development
 *
 * This adapter simulates a real payment gateway without making external API calls.
 * Payments are automatically marked as "paid" after a configurable delay.
 *
 * Environment variables:
 * - MOCK_AUTO_APPROVE: If 'true', payments are instantly approved (default: true)
 * - MOCK_APPROVAL_DELAY_MS: Delay in ms before auto-approval (default: 3000)
 *
 * @example
 * ```bash
 * # In .env
 * ENV_CURRENT_GATEWAY=mock
 * MOCK_AUTO_APPROVE=true
 * ```
 */
@Injectable()
export class MockAdapter implements IPaymentGateway {
  readonly name = GATEWAY_NAMES.MOCK;
  private readonly logger = new Logger('MockAdapter');
  private readonly autoApprove: boolean;
  private readonly approvalDelayMs: number;
  private readonly webhookSecret: string;

  // In-memory storage
  private readonly payments = new Map<string, MockPayment>();
  private readonly payouts = new Map<string, MockPayout>();

  constructor(private readonly configService: ConfigService) {
    this.autoApprove = this.configService.get<string>('MOCK_AUTO_APPROVE') !== 'false';
    this.approvalDelayMs = parseInt(
      this.configService.get<string>('MOCK_APPROVAL_DELAY_MS') || '3000',
      10
    );
    this.webhookSecret = this.configService.get<string>('MOCK_WEBHOOK_SECRET') || 'mock-secret';

    this.logger.log('Mock gateway initialized');
    this.logger.log(`Auto-approve: ${this.autoApprove}, delay: ${this.approvalDelayMs}ms`);
  }

  /**
   * Generate a mock PIX charge
   */
  async generatePixCharge(request: PixChargeRequest): Promise<PixChargeResponse> {
    this.logger.log(`[generatePixCharge] Creating mock charge for ${request.amount} cents`);

    const id = `mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
    const expiresAt = new Date(Date.now() + (request.expiresInMinutes || 60) * 60 * 1000);

    // Generate a fake QR code (base64 SVG)
    const qrCodeSvg = this.generateMockQrCode(id, request.amount);
    const qrCode = `data:image/svg+xml;base64,${Buffer.from(qrCodeSvg).toString('base64')}`;

    // Generate fake PIX code
    const qrCodeText = `00020126580014br.gov.bcb.pix0136mock-${id}5204000053039865404${(request.amount / 100).toFixed(2)}5802BR5913PackDoPezin6009SAO PAULO62070503***6304MOCK`;

    const payment: MockPayment = {
      id,
      externalId: request.externalId,
      amount: request.amount,
      status: 'pending',
      createdAt: new Date(),
      expiresAt,
    };

    this.payments.set(id, payment);

    // Auto-approve after delay if configured
    if (this.autoApprove) {
      setTimeout(() => {
        const p = this.payments.get(id);
        if (p && p.status === 'pending') {
          p.status = 'paid';
          p.paidAt = new Date();
          this.logger.log(`[AUTO-APPROVE] Payment ${id} marked as paid`);
        }
      }, this.approvalDelayMs);
    }

    this.logger.log(`[generatePixCharge] Created payment ${id}`);

    return {
      gatewayId: id,
      qrCode,
      qrCodeText,
      expiresAt,
      status: 'pending',
    };
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(gatewayId: string): Promise<PaymentStatusResponse> {
    this.logger.debug(`[getPaymentStatus] Checking ${gatewayId}`);

    const payment = this.payments.get(gatewayId);

    if (!payment) {
      // Return pending for unknown payments (simulates real gateway behavior)
      return {
        gatewayId,
        status: 'pending',
      };
    }

    // Check if expired
    if (payment.status === 'pending' && new Date() > payment.expiresAt) {
      payment.status = 'expired';
    }

    return {
      gatewayId: payment.id,
      status: payment.status,
      paidAt: payment.paidAt,
      paidAmount: payment.status === 'paid' ? payment.amount : undefined,
    };
  }

  /**
   * Execute a mock payout
   */
  async executePayout(request: PayoutRequest): Promise<PayoutResponse> {
    this.logger.log(`[executePayout] Creating mock payout for ${request.amount} cents`);

    const id = `payout_mock_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const payout: MockPayout = {
      id,
      externalId: request.externalId,
      amount: request.amount,
      status: 'pending',
      createdAt: new Date(),
    };

    this.payouts.set(id, payout);

    // Auto-complete payout after delay
    if (this.autoApprove) {
      setTimeout(() => {
        const p = this.payouts.get(id);
        if (p && p.status === 'pending') {
          p.status = 'completed';
          p.completedAt = new Date();
          this.logger.log(`[AUTO-COMPLETE] Payout ${id} marked as completed`);
        }
      }, this.approvalDelayMs);
    }

    return {
      gatewayId: id,
      status: 'pending',
      estimatedCompletionAt: new Date(Date.now() + 5 * 60 * 1000), // 5 minutes
    };
  }

  /**
   * Get payout status
   */
  async getPayoutStatus(gatewayId: string): Promise<PayoutResponse> {
    this.logger.debug(`[getPayoutStatus] Checking ${gatewayId}`);

    const payout = this.payouts.get(gatewayId);

    if (!payout) {
      return {
        gatewayId,
        status: 'pending',
      };
    }

    return {
      gatewayId: payout.id,
      status: payout.status,
      completedAt: payout.completedAt,
      failureReason: payout.failureReason,
    };
  }

  /**
   * Validate webhook signature (always returns true for mock)
   */
  validateWebhookSignature(payload: Buffer, signature: string): boolean {
    // For mock, we'll do a simple HMAC check
    const expected = createHmac('sha256', this.webhookSecret)
      .update(payload)
      .digest('hex');
    return signature === expected || signature === 'mock-signature';
  }

  /**
   * Parse webhook event
   */
  parseWebhookEvent(payload: Buffer): ParsedWebhookEvent {
    const data = JSON.parse(payload.toString());

    return {
      type: data.type as WebhookEventType,
      gatewayId: data.gatewayId || data.id,
      eventId: data.eventId || `evt_${Date.now()}`,
      data,
      timestamp: new Date(data.timestamp || Date.now()),
    };
  }

  /**
   * Manually approve a payment (for testing)
   */
  approvePayment(gatewayId: string): boolean {
    const payment = this.payments.get(gatewayId);
    if (payment && payment.status === 'pending') {
      payment.status = 'paid';
      payment.paidAt = new Date();
      this.logger.log(`[MANUAL-APPROVE] Payment ${gatewayId} marked as paid`);
      return true;
    }
    return false;
  }

  /**
   * Generate a mock QR code SVG
   */
  private generateMockQrCode(id: string, amount: number): string {
    const amountFormatted = (amount / 100).toFixed(2);
    return `
      <svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">
        <rect width="200" height="200" fill="white"/>
        <rect x="20" y="20" width="160" height="160" fill="#f0f0f0" rx="8"/>
        <text x="100" y="80" text-anchor="middle" font-family="Arial" font-size="14" fill="#333">
          MOCK PIX
        </text>
        <text x="100" y="110" text-anchor="middle" font-family="Arial" font-size="20" font-weight="bold" fill="#22c55e">
          R$ ${amountFormatted}
        </text>
        <text x="100" y="140" text-anchor="middle" font-family="Arial" font-size="10" fill="#666">
          Auto-aprova em 3s
        </text>
        <text x="100" y="160" text-anchor="middle" font-family="Arial" font-size="8" fill="#999">
          ${id.substring(0, 20)}
        </text>
      </svg>
    `.trim();
  }
}
