'use client';

import React, { useEffect, useState } from 'react';
import { api } from '@/services/api';
import { PackCard } from '@/components/PackCard';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data } = await api.get('/me/purchases');
        setPurchases(data);
      } catch (error) {
        console.error('Error fetching purchases', error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        Carregando...
      </div>
    );
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meus Packs</h1>
        <Link href="/">
          <Button variant="outline">Explorar vitrine</Button>
        </Link>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-gray-300 py-20">
          <p className="text-lg text-gray-500">
            Você ainda não comprou nenhum pack.
          </p>
          <Link href="/" className="mt-4">
            <Button>Ir para a Vitrine</Button>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {purchases.map((purchase) => (
            <PackCard
              key={purchase.pack.id}
              id={purchase.pack.id}
              title={purchase.pack.title}
              price={purchase.pack.price}
              imageUrl={purchase.pack.previews?.[0]?.url}
              creatorName={purchase.pack.creator.displayName}
              creatorSlug={purchase.pack.creator.slug}
              purchased={true}
            />
          ))}
        </div>
      )}
    </main>
  );
}
