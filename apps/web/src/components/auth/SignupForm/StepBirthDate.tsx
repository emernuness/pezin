"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import type { StepProps } from "./types";

/**
 * Step 3: Birth date and display name (for creators).
 */
export function StepBirthDate({ formData, updateField, fieldErrors }: StepProps) {
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="birthDate">Data de nascimento</Label>
        <Input
          id="birthDate"
          type="date"
          value={formData.birthDate}
          onChange={(e) => updateField("birthDate", e.target.value)}
          className={cn(fieldErrors.birthDate && "border-destructive")}
        />
        {fieldErrors.birthDate ? (
          <p className="text-sm text-destructive">{fieldErrors.birthDate}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Você deve ter 18 anos ou mais
          </p>
        )}
      </div>

      {formData.userType === "creator" && (
        <div className="space-y-2">
          <Label htmlFor="displayName">Nome artístico</Label>
          <Input
            id="displayName"
            type="text"
            value={formData.displayName}
            onChange={(e) => updateField("displayName", e.target.value)}
            placeholder="Como você quer ser chamado(a)"
            className={cn(fieldErrors.displayName && "border-destructive")}
          />
          {fieldErrors.displayName ? (
            <p className="text-sm text-destructive">{fieldErrors.displayName}</p>
          ) : (
            <p className="text-xs text-muted-foreground">
              Este nome será exibido para seus compradores
            </p>
          )}
        </div>
      )}
    </div>
  );
}
