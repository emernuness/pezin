"use client";

import { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Copy, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PixQRCodeProps {
  qrCode: string;
  qrCodeText: string;
  amount: number;
  expiresAt: string;
}

/**
 * PIX QR Code display component.
 * Shows the QR code image and copy-paste code.
 */
export function PixQRCode({
  qrCode,
  qrCodeText,
  amount,
  expiresAt,
}: PixQRCodeProps) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState("");
  const timerRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    function updateTimer() {
      const now = new Date().getTime();
      const expiry = new Date(expiresAt).getTime();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft("Expirado");
        if (timerRef.current) {
          clearInterval(timerRef.current);
        }
        return;
      }

      const minutes = Math.floor(diff / 60000);
      const seconds = Math.floor((diff % 60000) / 1000);
      setTimeLeft(`${minutes}:${seconds.toString().padStart(2, "0")}`);
    }

    updateTimer();
    timerRef.current = setInterval(updateTimer, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [expiresAt]);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(qrCodeText);
      setCopied(true);
      toast.success("Código PIX copiado!");
      setTimeout(() => setCopied(false), 3000);
    } catch {
      toast.error("Erro ao copiar código");
    }
  }

  const formattedAmount = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(amount / 100);

  const isExpired = timeLeft === "Expirado";

  return (
    <Card className="shadow-lg border-border bg-card overflow-hidden">
      <CardContent className="p-6 space-y-6">
        {/* Amount display */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Valor a pagar</p>
          <p className="text-3xl font-bold font-mono text-foreground">
            {formattedAmount}
          </p>
        </div>

        {/* QR Code */}
        <div className="flex justify-center">
          <div
            className={`p-4 bg-white rounded-xl shadow-inner ${
              isExpired ? "opacity-50" : ""
            }`}
          >
            {/* The qrCode is a base64 data URL */}
            <img
              src={qrCode}
              alt="QR Code PIX"
              className="w-48 h-48 md:w-64 md:h-64"
            />
          </div>
        </div>

        {/* Timer */}
        <div className="text-center">
          <p className="text-sm text-muted-foreground">Tempo restante</p>
          <p
            className={`text-2xl font-mono font-bold ${
              isExpired
                ? "text-destructive"
                : timeLeft.startsWith("0") || parseInt(timeLeft) < 2
                  ? "text-yellow-600"
                  : "text-foreground"
            }`}
          >
            {timeLeft}
          </p>
        </div>

        {/* Copy code section */}
        <div className="space-y-3">
          <p className="text-sm text-center text-muted-foreground">
            Ou copie o código PIX abaixo:
          </p>
          <div className="relative">
            <div className="p-3 bg-muted/50 rounded-lg text-xs font-mono break-all text-muted-foreground max-h-24 overflow-y-auto">
              {qrCodeText}
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full"
            onClick={handleCopy}
            disabled={isExpired}
          >
            {copied ? (
              <>
                <CheckCircle2 className="mr-2 h-4 w-4 text-green-600" />
                Copiado!
              </>
            ) : (
              <>
                <Copy className="mr-2 h-4 w-4" />
                Copiar Código PIX
              </>
            )}
          </Button>
        </div>

        {/* Instructions */}
        <div className="text-xs text-muted-foreground space-y-1 border-t border-border pt-4">
          <p className="font-medium">Como pagar:</p>
          <ol className="list-decimal list-inside space-y-1">
            <li>Abra o app do seu banco</li>
            <li>Escolha pagar com PIX QR Code ou Copia e Cola</li>
            <li>Escaneie o QR Code ou cole o código copiado</li>
            <li>Confirme o pagamento</li>
          </ol>
        </div>

        {isExpired && (
          <div className="p-3 bg-destructive/10 rounded-lg text-center">
            <p className="text-sm text-destructive font-medium">
              Este QR Code expirou. Por favor, inicie uma nova compra.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
