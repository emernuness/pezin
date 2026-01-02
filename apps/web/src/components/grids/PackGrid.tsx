import { cn } from "@/lib/utils";

type GridColumns = 2 | 3 | 4;

interface PackGridProps {
  children: React.ReactNode;
  columns?: GridColumns;
  className?: string;
}

const columnStyles: Record<GridColumns, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

/**
 * Responsive grid layout for pack cards.
 * Supports 2, 3, or 4 column layouts.
 */
export function PackGrid({ children, columns = 4, className }: PackGridProps) {
  return (
    <div className={cn("grid gap-6", columnStyles[columns], className)}>
      {children}
    </div>
  );
}
