import { cn } from "@/lib/utils";
import { PACK_STATUS_LABELS, PACK_STATUS_COLORS } from "@/utils/constants";

type PackStatus = "draft" | "published" | "unpublished" | "deleted";

interface StatusBadgeProps {
  status: PackStatus;
  className?: string;
}

/**
 * Badge component for displaying pack status.
 * Uses predefined colors and labels from constants.
 */
export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        PACK_STATUS_COLORS[status],
        className
      )}
    >
      {PACK_STATUS_LABELS[status]}
    </span>
  );
}
