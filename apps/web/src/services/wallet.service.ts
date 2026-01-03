import { api } from './api';

/**
 * Serviço de carteira virtual
 * Integração com o WalletModule do backend
 */

export interface WalletBalance {
  available: number;
  frozen: number;
  total: number;
  formatted: {
    available: string;
    frozen: string;
    total: string;
  };
}

export interface WalletSummary {
  balance: {
    available: number;
    frozen: number;
    total: number;
  };
  pendingPayouts: number;
  totalEarnings: number;
  totalPayouts: number;
  formatted: {
    available: string;
    frozen: string;
    total: string;
    pendingPayouts: string;
    totalEarnings: string;
    totalPayouts: string;
  };
}

export interface Transaction {
  id: string;
  type: 'CREDIT' | 'DEBIT';
  transactionType: 'SALE' | 'PLATFORM_FEE' | 'PAYOUT' | 'REFUND' | 'ADJUSTMENT' | 'RELEASE';
  amount: number;
  description: string | null;
  createdAt: string;
  formatted: {
    amount: string;
    createdAt: string;
  };
  payment: {
    id: string;
    packTitle: string | null;
  } | null;
  payout: {
    id: string;
    status: string;
  } | null;
}

export interface Payout {
  id: string;
  amount: number;
  maskedPixKey: string;
  pixKeyType: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  requestedAt: string;
  completedAt: string | null;
  failureReason: string | null;
  formatted: {
    amount: string;
  };
}

export interface PayoutRequest {
  payoutId: string;
  amount: number;
  status: string;
  estimatedCompletionAt: string | null;
  formatted: {
    amount: string;
  };
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

/**
 * Obtém o saldo da carteira
 */
export async function getWalletBalance(): Promise<WalletBalance> {
  const response = await api.get<{ success: boolean; data: WalletBalance }>(
    '/wallet/balance'
  );
  return response.data.data;
}

/**
 * Obtém o resumo completo da carteira
 */
export async function getWalletSummary(): Promise<WalletSummary> {
  const response = await api.get<{ success: boolean; data: WalletSummary }>(
    '/wallet/summary'
  );
  return response.data.data;
}

/**
 * Obtém o histórico de transações
 */
export async function getTransactionHistory(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Transaction>> {
  const response = await api.get<{ success: boolean; data: Transaction[]; pagination: PaginatedResponse<Transaction>['pagination'] }>(
    '/wallet/transactions',
    { params: { page, limit } }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

/**
 * Solicita um saque via PIX
 */
export async function requestPayout(amount: number): Promise<PayoutRequest> {
  const response = await api.post<{ success: boolean; data: PayoutRequest }>(
    '/wallet/payout',
    { amount }
  );
  return response.data.data;
}

/**
 * Lista os saques do usuário
 */
export async function getPayoutHistory(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<Payout>> {
  const response = await api.get<{ success: boolean; data: Payout[]; pagination: PaginatedResponse<Payout>['pagination'] }>(
    '/wallet/payouts',
    { params: { page, limit } }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

/**
 * Obtém detalhes de um saque
 */
export async function getPayoutDetails(payoutId: string): Promise<Payout> {
  const response = await api.get<{ success: boolean; data: Payout }>(
    `/wallet/payouts/${payoutId}`
  );
  return response.data.data;
}
