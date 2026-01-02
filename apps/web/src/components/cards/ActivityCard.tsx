import { formatCurrency, formatDate } from "@/utils/formatters";

interface ActivityCardProps {
  title: string;
  subtitle: string;
  amount: number;
  date: string | Date;
  positive?: boolean;
}

/**
 * Activity item card for recent sales/transactions.
 * Shows title, date, and amount with positive/negative indicator.
 */
export function ActivityCard({
  title,
  subtitle,
  amount,
  date,
  positive = true,
}: ActivityCardProps) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted/50 border border-border">
          <div className="h-2.5 w-2.5 rounded-full bg-primary" />
        </div>
        <div className="space-y-1">
          <p className="text-sm font-medium leading-none text-foreground">
            {title}
          </p>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="text-right">
        <div className="font-mono font-medium text-foreground">
          {positive ? "+" : "-"}{formatCurrency(amount)}
        </div>
        <div className="text-xs text-muted-foreground">
          {formatDate(date, { day: "2-digit", month: "short" })}
        </div>
      </div>
    </div>
  );
}
