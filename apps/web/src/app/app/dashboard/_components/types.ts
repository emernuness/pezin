/**
 * Types for dashboard page components.
 */

export interface ChartDataPoint {
  date: string;
  amount: number;
}

export interface Sale {
  id: string;
  createdAt: string;
  creatorEarnings: number;
  pack: {
    title: string;
    price: number;
  };
}

export interface DashboardStats {
  totalSales: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
}
