"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getWalletSummary,
  getPayoutHistory,
  requestPayout,
  type WalletSummary,
  type Payout,
} from "@/services/wallet.service";
import { useAuthStore } from "@/stores/auth.store";
import { formatDate } from "@/utils/formatters";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  DollarSign,
  Wallet,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

const PAYOUT_STATUS_LABELS: Record<
  Payout["status"],
  { label: string; className: string }
> = {
  pending: {
    label: "Pendente",
    className: "bg-yellow-100 text-yellow-800",
  },
  processing: {
    label: "Processando",
    className: "bg-blue-100 text-blue-800",
  },
  completed: {
    label: "Concluído",
    className: "bg-green-100 text-green-800",
  },
  failed: {
    label: "Falhou",
    className: "bg-red-100 text-red-800",
  },
};

function BalanceSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 md:grid-cols-3">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export default function BalancePage() {
  const { user } = useAuthStore();
  const [summary, setSummary] = useState<WalletSummary | null>(null);
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [summaryData, payoutsData] = await Promise.all([
        getWalletSummary(),
        getPayoutHistory(1, 10),
      ]);
      setSummary(summaryData);
      setPayouts(payoutsData.data);
    } catch (err) {
      console.error("Error fetching balance data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestWithdrawal() {
    if (!summary) return;

    setRequesting(true);
    setError(null);
    setSuccess(null);

    try {
      const result = await requestPayout(summary.balance.available);
      setSuccess(`Saque de ${result.formatted.amount} solicitado com sucesso!`);
      await fetchData();
    } catch (err: unknown) {
      const error = err as { response?: { data?: { message?: string } } };
      setError(error.response?.data?.message || "Erro ao solicitar saque");
    } finally {
      setRequesting(false);
    }
  }

  if (loading) return <BalanceSkeleton />;

  const hasPersonalData = user?.fullName && user?.cpf && user?.phone;
  const hasAddress = user?.address?.zipCode && user?.address?.street && user?.address?.city;
  const hasPixKey = !!user?.pixKey;
  const minBalance = 5000; // R$ 50.00 in cents
  const canWithdraw =
    summary &&
    summary.balance.available >= minBalance &&
    hasPixKey &&
    hasPersonalData &&
    hasAddress;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Saldo e Saques
        </h1>
        <p className="text-muted-foreground">
          Gerencie seu saldo e solicite saques via PIX.
        </p>
      </div>

      {/* Requirements checklist */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Requisitos para Saque</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 text-sm">
          <div className="flex items-center gap-2">
            {hasPersonalData ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span className={hasPersonalData ? "text-foreground" : "text-muted-foreground"}>
              Dados pessoais completos (CPF, telefone)
            </span>
            {!hasPersonalData && (
              <Link
                href="/app/profile"
                className="text-primary text-xs ml-auto hover:underline"
              >
                Completar
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasAddress ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span className={hasAddress ? "text-foreground" : "text-muted-foreground"}>
              Endereço cadastrado
            </span>
            {!hasAddress && (
              <Link
                href="/app/profile"
                className="text-primary text-xs ml-auto hover:underline"
              >
                Completar
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasPixKey ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span className={hasPixKey ? "text-foreground" : "text-muted-foreground"}>
              Chave PIX configurada
            </span>
            {!hasPixKey && (
              <Link
                href="/app/profile"
                className="bg-black text-primary text-xs ml-auto py-2 px-6 rounded-md hover:no-underline hover:text-white"
              >
                Configurar
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {summary && summary.balance.available >= minBalance ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span
              className={
                summary && summary.balance.available >= minBalance
                  ? "text-foreground"
                  : "text-muted-foreground"
              }
            >
              Saldo mínimo de R$ 50,00
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-foreground text-background border-none shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <Wallet size={64} />
          </div>
          <CardHeader className="p-6 pb-2 relative z-10">
            <CardDescription className="text-white">
              Saldo Disponível
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0 relative z-10">
            <p className="text-3xl font-bold text-primary font-mono tracking-tight">
              {summary?.formatted.available || "R$ 0,00"}
            </p>
            <Button
              size="sm"
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={!canWithdraw || requesting}
              onClick={handleRequestWithdrawal}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              {requesting ? "Solicitando..." : "Solicitar Saque PIX"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <CardDescription className="flex items-center gap-2">
              <Lock className="h-4 w-4" />
              Saldo Congelado
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight opacity-60">
              {summary?.formatted.frozen || "R$ 0,00"}
            </p>
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500/50" />
              Liberado após 14 dias (anti-fraude)
            </p>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Saques Pendentes
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight opacity-60">
              {summary?.formatted.pendingPayouts || "R$ 0,00"}
            </p>
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-blue-500/50" />
              Em processamento
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Summary stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total de Ganhos</span>
            <span className="font-mono font-semibold text-foreground">
              {summary?.formatted.totalEarnings || "R$ 0,00"}
            </span>
          </CardContent>
        </Card>
        <Card className="shadow-sm border-border bg-card">
          <CardContent className="p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Total de Saques</span>
            <span className="font-mono font-semibold text-foreground">
              {summary?.formatted.totalPayouts || "R$ 0,00"}
            </span>
          </CardContent>
        </Card>
      </div>

      {error && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4 flex items-center gap-3">
            <AlertCircle className="h-5 w-5 text-destructive" />
            <p className="text-sm text-destructive">{error}</p>
          </CardContent>
        </Card>
      )}

      {success && (
        <Card className="border-green-500 bg-green-50">
          <CardContent className="p-4 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm text-green-700">{success}</p>
          </CardContent>
        </Card>
      )}

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Histórico de Saques
          </CardTitle>
          <CardDescription>
            Acompanhe o status dos seus saques via PIX.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payouts.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum saque solicitado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {payouts.map((payout) => {
                const status = PAYOUT_STATUS_LABELS[payout.status];
                return (
                  <div
                    key={payout.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <p className="font-mono font-semibold text-foreground">
                        {payout.formatted.amount}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(payout.requestedAt)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        PIX: {payout.maskedPixKey} ({payout.pixKeyType.toUpperCase()})
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {payout.completedAt && (
                        <p className="text-xs text-muted-foreground">
                          {formatDate(payout.completedAt)}
                        </p>
                      )}
                      {payout.failureReason && (
                        <p className="text-xs text-destructive">
                          {payout.failureReason}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
