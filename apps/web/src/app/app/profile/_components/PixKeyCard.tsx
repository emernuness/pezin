"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Wallet, CheckCircle2, Loader2, AlertCircle } from "lucide-react";
import { api } from "@/services/api";
import { updatePixKeySchema } from "@pack-do-pezin/shared";
import type { PixKeyType } from "@pack-do-pezin/shared";

interface PixKeyCardProps {
  currentPixKey: string | null;
  currentPixKeyType: PixKeyType | null;
  onPixKeyUpdate: (pixKey: string | null, pixKeyType: PixKeyType | null) => void;
}

const PIX_KEY_TYPES = [
  { value: "cpf", label: "CPF", placeholder: "000.000.000-00" },
  { value: "cnpj", label: "CNPJ", placeholder: "00.000.000/0001-00" },
  { value: "email", label: "E-mail", placeholder: "seu@email.com" },
  { value: "phone", label: "Telefone", placeholder: "+55 (11) 99999-9999" },
  { value: "evp", label: "Chave Aleatória", placeholder: "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx" },
] as const;

/**
 * Card for configuring PIX key for payouts (creators only).
 * Allows creators to set their PIX key type and value.
 */
export function PixKeyCard({
  currentPixKey,
  currentPixKeyType,
  onPixKeyUpdate,
}: PixKeyCardProps) {
  const [pixKeyType, setPixKeyType] = useState<PixKeyType | "">(currentPixKeyType || "");
  const [pixKey, setPixKey] = useState(currentPixKey || "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const hasChanges =
    (pixKeyType !== (currentPixKeyType || "")) ||
    (pixKey !== (currentPixKey || ""));

  const selectedType = PIX_KEY_TYPES.find((t) => t.value === pixKeyType);

  async function handleSave() {
    setError(null);
    setSuccess(false);

    if (!pixKeyType) {
      setError("Selecione o tipo de chave PIX");
      return;
    }

    const parsed = updatePixKeySchema.safeParse({ pixKeyType, pixKey });
    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Dados inválidos");
      return;
    }

    setSaving(true);

    try {
      const res = await api.patch("/auth/pix-key", { pixKeyType, pixKey });
      onPixKeyUpdate(res.data.user.pixKey, res.data.user.pixKeyType);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao salvar chave PIX");
    } finally {
      setSaving(false);
    }
  }

  async function handleRemove() {
    setError(null);
    setSuccess(false);
    setSaving(true);

    try {
      await api.delete("/auth/pix-key");
      setPixKey("");
      setPixKeyType("");
      onPixKeyUpdate(null, null);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao remover chave PIX");
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card className="shadow-sm border-border bg-card">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wallet className="h-5 w-5" />
          Chave PIX para Saques
        </CardTitle>
        <CardDescription>
          Configure sua chave PIX para receber pagamentos.
          Os saques são processados automaticamente via PIX.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="pixKeyType">Tipo de Chave *</Label>
            <Select
              value={pixKeyType}
              onValueChange={(value) => setPixKeyType(value as PixKeyType)}
            >
              <SelectTrigger id="pixKeyType">
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PIX_KEY_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="pixKey">Chave PIX *</Label>
            <Input
              id="pixKey"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
              placeholder={selectedType?.placeholder || "Sua chave PIX"}
              maxLength={100}
              disabled={!pixKeyType}
            />
          </div>
        </div>

        {currentPixKey && currentPixKeyType && (
          <div className="flex items-center gap-2 p-3 bg-green-50 dark:bg-green-950 rounded-lg border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-4 w-4 text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">
              Chave PIX configurada: <strong>{currentPixKeyType.toUpperCase()}</strong> - {maskPixKey(currentPixKey, currentPixKeyType)}
            </span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Chave PIX atualizada com sucesso!
          </div>
        )}

        <div className="flex gap-3">
          <Button
            type="button"
            onClick={handleSave}
            disabled={saving || !hasChanges || !pixKeyType || !pixKey}
            className="bg-primary text-primary-foreground hover:bg-primary/90"
          >
            {saving ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Salvando...
              </>
            ) : (
              "Salvar Chave PIX"
            )}
          </Button>

          {currentPixKey && (
            <Button
              type="button"
              variant="outline"
              onClick={handleRemove}
              disabled={saving}
            >
              Remover
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

/**
 * Mask PIX key for display (privacy protection)
 */
function maskPixKey(key: string, type: PixKeyType): string {
  switch (type) {
    case "cpf":
      return key.replace(/(\d{3})\.\d{3}\.\d{3}(-\d{2})/, "$1.***.***$2");
    case "cnpj":
      return key.replace(/(\d{2})\.\d{3}\.\d{3}(\/\d{4}-\d{2})/, "$1.***.***$2");
    case "email": {
      const [local, domain] = key.split("@");
      if (!local || !domain) return key;
      return `${local.slice(0, 2)}***@${domain}`;
    }
    case "phone":
      return key.replace(/(\+?\d{2,4}\s?\(?\d{2}\)?)\s?\d{4,5}(-?\d{4})/, "$1 *****$2");
    case "evp":
      return `${key.slice(0, 8)}...${key.slice(-4)}`;
    default:
      return "***";
  }
}
