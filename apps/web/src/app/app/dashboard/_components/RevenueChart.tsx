"use client";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatShortDate } from "@/utils/formatters";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { ChartDataPoint } from "./types";
import { cn } from "@/lib/utils";

interface RevenueChartProps {
  data: ChartDataPoint[];
  className?: string;
}

/**
 * Custom tooltip for the revenue chart.
 */
function CustomTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
}) {
  if (active && payload && payload.length && label) {
    return (
      <div className="rounded-lg border border-border bg-card p-2 shadow-sm">
        <div className="grid grid-cols-2 gap-2">
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Data
            </span>
            <span className="font-bold text-foreground">
              {formatShortDate(label)}
            </span>
          </div>
          <div className="flex flex-col">
            <span className="text-[0.70rem] uppercase text-muted-foreground">
              Vendas
            </span>
            <span className="font-bold text-primary-foreground bg-primary px-1 rounded-sm text-xs">
              {formatCurrency(payload[0].value)}
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
}

/**
 * Revenue chart showing earnings over the last 30 days.
 */
export function RevenueChart({ data, className }: RevenueChartProps) {
  return (
    <Card className={cn("shadow-sm border-border bg-card", className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">
          Receita (30 dias)
        </h3>
        <p className="text-sm text-muted-foreground">
          Acompanhe o desempenho das suas vendas diárias.
        </p>
      </CardHeader>
      <CardContent className="pl-0">
        <div className="h-[300px] w-full">
          {data.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={data}
                margin={{
                  top: 10,
                  right: 30,
                  left: 0,
                  bottom: 0,
                }}
              >
                <defs>
                  <linearGradient id="colorEarnings" x1="0" y1="0" x2="0" y2="1">
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
                  tickFormatter={(value) => formatShortDate(value)}
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
  );
}
