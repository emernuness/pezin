import { z } from 'zod';

/**
 * Schemas de validação para operações de Wallet
 */

/**
 * Resposta de saldo da carteira
 */
export const walletBalanceSchema = z.object({
  available: z.number().int().min(0),
  frozen: z.number().int().min(0),
  total: z.number().int().min(0),
});

export type WalletBalance = z.infer<typeof walletBalanceSchema>;

/**
 * Resumo completo da carteira
 */
export const walletSummarySchema = z.object({
  balance: walletBalanceSchema,
  pendingPayouts: z.number().int().min(0),
  totalEarnings: z.number().int().min(0),
  totalPayouts: z.number().int().min(0),
});

export type WalletSummary = z.infer<typeof walletSummarySchema>;

/**
 * Tipo de entrada no ledger
 */
export const ledgerEntryTypeSchema = z.enum(['CREDIT', 'DEBIT']);
export type LedgerEntryType = z.infer<typeof ledgerEntryTypeSchema>;

/**
 * Tipo de transação
 */
export const transactionTypeSchema = z.enum([
  'SALE',
  'PLATFORM_FEE',
  'PAYOUT',
  'REFUND',
  'ADJUSTMENT',
  'RELEASE',
]);
export type TransactionType = z.infer<typeof transactionTypeSchema>;

/**
 * Entrada do histórico de transações
 */
export const transactionHistoryItemSchema = z.object({
  id: z.string().cuid(),
  type: ledgerEntryTypeSchema,
  transactionType: transactionTypeSchema,
  amount: z.number().int(),
  description: z.string().nullable(),
  createdAt: z.date(),
  payment: z
    .object({
      id: z.string().cuid(),
      packTitle: z.string().nullable(),
    })
    .nullable(),
  payout: z
    .object({
      id: z.string().cuid(),
      status: z.string(),
    })
    .nullable(),
});

export type TransactionHistoryItem = z.infer<typeof transactionHistoryItemSchema>;

/**
 * Paginação
 */
export const paginationSchema = z.object({
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1).max(100),
  totalPages: z.number().int().min(0),
});

export type Pagination = z.infer<typeof paginationSchema>;

/**
 * Resposta do histórico de transações
 */
export const transactionHistoryResponseSchema = z.object({
  transactions: z.array(transactionHistoryItemSchema),
  pagination: paginationSchema,
});

export type TransactionHistoryResponse = z.infer<typeof transactionHistoryResponseSchema>;

/**
 * Query params para histórico de transações
 */
export const transactionHistoryQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(50).default(20),
});

export type TransactionHistoryQuery = z.infer<typeof transactionHistoryQuerySchema>;
