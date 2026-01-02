"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useState } from "react";
import { toast } from "sonner";

export default function NewPackPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("29,90");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const priceInCents = Math.round(
        Number.parseFloat(price.replace(",", ".")) * 100
      );

      if (priceInCents < 990 || priceInCents > 50000) {
        toast.error("Preco deve estar entre R$ 9,90 e R$ 500,00");
        setLoading(false);
        return;
      }

      const { data } = await api.post("/packs", {
        title,
        description: description || undefined,
        price: priceInCents,
      });

      toast.success("Pack criado! Adicione previews e arquivos.");
      router.push(`/app/dashboard/packs/${data.id}/edit`);
    } catch {
      toast.error("Erro ao criar pack. Verifique os dados.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto max-w-2xl px-4 py-8">
      <Link
        href="/app/dashboard/packs"
        className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Voltar para Meus Packs
      </Link>

      <h1 className="mb-8 text-3xl font-bold text-foreground">Novo Pack</h1>

      <form
        onSubmit={handleSubmit}
        className="space-y-6 rounded-xl border bg-card p-6 shadow-sm"
      >
        <div className="space-y-2">
          <Label htmlFor="title">Titulo do Pack *</Label>
          <Input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex: Pack Pezinhos #01"
            required
            minLength={3}
            maxLength={100}
          />
          <p className="text-xs text-muted-foreground">
            Minimo 3 caracteres, maximo 100.
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Descricao</Label>
          <Textarea
            id="description"
            value={description}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
            placeholder="Descreva o conteudo do seu pack para atrair mais compradores..."
            rows={4}
          />
          <p className="text-xs text-muted-foreground">
            Uma boa descricao ajuda a vender mais!
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="price">Preco (R$) *</Label>
          <Input
            id="price"
            type="text"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="29,90"
            required
          />
          <p className="text-xs text-muted-foreground">
            Minimo R$ 9,90 - Maximo R$ 500,00
          </p>
        </div>

        <div className="rounded-lg border border-muted bg-muted/50 p-4">
          <h3 className="font-medium text-foreground">Proximos passos:</h3>
          <ol className="mt-2 list-decimal list-inside space-y-1 text-sm text-muted-foreground">
            <li>Adicione ao menos 1 imagem de preview (capa)</li>
            <li>Adicione ao menos 3 arquivos exclusivos</li>
            <li>Publique seu pack na vitrine</li>
          </ol>
        </div>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="ghost" onClick={() => router.back()}>
            Cancelar
          </Button>
          <Button type="submit" disabled={loading || title.length < 3}>
            {loading ? "Criando..." : "Criar e Adicionar Arquivos"}
          </Button>
        </div>
      </form>
    </div>
  );
}
