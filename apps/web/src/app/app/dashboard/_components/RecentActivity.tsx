import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/utils/formatters";
import type { Sale } from "./types";
import { cn } from "@/lib/utils";

interface RecentActivityProps {
  sales: Sale[];
  className?: string;
}

/**
 * Recent activity card showing the last 5 sales.
 */
export function RecentActivity({ sales, className }: RecentActivityProps) {
  return (
    <Card className={cn("shadow-sm border-border bg-card", className)}>
      <CardHeader>
        <h3 className="text-lg font-semibold text-foreground">
          Atividade Recente
        </h3>
        <p className="text-sm text-muted-foreground">
          Últimas 5 vendas realizadas.
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {sales.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhuma venda recente.
            </p>
          ) : (
            sales.map((sale) => (
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
  );
}
