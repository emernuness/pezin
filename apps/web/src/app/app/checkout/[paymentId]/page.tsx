"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PixQRCode } from "@/components/PixQRCode";
import { getPaymentStatus, type PaymentStatus } from "@/services/payment.service";
import { api } from "@/services/api";
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Package,
  Clock,
  RefreshCw,
} from "lucide-react";

interface CheckoutData {
  paymentId: string;
  qrCode: string;
  qrCodeText: string;
  expiresAt: string;
  amount: number;
  pack: {
    id: string;
    title: string;
    price: number;
  };
}

function CheckoutSkeleton() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <Skeleton className="h-10 w-48 mx-auto" />
        <Skeleton className="h-[500px] rounded-xl" />
      </div>
    </div>
  );
}

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const paymentId = params.paymentId as string;

  const [checkoutData, setCheckoutData] = useState<CheckoutData | null>(null);
  const [status, setStatus] = useState<PaymentStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [polling, setPolling] = useState(false);

  // Fetch initial checkout data from session storage
  useEffect(() => {
    const storedData = sessionStorage.getItem(`checkout_${paymentId}`);
    if (storedData) {
      setCheckoutData(JSON.parse(storedData));
    }
    setLoading(false);
  }, [paymentId]);

  // Poll for payment status
  const checkStatus = useCallback(async () => {
    try {
      const statusData = await getPaymentStatus(paymentId);
      setStatus(statusData);

      if (statusData.status === "paid") {
        // Payment confirmed - redirect to success
        setTimeout(() => {
          router.push(`/app/checkout/${paymentId}/success`);
        }, 1500);
      }
    } catch (error) {
      console.error("Error checking payment status", error);
    }
  }, [paymentId, router]);

  useEffect(() => {
    // Initial check
    checkStatus();

    // Poll every 5 seconds
    const interval = setInterval(() => {
      if (!polling) {
        checkStatus();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [checkStatus, polling]);

  async function handleRefresh() {
    setPolling(true);
    await checkStatus();
    setPolling(false);
  }

  if (loading) return <CheckoutSkeleton />;

  // If no checkout data, try to get status only
  if (!checkoutData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-4">
            <Clock className="h-12 w-12 mx-auto text-muted-foreground" />
            <h2 className="text-xl font-semibold">Pagamento não encontrado</h2>
            <p className="text-sm text-muted-foreground">
              Este checkout pode ter expirado ou já foi processado.
            </p>
            {status?.status === "paid" && (
              <div className="p-4 bg-green-50 rounded-lg">
                <CheckCircle2 className="h-8 w-8 mx-auto text-green-600 mb-2" />
                <p className="text-green-700 font-medium">
                  Pagamento confirmado!
                </p>
              </div>
            )}
            <Button asChild variant="outline">
              <Link href="/app/me/purchases">
                <Package className="mr-2 h-4 w-4" />
                Minhas Compras
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment confirmed
  if (status?.status === "paid") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
              <CheckCircle2 className="h-10 w-10 text-green-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Pagamento Confirmado!
              </h2>
              <p className="text-muted-foreground mt-2">
                Seu pagamento foi processado com sucesso.
              </p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Pack adquirido</p>
              <p className="font-semibold text-foreground">
                {checkoutData.pack.title}
              </p>
            </div>
            <Button asChild className="w-full">
              <Link href={`/app/pack/${checkoutData.pack.id}`}>
                <Package className="mr-2 h-4 w-4" />
                Ver Pack
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Payment expired
  if (status?.status === "expired") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center space-y-6">
            <div className="w-20 h-20 mx-auto bg-red-100 rounded-full flex items-center justify-center">
              <XCircle className="h-10 w-10 text-red-600" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-foreground">
                Pagamento Expirado
              </h2>
              <p className="text-muted-foreground mt-2">
                O tempo para pagamento esgotou. Por favor, inicie uma nova compra.
              </p>
            </div>
            <Button asChild variant="outline" className="w-full">
              <Link href={`/pack/${checkoutData.pack.id}`}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Voltar ao Pack
              </Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show PIX QR Code
  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-md mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold text-foreground">
            Pagamento PIX
          </h1>
          <p className="text-sm text-muted-foreground">
            Escaneie o QR Code para pagar
          </p>
        </div>

        {/* Pack info */}
        <Card className="shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              {checkoutData.pack.title}
            </CardTitle>
          </CardHeader>
        </Card>

        {/* QR Code */}
        <PixQRCode
          qrCode={checkoutData.qrCode}
          qrCodeText={checkoutData.qrCodeText}
          amount={checkoutData.amount}
          expiresAt={checkoutData.expiresAt}
        />

        {/* Status refresh */}
        <div className="flex justify-center">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefresh}
            disabled={polling}
          >
            <RefreshCw
              className={`mr-2 h-4 w-4 ${polling ? "animate-spin" : ""}`}
            />
            {polling ? "Verificando..." : "Atualizar Status"}
          </Button>
        </div>

        {/* Back link */}
        <div className="text-center">
          <Link
            href={`/pack/${checkoutData.pack.id}`}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="inline-block mr-1 h-3 w-3" />
            Voltar ao pack
          </Link>
        </div>
      </div>
    </div>
  );
}
