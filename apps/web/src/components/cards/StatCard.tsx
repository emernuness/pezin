"use client";

import type { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type StatCardVariant = "default" | "primary" | "dark";

interface StatCardAction {
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  disabledMessage?: string;
}

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: LucideIcon;
  variant?: StatCardVariant;
  action?: StatCardAction;
  muted?: boolean;
  className?: string;
}

const variantStyles: Record<StatCardVariant, { card: string; title: string; value: string; subtitle: string; button: string }> = {
  default: {
    card: "shadow-sm border-border bg-card",
    title: "text-muted-foreground",
    value: "text-foreground",
    subtitle: "text-muted-foreground",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
  primary: {
    card: "bg-primary text-primary-foreground border-none shadow-lg",
    title: "text-primary-foreground/80",
    value: "text-primary-foreground",
    subtitle: "text-primary-foreground/70",
    button: "bg-black text-white hover:bg-black/80",
  },
  dark: {
    card: "bg-foreground text-background border-none shadow-lg",
    title: "text-muted-foreground/80",
    value: "text-primary",
    subtitle: "text-muted-foreground/80",
    button: "bg-primary text-primary-foreground hover:bg-primary/90",
  },
};

/**
 * Stat card for dashboard metrics.
 * Supports three visual variants: default, primary, and dark.
 */
export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  variant = "default",
  action,
  muted = false,
  className,
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <Card className={cn(styles.card, "relative overflow-hidden", className)}>
      {Icon && (
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Icon size={64} aria-hidden="true" />
        </div>
      )}
      <CardHeader className="p-6 pb-2 relative z-10">
        <p className={cn("text-sm font-medium", styles.title)}>{title}</p>
      </CardHeader>
      <CardContent className="p-6 pt-0 relative z-10">
        <p
          className={cn(
            "text-3xl font-bold font-mono tracking-tight",
            styles.value,
            muted && "opacity-60"
          )}
        >
          {value}
        </p>
        {subtitle && (
          <p className={cn("text-xs mt-1", styles.subtitle)}>{subtitle}</p>
        )}
        {action && (
          <>
            <Button
              size="sm"
              className={cn("mt-4 w-full font-semibold", styles.button)}
              onClick={action.onClick}
              disabled={action.disabled}
              title={action.disabled ? action.disabledMessage : undefined}
            >
              {action.label}
            </Button>
            {action.disabled && action.disabledMessage && (
              <p className={cn("mt-2 text-xs text-center", styles.subtitle)}>
                {action.disabledMessage}
              </p>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
