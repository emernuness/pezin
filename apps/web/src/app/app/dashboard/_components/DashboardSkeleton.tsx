import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading state for the dashboard page.
 */
export function DashboardSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
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
    </div>
  );
}
