"use client";

import { Button } from "@/components/ui/button";
import { createPixCheckout } from "@/services/payment.service";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";

interface BuyButtonProps {
  packId: string;
}

export function BuyButton({ packId }: BuyButtonProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);

  const handleBuy = async () => {
    try {
      setLoading(true);
      const checkout = await createPixCheckout(packId);

      // Store checkout data for the checkout page
      sessionStorage.setItem(
        `checkout_${checkout.paymentId}`,
        JSON.stringify(checkout)
      );

      // Redirect to PIX checkout page
      router.push(`/app/checkout/${checkout.paymentId}`);
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };
      if (axiosError.response?.status === 401) {
        // Preserve current URL to redirect back after login
        const returnUrl = encodeURIComponent(pathname || `/pack/${packId}`);
        router.push(`/login?returnUrl=${returnUrl}`);
      } else if (axiosError.response?.data?.message) {
        toast.error(axiosError.response.data.message);
      } else {
        toast.error("Erro ao iniciar compra. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full text-lg font-bold"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? "Gerando PIX..." : "Comprar com PIX"}
    </Button>
  );
}
