import { cn } from "@/lib/utils";
import { TOTAL_STEPS } from "./types";

interface StepIndicatorProps {
  currentStep: number;
}

/**
 * Visual step indicator showing progress through the signup form.
 */
export function StepIndicator({ currentStep }: StepIndicatorProps) {
  return (
    <div className="mb-4 flex items-center justify-center gap-2">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={cn(
            "h-2 w-8 rounded-full transition-colors",
            i + 1 <= currentStep ? "bg-primary" : "bg-muted"
          )}
        />
      ))}
    </div>
  );
}
