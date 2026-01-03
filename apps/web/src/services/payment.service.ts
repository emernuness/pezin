import { api } from './api';

/**
 * Serviço de pagamentos PIX
 * Integração com o PaymentModule do backend
 */

export interface CheckoutResponse {
  paymentId: string;
  qrCode: string;
  qrCodeText: string;
  expiresAt: string;
  amount: number;
  pack: {
    id: string;
    title: string;
    price: number;
  };
}

export interface PaymentStatus {
  paymentId: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled' | 'refunded';
  paidAt: string | null;
}

export interface MyPurchase {
  id: string;
  amount: number;
  paidAt: string;
  pack: {
    id: string;
    title: string;
    preview: string | null;
  };
  creator: {
    id: string;
    displayName: string;
    slug: string;
  };
}

export interface MySale {
  id: string;
  amount: number;
  creatorEarnings: number;
  paidAt: string;
  pack: {
    id: string;
    title: string;
  };
  buyer: {
    id: string;
    displayName: string;
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
 * Cria um checkout PIX para um pack
 */
export async function createPixCheckout(packId: string): Promise<CheckoutResponse> {
  const response = await api.post<{ success: boolean; data: CheckoutResponse }>(
    '/payment/checkout',
    { packId }
  );
  return response.data.data;
}

/**
 * Consulta o status de um pagamento
 */
export async function getPaymentStatus(paymentId: string): Promise<PaymentStatus> {
  const response = await api.get<{ success: boolean; data: PaymentStatus }>(
    `/payment/${paymentId}/status`
  );
  return response.data.data;
}

/**
 * Lista as compras do usuário
 */
export async function getMyPurchases(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<MyPurchase>> {
  const response = await api.get<{ success: boolean; data: MyPurchase[]; pagination: PaginatedResponse<MyPurchase>['pagination'] }>(
    '/payment/my-purchases',
    { params: { page, limit } }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}

/**
 * Lista as vendas do criador
 */
export async function getMySales(
  page = 1,
  limit = 20
): Promise<PaginatedResponse<MySale>> {
  const response = await api.get<{ success: boolean; data: MySale[]; pagination: PaginatedResponse<MySale>['pagination'] }>(
    '/payment/my-sales',
    { params: { page, limit } }
  );
  return {
    data: response.data.data,
    pagination: response.data.pagination,
  };
}
