"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { Edit, Plus } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

interface Pack {
  id: string;
  title: string;
  status: string;
  price: number;
  previews?: { url: string }[];
  _count?: { purchases: number };
}

// Simple SVG placeholder as data URL
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M35 40h30v20H35z'/%3E%3Ccircle fill='%239ca3af' cx='40' cy='35' r='5'/%3E%3C/svg%3E";

export default function PacksDashboardPage() {
  const [packs, setPacks] = useState<Pack[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPacks() {
      try {
        const { data } = await api.get("/packs");
        setPacks(data);
      } catch {
        // API endpoint may not be implemented yet - silently fail
        setPacks([]);
      } finally {
        setLoading(false);
      }
    }
    fetchPacks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">Meus Packs</h1>
        <Button asChild>
          <Link href="/app/dashboard/packs/new">
            <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
            Novo Pack
          </Link>
        </Button>
      </div>

      <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
        <table className="min-w-full divide-y divide-border">
          <thead className="bg-muted/50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Titulo
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Status
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Preco
              </th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Vendas
              </th>
              <th scope="col" className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Acoes
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={`skeleton-${i}`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <Skeleton className="h-10 w-10 rounded-md" />
                      <Skeleton className="ml-4 h-4 w-32" />
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-6 w-20 rounded-full" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-16" />
                  </td>
                  <td className="px-6 py-4">
                    <Skeleton className="h-4 w-8" />
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Skeleton className="h-8 w-8 ml-auto" />
                  </td>
                </tr>
              ))
            ) : (
              packs.map((pack) => (
                <tr key={pack.id}>
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <img
                          className="h-10 w-10 rounded-md object-cover"
                          src={pack.previews?.[0]?.url || PLACEHOLDER_IMAGE}
                          alt=""
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-foreground">
                          {pack.title}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge
                      variant={
                        pack.status === "published" ? "default" : "secondary"
                      }
                    >
                      {pack.status === "published" ? "Publicado" : "Rascunho"}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {new Intl.NumberFormat("pt-BR", {
                      style: "currency",
                      currency: "BRL",
                    }).format(pack.price / 100)}
                  </td>
                  <td className="px-6 py-4 text-sm text-muted-foreground">
                    {pack._count?.purchases || 0}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/app/dashboard/packs/${pack.id}/edit`}>
                        <Edit className="h-4 w-4" aria-hidden="true" />
                        <span className="sr-only">Editar {pack.title}</span>
                      </Link>
                    </Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        {!loading && packs.length === 0 && (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <p className="text-lg text-muted-foreground mb-4">
              Voce ainda nao criou nenhum pack.
            </p>
            <Button asChild>
              <Link href="/app/dashboard/packs/new">
                <Plus className="mr-2 h-4 w-4" aria-hidden="true" />
                Criar primeiro pack
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
