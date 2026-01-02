"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { api } from "@/services/api";

interface EmailVerificationAlertProps {
  email: string;
  onError: (message: string) => void;
}

/**
 * Alert card prompting user to verify their email.
 * Includes button to resend verification email.
 */
export function EmailVerificationAlert({ email, onError }: EmailVerificationAlertProps) {
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleResend() {
    setSending(true);

    try {
      await api.post("/auth/resend-verification");
      setSent(true);
      setTimeout(() => setSent(false), 5000);
    } catch (err: any) {
      onError(err.response?.data?.message || "Erro ao reenviar email de verificação");
    } finally {
      setSending(false);
    }
  }

  return (
    <Card className="border-yellow-500/50 bg-yellow-500/5">
      <CardContent className="p-4 flex items-center gap-3">
        <Mail className="h-5 w-5 text-yellow-600 shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
            Verifique seu email
          </p>
          <p className="text-xs text-yellow-700 dark:text-yellow-300">
            Enviamos um link de verificação para {email}. Verifique sua caixa de entrada.
          </p>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={handleResend}
          disabled={sending || sent}
          className="shrink-0"
        >
          {sending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : sent ? (
            <>
              <CheckCircle2 className="h-4 w-4 mr-1" />
              Enviado!
            </>
          ) : (
            "Reenviar"
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
