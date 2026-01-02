"use client";

import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import type { StepProps } from "./types";

/**
 * Step 4: Summary and terms acceptance.
 */
export function StepTerms({ formData, updateField, fieldErrors }: StepProps) {
  return (
    <div className="space-y-6">
      {/* Summary */}
      <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
        <h4 className="font-medium">Resumo do cadastro</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tipo de conta</span>
            <span>
              {formData.userType === "creator" ? "Criador" : "Comprador"}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span>{formData.email}</span>
          </div>
          {formData.userType === "creator" && formData.displayName && (
            <div className="flex justify-between">
              <span className="text-muted-foreground">Nome artístico</span>
              <span>{formData.displayName}</span>
            </div>
          )}
        </div>
      </div>

      {/* Terms Checkbox */}
      <div className="flex items-start gap-3">
        <Checkbox
          id="acceptTerms"
          checked={formData.acceptTerms}
          onCheckedChange={(checked) =>
            updateField("acceptTerms", checked === true)
          }
          className="mt-0.5"
        />
        <Label
          htmlFor="acceptTerms"
          className="cursor-pointer text-sm font-normal leading-relaxed"
        >
          Declaro que tenho 18+ anos, aceito os{" "}
          <Link
            href="/termos"
            className="text-primary hover:underline"
            target="_blank"
          >
            Termos de Uso
          </Link>{" "}
          e a{" "}
          <Link
            href="/privacidade"
            className="text-primary hover:underline"
            target="_blank"
          >
            Política de Privacidade
          </Link>
        </Label>
      </div>
      {fieldErrors.acceptTerms && (
        <p className="text-sm text-destructive">{fieldErrors.acceptTerms}</p>
      )}
    </div>
  );
}
