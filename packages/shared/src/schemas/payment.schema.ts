import { z } from 'zod';

/**
 * Schemas para o módulo de pagamentos Gateway Agnostic
 */

// ==========================================
// CHECKOUT PIX
// ==========================================

/**
 * Request para criar um checkout PIX
 */
export const createPixCheckoutSchema = z.object({
  packId: z.string().cuid('ID do pack inválido'),
});

/**
 * Response do checkout PIX
 */
export const pixCheckoutResponseSchema = z.object({
  paymentId: z.string().cuid(),
  qrCode: z.string().min(1, 'QR Code é obrigatório'),
  qrCodeText: z.string().min(1, 'Código PIX é obrigatório'),
  expiresAt: z.string().datetime(),
  amount: z.number().int().positive(),
  pack: z.object({
    id: z.string().cuid(),
    title: z.string(),
    price: z.number().int(),
  }),
});

/**
 * Query para verificar status do pagamento
 */
export const paymentStatusQuerySchema = z.object({
  paymentId: z.string().cuid('ID do pagamento inválido'),
});

/**
 * Response do status do pagamento
 */
export const paymentStatusResponseSchema = z.object({
  paymentId: z.string().cuid(),
  status: z.enum(['pending', 'paid', 'expired', 'cancelled', 'refunded']),
  paidAt: z.string().datetime().nullable(),
});

// ==========================================
// WALLET & BALANCE
// ==========================================

/**
 * Response do saldo da carteira
 */
export const walletBalanceSchema = z.object({
  currentBalance: z.number().int().min(0), // Disponível para saque
  frozenBalance: z.number().int().min(0), // Retido (14 dias)
  totalBalance: z.number().int().min(0), // Total (current + frozen)
});

/**
 * Request para solicitar saque
 */
export const requestPayoutSchema = z.object({
  amount: z
    .number()
    .int('Valor deve ser inteiro (centavos)')
    .min(5000, 'Valor mínimo para saque: R$ 50,00'),
});

/**
 * Response da solicitação de saque
 */
export const payoutResponseSchema = z.object({
  payoutId: z.string().cuid(),
  amount: z.number().int(),
  status: z.enum(['pending', 'processing', 'completed', 'failed']),
  pixKey: z.string(),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'evp']),
  requestedAt: z.string().datetime(),
});

/**
 * Query para listar saques
 */
export const listPayoutsQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(50).default(10),
  status: z.enum(['pending', 'processing', 'completed', 'failed']).optional(),
});

// ==========================================
// PIX KEY
// ==========================================

/**
 * Schema para cadastrar/atualizar chave PIX
 */
export const pixKeySchema = z.object({
  pixKey: z
    .string()
    .min(1, 'Chave PIX é obrigatória')
    .max(100, 'Chave PIX muito longa'),
  pixKeyType: z.enum(['cpf', 'cnpj', 'email', 'phone', 'evp'], {
    errorMap: () => ({ message: 'Tipo de chave PIX inválido' }),
  }),
});

/**
 * Validação específica para cada tipo de chave PIX
 */
export const validatePixKey = (key: string, type: string): boolean => {
  const cleanKey = key.replace(/\D/g, '');

  switch (type) {
    case 'cpf':
      return cleanKey.length === 11;
    case 'cnpj':
      return cleanKey.length === 14;
    case 'email':
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(key);
    case 'phone':
      return cleanKey.length >= 10 && cleanKey.length <= 13;
    case 'evp':
      // EVP (chave aleatória) tem formato UUID
      return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key);
    default:
      return false;
  }
};

// ==========================================
// LEDGER ENTRIES
// ==========================================

/**
 * Response de uma entrada no ledger
 */
export const ledgerEntrySchema = z.object({
  id: z.string().cuid(),
  type: z.enum(['CREDIT', 'DEBIT']),
  transactionType: z.enum(['SALE', 'PLATFORM_FEE', 'PAYOUT', 'REFUND', 'ADJUSTMENT', 'RELEASE']),
  amount: z.number().int(),
  balanceAfter: z.number().int(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
});

/**
 * Query para listar entradas do ledger
 */
export const listLedgerEntriesQuerySchema = z.object({
  page: z.coerce.number().min(1).default(1),
  limit: z.coerce.number().min(1).max(100).default(20),
  type: z.enum(['CREDIT', 'DEBIT']).optional(),
  transactionType: z.enum(['SALE', 'PLATFORM_FEE', 'PAYOUT', 'REFUND', 'ADJUSTMENT', 'RELEASE']).optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
});

// ==========================================
// TYPE EXPORTS
// ==========================================

export type CreatePixCheckoutInput = z.infer<typeof createPixCheckoutSchema>;
export type PixCheckoutResponse = z.infer<typeof pixCheckoutResponseSchema>;
export type PaymentStatusQuery = z.infer<typeof paymentStatusQuerySchema>;
export type PaymentStatusResponse = z.infer<typeof paymentStatusResponseSchema>;
export type WalletBalance = z.infer<typeof walletBalanceSchema>;
export type RequestPayoutInput = z.infer<typeof requestPayoutSchema>;
export type PayoutResponse = z.infer<typeof payoutResponseSchema>;
export type ListPayoutsQuery = z.infer<typeof listPayoutsQuerySchema>;
export type PixKeyInput = z.infer<typeof pixKeySchema>;
export type LedgerEntry = z.infer<typeof ledgerEntrySchema>;
export type ListLedgerEntriesQuery = z.infer<typeof listLedgerEntriesQuerySchema>;
