"use client";

import { ShoppingBag, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "./types";

/**
 * Step 1: User type selection (creator or consumer).
 */
export function StepUserType({ formData, updateField }: StepProps) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <button
        type="button"
        onClick={() => updateField("userType", "consumer")}
        className={cn(
          "flex flex-col items-center rounded-xl border-2 p-6 transition-all",
          formData.userType === "consumer"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <ShoppingBag
          className={cn(
            "mb-3 h-10 w-10",
            formData.userType === "consumer"
              ? "text-primary"
              : "text-muted-foreground"
          )}
        />
        <span className="font-semibold">Quero Comprar</span>
        <span className="mt-1 text-center text-xs text-muted-foreground">
          Acesse packs exclusivos
        </span>
      </button>

      <button
        type="button"
        onClick={() => updateField("userType", "creator")}
        className={cn(
          "flex flex-col items-center rounded-xl border-2 p-6 transition-all",
          formData.userType === "creator"
            ? "border-primary bg-primary/5"
            : "border-border hover:border-primary/50"
        )}
      >
        <Sparkles
          className={cn(
            "mb-3 h-10 w-10",
            formData.userType === "creator"
              ? "text-primary"
              : "text-muted-foreground"
          )}
        />
        <span className="font-semibold">Quero Vender</span>
        <span className="mt-1 text-center text-xs text-muted-foreground">
          Monetize seu conteúdo
        </span>
      </button>
    </div>
  );
}
