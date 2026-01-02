"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "@/lib/utils";
import type { StepProps } from "./types";

/**
 * Step 2: Email and password credentials.
 */
export function StepCredentials({ formData, updateField, fieldErrors }: StepProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => updateField("email", e.target.value)}
          placeholder="seu@email.com"
          autoComplete="email"
          className={cn(fieldErrors.email && "border-destructive")}
        />
        {fieldErrors.email && (
          <p className="text-sm text-destructive">{fieldErrors.email}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Senha</Label>
        <div className="relative">
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            value={formData.password}
            onChange={(e) => updateField("password", e.target.value)}
            placeholder="Min. 8 caracteres"
            autoComplete="new-password"
            className={cn(
              "pr-10",
              fieldErrors.password && "border-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {fieldErrors.password ? (
          <p className="text-sm text-destructive">{fieldErrors.password}</p>
        ) : (
          <p className="text-xs text-muted-foreground">
            Letras maiúsculas, minúsculas e números
          </p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirmPassword">Confirmar senha</Label>
        <div className="relative">
          <Input
            id="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) => updateField("confirmPassword", e.target.value)}
            placeholder="Digite a senha novamente"
            autoComplete="new-password"
            className={cn(
              "pr-10",
              fieldErrors.confirmPassword && "border-destructive"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
        {fieldErrors.confirmPassword && (
          <p className="text-sm text-destructive">{fieldErrors.confirmPassword}</p>
        )}
      </div>
    </div>
  );
}
