"use client";

import { PackCard } from "@/components/cards";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Purchase {
  pack: {
    id: string;
    title: string;
    price: number;
    previews: { url: string }[];
    creator: {
      displayName: string;
      slug: string;
    };
  };
}

export default function MyPurchasesPage() {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPurchases() {
      try {
        const { data } = await api.get("/me/purchases");
        setPurchases(data);
      } catch (error) {
        console.error("Error fetching purchases", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPurchases();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted text-muted-foreground">
        Carregando...
      </div>
    );
  }

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Meus Packs</h1>
        <Button variant="outline" asChild>
          <Link href="/app/explore">Explorar vitrine</Link>
        </Button>
      </div>

      {purchases.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-20 bg-muted/50">
          <p className="text-lg text-muted-foreground">
            Voce ainda nao comprou nenhum pack.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/app/explore">Ir para a Vitrine</Link>
          </Button>
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
