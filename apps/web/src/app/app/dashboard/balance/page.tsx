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
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { formatCurrency, formatDate } from "@/utils/formatters";
import { WITHDRAWAL_STATUS_LABELS } from "@/utils/constants";
import {
  AlertCircle,
  ArrowDownToLine,
  CheckCircle2,
  Clock,
  DollarSign,
  Wallet,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface Balance {
  available: number;
  pending: number;
}

interface Withdrawal {
  id: string;
  amount: number;
  status: "pending" | "processing" | "completed" | "failed";
  requestedAt: string;
  processedAt: string | null;
  failureReason: string | null;
}


function BalanceSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-64" />
      <div className="grid gap-6 md:grid-cols-2">
        <Skeleton className="h-40 rounded-2xl" />
        <Skeleton className="h-40 rounded-2xl" />
      </div>
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export default function BalancePage() {
  const { user } = useAuthStore();
  const [balance, setBalance] = useState<Balance | null>(null);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [loading, setLoading] = useState(true);
  const [requesting, setRequesting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const [balanceRes, withdrawalsRes] = await Promise.all([
        api.get("/dashboard/balance"),
        api.get("/dashboard/withdrawals"),
      ]);
      setBalance(balanceRes.data);
      setWithdrawals(withdrawalsRes.data);
    } catch (err) {
      console.error("Error fetching balance data", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleRequestWithdrawal() {
    setRequesting(true);
    setError(null);

    try {
      await api.post("/dashboard/withdrawals");
      await fetchData();
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao solicitar saque");
    } finally {
      setRequesting(false);
    }
  }


  if (loading) return <BalanceSkeleton />;

  const hasPersonalData = user?.fullName && user?.cpf && user?.phone;
  const hasAddress = user?.address?.zipCode && user?.address?.street && user?.address?.city;
  const canWithdraw = balance && balance.available >= 5000 && user?.stripeConnected && hasPersonalData && hasAddress;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Saldo e Saques
        </h1>
        <p className="text-muted-foreground">
          Gerencie seu saldo e solicite saques.
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

          </div>
          <div className="flex items-center gap-2">
            {user?.stripeConnected ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span className={user?.stripeConnected ? "text-foreground" : "text-muted-foreground"}>
              Stripe conectado
            </span>
            {!user?.stripeConnected && (
              <Link href="/app/dashboard/stripe-connect" className="bg-black text-primary text-xs ml-auto py-2 px-6 rounded-md hover:no-underline hover:text-white">
                Conectar
              </Link>
            )}
          </div>
          <div className="flex items-center gap-2">
            {balance && balance.available >= 5000 ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : (
              <AlertCircle className="h-4 w-4 text-black/60" />
            )}
            <span className={balance && balance.available >= 5000 ? "text-foreground" : "text-muted-foreground"}>
              Saldo mínimo de R$ 50,00
            </span>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
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
              {balance ? formatCurrency(balance.available) : "R$ 0,00"}
            </p>
            <Button
              size="sm"
              className="mt-4 w-full bg-primary text-primary-foreground hover:bg-primary/90 font-semibold"
              disabled={!canWithdraw || requesting}
              onClick={handleRequestWithdrawal}
            >
              <ArrowDownToLine className="mr-2 h-4 w-4" />
              {requesting ? "Solicitando..." : "Solicitar Saque"}
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-border bg-card">
          <CardHeader className="p-6 pb-2">
            <CardDescription className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Saldo Pendente
            </CardDescription>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <p className="text-3xl font-bold text-foreground font-mono tracking-tight opacity-60">
              {balance ? formatCurrency(balance.pending) : "R$ 0,00"}
            </p>
            <p className="mt-4 text-xs text-muted-foreground flex items-center gap-1">
              <span className="inline-block w-2 h-2 rounded-full bg-yellow-500/50" />
              Liberado após 14 dias da venda
            </p>
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

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Histórico de Saques
          </CardTitle>
          <CardDescription>
            Acompanhe o status dos seus saques solicitados.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {withdrawals.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              Nenhum saque solicitado ainda.
            </p>
          ) : (
            <div className="space-y-4">
              {withdrawals.map((withdrawal) => {
                const status = WITHDRAWAL_STATUS_LABELS[withdrawal.status];
                return (
                  <div
                    key={withdrawal.id}
                    className="flex items-center justify-between p-4 rounded-lg border border-border"
                  >
                    <div className="space-y-1">
                      <p className="font-mono font-semibold text-foreground">
                        {formatCurrency(withdrawal.amount)}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(withdrawal.requestedAt)}
                      </p>
                    </div>
                    <div className="text-right space-y-1">
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${status.className}`}
                      >
                        {status.label}
                      </span>
                      {withdrawal.failureReason && (
                        <p className="text-xs text-destructive">
                          {withdrawal.failureReason}
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
