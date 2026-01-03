/**
 * Interface do Gateway de Pagamento - Gateway Agnostic Pattern
 *
 * Esta interface define o contrato que todos os gateways de pagamento devem implementar.
 * Permite trocar de gateway (SuitPay, EzzePay, Voluti) sem alterar o código do sistema.
 *
 * @example
 * ```typescript
 * const gateway = gatewayFactory.getGateway();
 * const charge = await gateway.generatePixCharge(request);
 * ```
 */

// ==========================================
// REQUEST/RESPONSE TYPES
// ==========================================

/**
 * Dados do cliente para geração de cobrança PIX
 */
export interface PixCustomer {
  /** Nome completo do cliente */
  name: string;
  /** Email do cliente */
  email: string;
  /** CPF ou CNPJ (apenas números) */
  document: string;
}

/**
 * Request para gerar uma cobrança PIX
 */
export interface PixChargeRequest {
  /** Valor em centavos */
  amount: number;
  /** ID único da transação para idempotência */
  externalId: string;
  /** Descrição da cobrança */
  description: string;
  /** Dados do cliente */
  customer: PixCustomer;
  /** Tempo de expiração em minutos (padrão: 60) */
  expiresInMinutes?: number;
  /** Metadados adicionais */
  metadata?: Record<string, string>;
}

/**
 * Response da geração de cobrança PIX
 */
export interface PixChargeResponse {
  /** ID da transação no gateway */
  gatewayId: string;
  /** QR Code em base64 ou URL */
  qrCode: string;
  /** Código PIX Copia e Cola (BR Code) */
  qrCodeText: string;
  /** Data de expiração */
  expiresAt: Date;
  /** Status atual da cobrança */
  status: PaymentGatewayStatus;
}

/**
 * Response de consulta de status de pagamento
 */
export interface PaymentStatusResponse {
  /** ID da transação no gateway */
  gatewayId: string;
  /** Status atual */
  status: PaymentGatewayStatus;
  /** Data do pagamento (se pago) */
  paidAt?: Date;
  /** Valor pago em centavos (pode diferir do solicitado) */
  paidAmount?: number;
}

/**
 * Request para executar um saque via PIX
 */
export interface PayoutRequest {
  /** Valor em centavos */
  amount: number;
  /** ID único da transação para idempotência */
  externalId: string;
  /** Chave PIX do destinatário */
  pixKey: string;
  /** Tipo da chave PIX */
  pixKeyType: PixKeyType;
  /** Nome do destinatário */
  recipientName: string;
  /** CPF/CNPJ do destinatário */
  recipientDocument: string;
  /** Descrição opcional */
  description?: string;
}

/**
 * Response de execução/consulta de saque
 */
export interface PayoutResponse {
  /** ID do saque no gateway */
  gatewayId: string;
  /** Status atual do saque */
  status: PayoutGatewayStatus;
  /** Data estimada de conclusão */
  estimatedCompletionAt?: Date;
  /** Data de conclusão real */
  completedAt?: Date;
  /** Razão da falha (se falhou) */
  failureReason?: string;
}

// ==========================================
// ENUMS & TYPES
// ==========================================

/**
 * Status de pagamento retornado pelo gateway
 */
export type PaymentGatewayStatus =
  | 'pending'
  | 'paid'
  | 'expired'
  | 'cancelled'
  | 'refunded';

/**
 * Status de saque retornado pelo gateway
 */
export type PayoutGatewayStatus =
  | 'pending'
  | 'processing'
  | 'completed'
  | 'failed';

/**
 * Tipos de chave PIX suportados
 */
export type PixKeyType = 'cpf' | 'cnpj' | 'email' | 'phone' | 'evp';

/**
 * Tipos de evento de webhook
 */
export type WebhookEventType =
  | 'payment.pending'
  | 'payment.paid'
  | 'payment.expired'
  | 'payment.cancelled'
  | 'payment.refunded'
  | 'payout.pending'
  | 'payout.processing'
  | 'payout.completed'
  | 'payout.failed';

