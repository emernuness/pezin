"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";

import {
  CreatorOnlyGate,
  DashboardSkeleton,
  RecentActivity,
  RevenueChart,
  StatsGrid,
  type ChartDataPoint,
  type DashboardStats,
  type Sale,
} from "./_components";

/**
 * Dashboard page for creators.
 * Shows stats, revenue chart, and recent sales.
 */
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

  if (authLoading || loading) return <DashboardSkeleton />;
  if (user && user.userType !== "creator") return <CreatorOnlyGate />;

  if (!stats) {
    return (
      <div className="flex-1 p-6 md:p-8">
        <div className="flex items-center justify-center py-12 text-muted-foreground">
          Erro ao carregar dashboard.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="text-muted-foreground">
            Visão geral dos seus ganhos e performance.
          </p>
        </div>
      </div>

      <StatsGrid stats={stats} />

      <div className="grid gap-6 lg:grid-cols-7 mt-8">
        <RevenueChart data={chartData} className="lg:col-span-4" />
        <RecentActivity sales={recentSales} className="lg:col-span-3" />
      </div>
    </div>
  );
}
