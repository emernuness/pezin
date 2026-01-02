import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface LoadingScreenProps {
  message?: string;
  className?: string;
  fullScreen?: boolean;
}

/**
 * Full-page or section loading screen with spinner.
 * Use fullScreen=true for page-level loading, false for section loading.
 */
export function LoadingScreen({
  message = "Carregando...",
  className,
  fullScreen = true,
}: LoadingScreenProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4",
        fullScreen && "min-h-screen bg-background",
        !fullScreen && "py-12",
        className
      )}
    >
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
      {message && (
        <p className="text-sm text-muted-foreground">{message}</p>
      )}
    </div>
  );
}
