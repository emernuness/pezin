"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { AlertCircle, CheckCircle2, CreditCard, ExternalLink, Loader2 } from "lucide-react";
import { useEffect, useState } from "react";

interface StripeStatus {
  connected: boolean;
  onboardingComplete: boolean;
  chargesEnabled: boolean;
  detailsSubmitted: boolean;
}

function StripeConnectSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-64" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export default function StripeConnectPage() {
  const { user, fetchMe } = useAuthStore();
  const [status, setStatus] = useState<StripeStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchStatus();
  }, []);

  async function fetchStatus() {
    try {
      const res = await api.get("/stripe/connect/status");
      setStatus(res.data);
    } catch (err) {
      console.error("Error fetching stripe status", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleConnect() {
    setConnecting(true);
    setError(null);

    try {
      const res = await api.post("/stripe/connect/onboard");
      window.location.href = res.data.url;
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao iniciar conexão");
      setConnecting(false);
    }
  }

  async function handleRefreshStatus() {
    setLoading(true);
    await fetchStatus();
    await fetchMe();
  }

  if (loading) return <StripeConnectSkeleton />;

  const isConnected = status?.connected || user?.stripeConnected;
  const isComplete = status?.onboardingComplete;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Conectar Stripe
        </h1>
        <p className="text-muted-foreground">
          Configure sua conta Stripe para receber pagamentos.
        </p>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="h-5 w-5" />
            Status da Conta Stripe
          </CardTitle>
          <CardDescription>
            Conecte sua conta Stripe para começar a receber pagamentos pelos seus packs.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {isConnected && isComplete ? (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-green-500/5 border border-green-500/20">
              <CheckCircle2 className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-semibold text-foreground">Conta Conectada</p>
                <p className="text-sm text-muted-foreground">
                  Sua conta Stripe está configurada e pronta para receber pagamentos.
                </p>
              </div>
            </div>
          ) : isConnected && !isComplete ? (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-yellow-500/5 border border-yellow-500/20">
              <AlertCircle className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="font-semibold text-foreground">Configuração Incompleta</p>
                <p className="text-sm text-muted-foreground">
                  Sua conta Stripe precisa de mais informações para ser ativada.
                </p>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border border-border">
              <CreditCard className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="font-semibold text-foreground">Conta Não Conectada</p>
                <p className="text-sm text-muted-foreground">
                  Você precisa conectar sua conta Stripe para receber pagamentos.
                </p>
              </div>
            </div>
          )}

          {status && (
            <div className="grid gap-3 text-sm">
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Conta criada</span>
                {status.connected ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Dados enviados</span>
                {status.detailsSubmitted ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg border border-border">
                <span className="text-muted-foreground">Pagamentos habilitados</span>
                {status.chargesEnabled ? (
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                ) : (
                  <span className="text-muted-foreground">-</span>
                )}
              </div>
            </div>
          )}

          <div className="flex gap-3">
            {!isComplete && (
              <Button
                onClick={handleConnect}
                disabled={connecting}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                {connecting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Redirecionando...
                  </>
                ) : (
                  <>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    {isConnected ? "Completar Configuração" : "Conectar Stripe"}
                  </>
                )}
              </Button>
            )}
            <Button variant="outline" onClick={handleRefreshStatus} disabled={loading}>
              Atualizar Status
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle>Por que usar o Stripe?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm text-muted-foreground">
          <p>
            O Stripe é uma plataforma de pagamentos segura e confiável que permite
            receber pagamentos de forma simples e rápida.
          </p>
          <ul className="list-disc list-inside space-y-2">
            <li>Receba pagamentos com cartão de crédito e débito</li>
            <li>Transferências automáticas para sua conta bancária</li>
            <li>Painel completo para acompanhar suas vendas</li>
            <li>Proteção contra fraudes incluída</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
}
