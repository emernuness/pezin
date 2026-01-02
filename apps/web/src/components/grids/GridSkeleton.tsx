import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

type GridColumns = 2 | 3 | 4;

interface GridSkeletonProps {
  count?: number;
  columns?: GridColumns;
  aspectRatio?: "square" | "portrait" | "landscape";
  className?: string;
}

const columnStyles: Record<GridColumns, string> = {
  2: "grid-cols-1 sm:grid-cols-2",
  3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
  4: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4",
};

const aspectStyles = {
  square: "aspect-square",
  portrait: "aspect-[4/5]",
  landscape: "aspect-video",
};

/**
 * Skeleton loading grid for pack cards and similar content.
 * Matches PackGrid layout for seamless loading states.
 */
export function GridSkeleton({
  count = 8,
  columns = 4,
  aspectRatio = "portrait",
  className,
}: GridSkeletonProps) {
  return (
    <div className={cn("grid gap-6", columnStyles[columns], className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="rounded-lg overflow-hidden border border-border/50">
          <Skeleton className={cn("w-full", aspectStyles[aspectRatio])} />
          <div className="p-4 space-y-3">
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
            <div className="flex justify-between pt-2">
              <Skeleton className="h-5 w-20" />
              <Skeleton className="h-4 w-16" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
