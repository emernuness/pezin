"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { api } from "@/services/api";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";

export default function NewPackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // Form State
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Convert price to cents
      const priceInCents = Math.round(
        Number.parseFloat(price.replace(",", ".")) * 100,
      );

      const { data } = await api.post("/packs", {
        title,
        price: priceInCents,
      });

      // Redirect to edit page to continue (upload files, etc)
      router.push(`/dashboard/packs/${data.id}/edit`);
    } catch (error) {
      alert("Erro ao criar pack. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <h1 className="mb-8 text-3xl font-bold text-gray-900">Novo Pack</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl bg-white p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Título do Pack</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pack Pezinhos #01"
            required
            minLength={3}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preço (R$)</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="9.90"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29,90"
            required
          />
          <p className="text-xs text-gray-500">
            Mínimo R$ 9,90. O criador recebe 80% do valor.
          </p>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? "Criando..." : "Continuar"}
          </Button>
        </div>
      </form>
    </div>
  );
}
