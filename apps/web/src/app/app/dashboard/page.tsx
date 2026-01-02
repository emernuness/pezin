"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { AlertTriangle, TrendingUp } from "lucide-react";
import Link from "next/link";
import type React from "react";
import { useEffect, useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

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

function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <aside className="w-64 border-r border-border bg-card p-6 hidden md:block">
        <nav className="space-y-2">
          <Button
            variant="ghost"
            className="w-full justify-start font-medium text-foreground"
            asChild
          >
            <Link href="/app/dashboard">Visao Geral</Link>
          </Button>
          <Button
            variant="ghost"
            className="w-full justify-start text-muted-foreground hover:text-foreground"
            asChild
          >
            <Link href="/app/dashboard/packs">Meus Packs</Link>
          </Button>
        </nav>
      </aside>
      <div className="flex-1 p-8 space-y-8">{children}</div>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <DashboardLayout>
      <Skeleton className="h-10 w-48" />
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        <Skeleton className="h-80 rounded-2xl" />
        <Skeleton className="h-80 rounded-2xl" />
      </div>
    </DashboardLayout>
  );
}

function CreatorOnlyGate() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="max-w-md text-center border-border shadow-card">
        <CardHeader className="pb-4">
          <AlertTriangle className="mx-auto h-12 w-12 text-destructive mb-4" aria-hidden="true" />
          <h1 className="text-xl font-bold text-foreground">
            Area exclusiva para criadores
          </h1>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Esta pagina e apenas para criadores de conteudo.
          </p>
          <div className="flex flex-col gap-2">
            <Button
              asChild
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              <Link href="/app/me/purchases">Ver minhas compras</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/app/explore">Explorar vitrine</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number }[]; label?: string }) => {
  if (active && payload && payload.length && label) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Data
            </span>
            <span className="font-bold text-foreground">
              {new Date(label).toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "short",
              })}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Vendas
            </span>
            <span className="font-bold text-primary-foreground bg-primary px-1 rounded-sm text-xs">
              {new Intl.NumberFormat("pt-BR", {
                style: "currency",
                currency: "BRL",
              }).format(payload[0].value / 100)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);
  const [recentSales, setRecentSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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

  if (authLoading) return <DashboardSkeleton />;
  if (user && user.userType !== "creator") return <CreatorOnlyGate />;
  if (loading) return <DashboardSkeleton />;

  if (!stats) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Erro ao carregar dashboard.
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visao geral dos seus ganhos e performance.
          </p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-foreground text-background border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <TrendingUp size={64} aria-hidden="true" />
          </div>
          <CardHeader className="p-6 pb-2 relative z-10">
            <p className="text-sm font-medium text-muted-foreground/80">
              Saldo Disponivel
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0 relative z-10">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-bold text-primary font-mono tracking-tight">
                {formatCurrency(stats.availableBalance)}
              </span>
            </div>
            <Button
              size="sm"
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={stats.availableBalance < 5000}
              title={stats.availableBalance < 5000 ? "Saldo minimo de R$ 50,00 necessario" : undefined}
            >
              Solicitar Saque
            </Button>
            {stats.availableBalance < 5000 && (
              <p className="mt-2 text-xs text-muted-foreground/80 text-center">
                Minimo de R$ 50,00 para saque
              </p>
            )}
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Receita Liquida
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
              {formatCurrency(stats.totalEarnings)}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Total acumulado
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Vendas Totais
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight">
              {stats.totalSales}
            </p>
            <p className="text-xs text-muted-foreground mt-1">packs vendidos</p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <p className="text-sm font-medium text-muted-foreground">
              Saldo Pendente
            </p>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight opacity-60">
              {formatCurrency(stats.pendingBalance)}
            </p>
            <p className="mt-1 text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500/50" aria-hidden="true" />
              Liberado apos 14 dias
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-7 mt-8">
        <Card className="lg:col-span-4 shadow-sm border-border bg-card">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Receita (30 dias)
            </h3>
            <p className="text-sm text-muted-foreground">
              Acompanhe o desempenho das suas vendas diarias.
            </p>
          </CardHeader>
          <CardContent className="pl-0">
            <div className="h-[300px] w-full">
              {chartData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart
                    data={chartData}
                    margin={{
                      top: 10,
                      right: 30,
                      left: 0,
                      bottom: 0,
                    }}
                  >
                    <defs>
                      <linearGradient
                        id="colorEarnings"
                        x1="0"
                        y1="0"
                        x2="0"
                        y2="1"
                      >
                        <stop
                          offset="5%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0.3}
                        />
                        <stop
                          offset="95%"
                          stopColor="hsl(var(--primary))"
                          stopOpacity={0}
                        />
                      </linearGradient>
                    </defs>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      vertical={false}
                      stroke="hsl(var(--border))"
                      opacity={0.4}
                    />
                    <XAxis
                      dataKey="date"
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) =>
                        new Date(value).toLocaleDateString("pt-BR", {
                          day: "numeric",
                          month: "short",
                        })
                      }
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      tickMargin={10}
                    />
                    <YAxis
                      tickLine={false}
                      axisLine={false}
                      tickFormatter={(value) => `R$ ${value / 100}`}
                      stroke="hsl(var(--muted-foreground))"
                      fontSize={12}
                      width={80}
                    />
                    <Tooltip content={<CustomTooltip />} />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorEarnings)"
                      activeDot={{
                        r: 6,
                        style: { fill: "hsl(var(--primary))", strokeWidth: 0 },
                      }}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="flex h-full items-center justify-center text-muted-foreground">
                  Sem dados para exibir
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 shadow-sm border-border bg-card">
          <CardHeader>
            <h3 className="text-lg font-semibold text-foreground">
              Atividade Recente
            </h3>
            <p className="text-sm text-muted-foreground">
              Ultimas 5 vendas realizadas.
            </p>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {recentSales.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  Nenhuma venda recente.
                </p>
              ) : (
                recentSales.map((sale) => (
                  <div
                    key={sale.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 border border-border">
                        <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium leading-none text-foreground">
                          {sale.pack.title}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {formatDate(sale.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="font-mono font-medium text-foreground">
                      +{formatCurrency(sale.creatorEarnings)}
                    </div>
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
