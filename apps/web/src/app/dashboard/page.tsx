'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

// Simple Dashboard Layout
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-gray-50">
       <aside className="w-64 border-r bg-white p-6 hidden md:block">
          <nav className="space-y-2">
             <Link href="/dashboard">
                <Button variant="ghost" className="w-full justify-start">Visão Geral</Button>
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

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const { data } = await api.get('/dashboard/stats');
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats', error);
      }
    }
    fetchStats();
  }, []);

  if (!stats) return <div className="p-8">Carregando dashboard...</div>;

  return (
    <DashboardLayout>
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Vendas Totais</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">{stats.totalSales}</p>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Receita Líquida</p>
            <p className="mt-2 text-3xl font-bold text-gray-900">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.totalEarnings / 100)}
            </p>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saldo Disponível</p>
            <p className="mt-2 text-3xl font-bold text-lime-600">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.availableBalance / 100)}
            </p>
            <Button size="sm" className="mt-4 w-full" disabled={stats.availableBalance < 5000}>
               Solicitar Saque
            </Button>
         </div>
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <p className="text-sm font-medium text-gray-500">Saldo Pendente</p>
            <p className="mt-2 text-3xl font-bold text-gray-400">
               {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(stats.pendingBalance / 100)}
            </p>
         </div>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
         {/* Simple placeholder for Chart */}
         <div className="rounded-xl bg-white p-6 shadow-sm">
            <h3 className="text-lg font-semibold text-gray-900">Vendas (Últimos 30 dias)</h3>
            <div className="mt-4 flex h-64 items-center justify-center rounded-lg bg-gray-50 text-gray-400">
               Gráfico de Vendas Aqui
            </div>
         </div>

         <div className="rounded-xl bg-white p-6 shadow-sm">
             <h3 className="text-lg font-semibold text-gray-900">Atividade Recente</h3>
             <div className="mt-4 space-y-4">
                <p className="text-sm text-gray-500">Nenhuma venda recente.</p>
             </div>
         </div>
      </div>
    </DashboardLayout>
  );
}
