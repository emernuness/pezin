import { StatCard } from "@/components/cards";
import { formatCurrency } from "@/utils/formatters";
import { TrendingUp } from "lucide-react";
import type { DashboardStats } from "./types";
import { MIN_WITHDRAWAL_CENTS } from "@/utils/constants";

interface StatsGridProps {
  stats: DashboardStats;
}

/**
 * Grid of stat cards for the dashboard.
 * Shows available balance, net revenue, total sales, and pending balance.
 */
export function StatsGrid({ stats }: StatsGridProps) {
  const canWithdraw = stats.availableBalance >= MIN_WITHDRAWAL_CENTS;

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Saldo Disponível"
        value={formatCurrency(stats.availableBalance)}
        variant="dark"
        icon={TrendingUp}
        action={{
          label: "Solicitar Saque",
          disabled: !canWithdraw,
          disabledMessage: "Mínimo de R$ 50,00 para saque",
        }}
      />

      <StatCard
        title="Receita Líquida"
        value={formatCurrency(stats.totalEarnings)}
        subtitle="Total acumulado"
      />

      <StatCard
        title="Vendas Totais"
        value={stats.totalSales}
        subtitle="packs vendidos"
      />

      <StatCard
        title="Saldo Pendente"
        value={formatCurrency(stats.pendingBalance)}
        subtitle="Liberado após 14 dias"
        muted
      />
    </div>
  );
}
