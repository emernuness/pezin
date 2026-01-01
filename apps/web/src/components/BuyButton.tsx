"use client";

import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
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
      const { data } = await api.post("/stripe/checkout", { packId });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: unknown) {
      const axiosError = error as { response?: { status?: number } };
      if (axiosError.response?.status === 401) {
        // Preserve current URL to redirect back after login
        const returnUrl = encodeURIComponent(pathname || `/pack/${packId}`);
        router.push(`/login?returnUrl=${returnUrl}`);
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
      {loading ? "Processando..." : "Comprar Agora"}
    </Button>
  );
}
