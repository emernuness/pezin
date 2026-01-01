"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { AlertTriangle } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";

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

interface DashboardStats {
  totalSales: number;
  totalEarnings: number;
  availableBalance: number;
  pendingBalance: number;
}

// Simple Dashboard Layout
function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-muted">
      <aside className="w-64 border-r border-border bg-card p-6 hidden md:block">
        <nav className="space-y-2">
          <Link href="/dashboard">
            <Button variant="ghost" className="w-full justify-start">
              Visão Geral
            </Button>
          </Link>
          <Link href="/dashboard/packs">
            <Button variant="ghost" className="w-full justify-start">
              Meus Packs
            </Button>
          </Link>
        </nav>
      </aside>
      <div className="flex-1 p-8">{children}</div>
    </div>
  );
}

// Skeleton para loading
function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <Skeleton className="h-10 w-48 mb-8" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-lg" />
        ))}
      </div>
      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-64 rounded-lg" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </DashboardLayout>
  );
}

// Tela de bloqueio para não-criadores
function CreatorOnlyGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-4">
      <Card className="max-w-md text-center">
        <CardHeader className="pb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" />
          <h1 className="text-xl font-bold text-foreground">
            Área exclusiva para criadores
          </h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta página é apenas para criadores de conteúdo. Se você quer vender
            seus packs, crie uma conta como criador.
          </p>
          <div className="flex flex-col gap-2">
            <Button asChild>
              <Link href="/me/purchases">Ver minhas compras</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/">Explorar vitrine</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Simple bar chart component
function SimpleBarChart({ data }: { data: ChartDataPoint[] }) {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1);

  return (
    <div className="flex h-48 items-end gap-1">
      {data.map((point, index) => {
        const height = (point.amount / maxAmount) * 100;
        const isToday = index === data.length - 1;

        return (
          <div
            key={point.date}
            className="group relative flex flex-1 flex-col items-center"
          >
            <div
              className={`w-full rounded-t transition-all ${
                isToday ? "bg-primary" : "bg-primary/50 hover:bg-primary/70"
              }`}
              style={{ height: `${Math.max(height, 2)}%` }}
            />
            <div className="absolute -top-8 hidden rounded bg-popover px-2 py-1 text-xs text-popover-foreground shadow-md group-hover:block font-mono">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(point.amount / 100)}
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Só busca dados se for criador
    if (user?.userType !== "creator") {
      setLoading(false);
      return;
    }

    async function fetchDashboardData() {
      try {
        const [statsRes, chartRes, salesRes] = await Promise.all([
          api.get("/dashboard/stats"),
          api.get("/dashboard/chart?days=30"),
          api.get("/dashboard/sales?limit=5"),
        ]);

        setStats(statsRes.data);
        setChartData(chartRes.data);
        setRecentSales(salesRes.data);
      } catch (error) {
        console.error("Error fetching dashboard data", error);
      } finally {
        setLoading(false);
      }
    }
    fetchDashboardData();
  }, [user?.userType]);

  const formatCurrency = (cents: number) =>
    new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(cents / 100);

  const formatDate = (dateStr: string) =>
    new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateStr));

  // Loading do auth
  if (authLoading) {
    return <DashboardSkeleton />;
  }

  // Proteção: apenas criadores podem acessar
  if (user && user.userType !== "creator") {
    return <CreatorOnlyGate />;
  }

  // Loading dos dados
  if (loading) {
    return <DashboardSkeleton />;
  }

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="text-center py-12 text-muted-foreground">
          Erro ao carregar dashboard. Tente novamente.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="mb-8 text-3xl font-bold text-foreground">Dashboard</h1>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Vendas Totais
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono">
              {stats.totalSales}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Receita Líquida
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono">
              {formatCurrency(stats.totalEarnings)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Saldo Disponível
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-primary font-mono">
              {formatCurrency(stats.availableBalance)}
            </p>
            <Button
              size="sm"
              className="mt-4 w-full"
              disabled={stats.availableBalance < 5000}
            >
              Solicitar Saque
            </Button>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Saldo Pendente
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-muted-foreground font-mono">
              {formatCurrency(stats.pendingBalance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Liberado após 14 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Sales Chart */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Vendas (Últimos 30 dias)
            </h3>
          </CardHeader>
          <CardContent>
            <div className="mt-4">
              {chartData.length > 0 ? (
                <SimpleBarChart data={chartData} />
              ) : (
                <div className="flex h-48 items-center justify-center text-muted-foreground">
                  Nenhuma venda no periodo
                </div>
              )}
            </div>
            <div className="mt-2 flex justify-between text-xs text-muted-foreground">
              <span>
                {chartData[0]?.date
                  ? new Date(chartData[0].date).toLocaleDateString("pt-BR")
                  : ""}
              </span>
              <span>Hoje</span>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Atividade Recente
            </h3>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Nenhuma venda recente.
                </p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between border-b border-border pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {sale.pack.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(sale.createdAt)}
                      </p>
                    </div>
                    <p className="font-semibold text-primary font-mono">
                      +{formatCurrency(sale.creatorEarnings)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
