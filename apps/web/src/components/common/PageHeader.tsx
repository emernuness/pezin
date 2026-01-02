"use client";

import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface PageHeaderAction {
  label: string;
  href?: string;
  onClick?: () => void;
  icon?: LucideIcon;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive";
  disabled?: boolean;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  action?: PageHeaderAction;
  children?: React.ReactNode;
}

/**
 * Standard page header with title, optional description, and action button.
 * Use this component for consistent page headers across the application.
 */
export function PageHeader({
  title,
  description,
  action,
  children,
}: PageHeaderProps) {
  const ActionButton = action && (
    <Button
      variant={action.variant ?? "default"}
      onClick={action.onClick}
      disabled={action.disabled}
      className={
        action.variant === "default" || !action.variant
          ? "bg-primary text-primary-foreground hover:bg-primary/90"
          : undefined
      }
      asChild={!!action.href}
    >
      {action.href ? (
        <Link href={action.href}>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </Link>
      ) : (
        <>
          {action.icon && <action.icon className="mr-2 h-4 w-4" />}
          {action.label}
        </>
      )}
    </Button>
  );

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="space-y-1">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      {ActionButton}
      {children}
    </div>
  );
}
