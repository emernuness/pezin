import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type EmptyStateVariant = "page" | "inline" | "card";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
  variant?: EmptyStateVariant;
  className?: string;
}

const variantStyles: Record<EmptyStateVariant, string> = {
  page: "py-16 px-4",
  inline: "py-8 px-4",
  card: "py-12 px-6 bg-card border-border",
};

/**
 * Empty state component for when there's no data to display.
 * Supports three variants:
 * - page: Full page empty state with large padding
 * - inline: Smaller padding for inline sections
 * - card: For use inside cards with card background
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  variant = "page",
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-muted/50",
        variantStyles[variant],
        className
      )}
    >
      <Icon className="h-12 w-12 text-muted-foreground mb-4" aria-hidden="true" />
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground text-center max-w-md mb-6">
        {description}
      </p>
      {action}
    </div>
  );
}
