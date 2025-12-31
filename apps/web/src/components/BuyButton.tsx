'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { api } from '@/services/api';
import { useRouter, usePathname } from 'next/navigation';

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
      const { data } = await api.post('/stripe/checkout', { packId });
      if (data.url) {
        window.location.href = data.url;
      }
    } catch (error: any) {
      if (error.response?.status === 401) {
        // Preserve current URL to redirect back after login
        const returnUrl = encodeURIComponent(pathname || `/pack/${packId}`);
        router.push(`/login?returnUrl=${returnUrl}`);
      } else {
        alert('Erro ao iniciar compra. Tente novamente.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      size="lg"
      className="w-full bg-lime-400 text-lg font-bold text-gray-900 hover:bg-lime-500"
      onClick={handleBuy}
      disabled={loading}
    >
      {loading ? 'Processando...' : 'Comprar Agora'}
    </Button>
  );
}