/**
 * Evento de webhook parseado
 */
export interface ParsedWebhookEvent {
  /** Tipo do evento */
  type: WebhookEventType;
  /** ID da transação no gateway */
  gatewayId: string;
  /** ID do evento no gateway (para idempotência) */
  eventId: string;
  /** Dados brutos do evento */
  data: Record<string, unknown>;
  /** Timestamp do evento */
  timestamp: Date;
}

// ==========================================
// INTERFACE PRINCIPAL
// ==========================================

/**
 * Interface do Gateway de Pagamento
 *
 * Todos os gateways (SuitPay, EzzePay, Voluti) devem implementar esta interface.
 * Isso permite trocar de gateway sem modificar a lógica de negócios.
 */
export interface IPaymentGateway {
  /**
   * Nome do gateway (ex: 'suitpay', 'ezzepay', 'voluti')
   */
  readonly name: string;

  /**
   * Gera uma cobrança PIX
   *
   * @param request - Dados da cobrança
   * @returns QR Code e dados para pagamento
   * @throws GatewayError se houver falha na comunicação
   */
  generatePixCharge(request: PixChargeRequest): Promise<PixChargeResponse>;

  /**
   * Consulta o status de um pagamento
   *
   * @param gatewayId - ID da transação no gateway
   * @returns Status atual do pagamento
   * @throws GatewayError se transação não encontrada
   */
  getPaymentStatus(gatewayId: string): Promise<PaymentStatusResponse>;

  /**
   * Executa um saque via PIX
   *
   * @param request - Dados do saque
   * @returns Status do saque
   * @throws GatewayError se houver falha na transferência
   */
  executePayout(request: PayoutRequest): Promise<PayoutResponse>;

  /**
   * Consulta o status de um saque
   *
   * @param gatewayId - ID do saque no gateway
   * @returns Status atual do saque
   * @throws GatewayError se saque não encontrado
   */
  getPayoutStatus(gatewayId: string): Promise<PayoutResponse>;

  /**
   * Valida a assinatura de um webhook
   *
   * @param payload - Body raw do webhook
   * @param signature - Assinatura recebida no header
   * @returns true se a assinatura for válida
   */
  validateWebhookSignature(payload: Buffer, signature: string): boolean;

  /**
   * Parseia o payload de um webhook
   *
   * @param payload - Body raw do webhook
   * @returns Evento parseado
   * @throws GatewayError se payload inválido
   */
  parseWebhookEvent(payload: Buffer): ParsedWebhookEvent;
}

// ==========================================
// ERROR TYPES
// ==========================================

/**
 * Tipos de erro do gateway
 */
export type GatewayErrorCode =
  | 'INVALID_REQUEST'
  | 'AUTHENTICATION_FAILED'
  | 'INSUFFICIENT_FUNDS'
  | 'INVALID_PIX_KEY'
  | 'TRANSACTION_NOT_FOUND'
  | 'RATE_LIMIT_EXCEEDED'
  | 'GATEWAY_UNAVAILABLE'
  | 'UNKNOWN_ERROR';

/**
 * Erro do gateway de pagamento
 */
export class GatewayError extends Error {
  constructor(
    public readonly code: GatewayErrorCode,
    message: string,
    public readonly gatewayResponse?: unknown,
  ) {
    super(message);
    this.name = 'GatewayError';
  }
}

// ==========================================
// CONSTANTS
// ==========================================

/**
 * Nomes dos gateways suportados
 */
export const GATEWAY_NAMES = {
  SUITPAY: 'suitpay',
  EZZEPAY: 'ezzepay',
  VOLUTI: 'voluti',
} as const;

export type GatewayName = (typeof GATEWAY_NAMES)[keyof typeof GATEWAY_NAMES];
