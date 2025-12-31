'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface ChartDataPoint {
  date: string;
  amount: number;
}

interface Sale {
  id: string;
  createdAt: string;
  creatorEarnings: number;
  pack: {
    title: string;
    price: number;
  };
}

// Simple Dashboard Layout
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
       <aside className="w-64 border-r bg-white p-6 hidden md:block">
          <nav className="space-y-2">
             <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">Visao Geral</Button>
             </Link>
             <Link href="/dashboard/packs">
                <Button variant="ghost" className="w-full justify-start">Meus Packs</Button>
             </Link>
          </nav>
       </aside>
       <div className="flex-1 p-8">
          {children}
       </div>
    </div>
  );
}

// Simple bar chart component
function SimpleBarChart({ data }: { data: ChartDataPoint[] }) {
  const maxAmount = Math.max(...data.map(d => d.amount), 1);

  return (
    <div className="flex h-48 items-end gap-1">
      {data.map((point, index) => {
        const height = (point.amount / maxAmount) * 100;
        const isToday = index === data.length - 1;

        return (
          <div key={point.date} className="group relative flex flex-1 flex-col items-center">
            <div
              className={`w-full rounded-t transition-all ${
                isToday ? 'bg-lime-500' : 'bg-lime-300 hover:bg-lime-400'
              }`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <div className="absolute -top-8 hidden rounded bg-gray-800 px-2 py-1 text-xs text-white group-hover:block">
              {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(point.amount / 100)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboardData() {
      try {
        const [statsRes, chartRes, salesRes] = await Promise.all([
          api.get('/dashboard/stats'),
          api.get('/dashboard/chart?days=30'),
          api.get('/dashboard/sales?limit=5'),
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentSales(salesRes.data);
      } catch (error) {
        console.error('Error fetching dashboard data', error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, []);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(cents / 100);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' }).format(new Date(dateStr));

  if (loading) return <div className="p-8">Carregando dashboard...</div>;
  if (!stats) return <div className="p-8">Erro ao carregar dashboard.</div>;

  return (
    <DashboardLayout>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Vendas Totais</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSales}</p>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Receita Liquida</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
               {formatCurrency(stats.totalEarnings)}
            </p>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saldo Disponivel</p>
            <p className="mt-2 text-3xl font-bold text-lime-600">
               {formatCurrency(stats.availableBalance)}
            </p>
            <Button size="sm" className="mt-4 w-full" disabled={stats.availableBalance < 5000}>
               Solicitar Saque
            </Button>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saldo Pendente</p>
            <p className="mt-2 text-3xl font-bold text-gray-400">
               {formatCurrency(stats.pendingBalance)}
            </p>
            <p className="mt-1 text-xs text-gray-400">Liberado apos 14 dias</p>
         </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
         {/* Sales Chart */}
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Vendas (Ultimos 30 dias)</h3>
            <div className="mt-4">
              {chartData.length > 0 ? (
                <SimpleBarChart data={chartData} />
              ) : (
                <div className="flex h-48 items-center justify-center text-gray-400">
                  Nenhuma venda no periodo
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-between text-xs text-gray-400">
              <span>{chartData[0]?.date ? new Date(chartData[0].date).toLocaleDateString('pt-BR') : ''}</span>
              <span>Hoje</span>
            </div>
         </div>

         {/* Recent Activity */}
         <div className="rounded-xl bg-white p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
             <div className="mt-4 space-y-4">
                {recentSales.length === 0 ? (
                  <p className="text-sm text-gray-500">Nenhuma venda recente.</p>
                ) : (
                  recentSales.map((sale) => (
                    <div key={sale.id} className="flex items-center justify-between border-b pb-3 last:border-0">
                      <div>
                        <p className="font-medium text-gray-900">{sale.pack.title}</p>
                        <p className="text-xs text-gray-500">{formatDate(sale.createdAt)}</p>
                      </div>
                      <p className="font-semibold text-lime-600">
                        +{formatCurrency(sale.creatorEarnings)}
                      </p>
                    </div>
                  ))
                )}
             </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
