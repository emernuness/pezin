import { Skeleton } from "@/components/ui/skeleton";

/**
 * Skeleton loading state for the profile page.
 */
export function ProfileSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}
