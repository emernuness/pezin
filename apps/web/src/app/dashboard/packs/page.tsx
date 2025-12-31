"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Edit, Plus, Trash } from "lucide-react";
import Link from "next/link";
import React, { useEffect, useState } from "react";

export default function PacksDashboardPage() {
  const [packs, setPacks] = useState<any[]>([]);

  useEffect(() => {
    async function fetchPacks() {
      try {
        const { data } = await api.get("/packs"); // Uses existing endpoint
        setPacks(data);
      } catch (error) {
        console.error(error);
      }
    }
    fetchPacks();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meus Packs</h1>
        <Link href="/dashboard/packs/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Novo Pack
          </Button>
        </Link>
      </div>

      <div className="overflow-hidden rounded-xl border bg-white shadow-sm">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Título
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Preço
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500">
                Vendas
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500">
                Ações
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {packs.map((pack) => (
              <tr key={pack.id}>
                <td className="px-6 py-4">
                  <div className="flex items-center">
                    <div className="h-10 w-10 flex-shrink-0">
                      <img
                        className="h-10 w-10 rounded-md object-cover"
                        src={pack.previews?.[0]?.url || "/placeholder.png"}
                        alt=""
                      />
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
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
                <td className="px-6 py-4 text-sm text-gray-500">
                  {new Intl.NumberFormat("pt-BR", {
                    style: "currency",
                    currency: "BRL",
                  }).format(pack.price / 100)}
                </td>
                <td className="px-6 py-4 text-sm text-gray-500">
                  {pack._count?.purchases || 0}
                </td>
                <td className="px-6 py-4 text-right text-sm font-medium">
                  <Link href={`/dashboard/packs/${pack.id}/edit`}>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {packs.length === 0 && (
          <div className="p-8 text-center text-gray-500">
            Você ainda não criou nenhum pack.
          </div>
        )}
      </div>
    </div>
  );
}
