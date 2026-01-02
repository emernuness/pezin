import { BuyButton } from "@/components/BuyButton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { api } from "@/services/api";
import { Check, ShieldCheck } from "lucide-react";
import Link from "next/link";
import React from "react";

// Simple SVG placeholder as data URL
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M35 40h30v20H35z'/%3E%3Ccircle fill='%239ca3af' cx='40' cy='35' r='5'/%3E%3C/svg%3E";

interface PackDetailProps {
  params: {
    id: string;
  };
}

interface Preview {
  id: string;
  url: string;
}

interface Pack {
  id: string;
  title: string;
  price: number;
  description?: string;
  previews: Preview[];
  creator: {
    displayName: string;
    profileImage?: string;
    slug: string;
  };
  _count?: {
    files: number;
  };
}

async function getPack(id: string): Promise<Pack | null> {
  try {
    const { data } = await api.get(`/public/packs/${id}`);
    return data;
  } catch (error) {
    return null;
  }
}

export default async function PackPage({ params }: PackDetailProps) {
  const pack = await getPack(params.id);

  if (!pack) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-foreground">
            Pack não encontrado
          </h1>
          <Link href="/" className="mt-4 text-foreground underline decoration-primary hover:text-primary transition-colors">
            Voltar para a vitrine
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(pack.price / 100);

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Previews */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-lg border bg-muted shadow-card">
            <div className="aspect-[3/4] w-full">
              <img
                src={pack.previews?.[0]?.url || PLACEHOLDER_IMAGE}
                alt={pack.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pack.previews?.slice(1).map((preview: Preview) => (
              <div
                key={preview.id}
                className="aspect-square overflow-hidden rounded-md border bg-muted"
              >
                <img
                  src={preview.url}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Info & CTA */}
        <div className="flex flex-col justify-center space-y-6">
          <div>
            <h1 className="text-3xl font-bold text-foreground md:text-4xl">
              {pack.title}
            </h1>
            <div className="mt-4 flex items-center space-x-3">
              <Link href={`/c/${pack.creator.slug}`}>
                <div className="flex items-center space-x-2 hover:opacity-80 transition-opacity">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pack.creator.profileImage} />
                    <AvatarFallback>
                      {pack.creator.displayName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-foreground">
                    @{pack.creator.displayName}
                  </span>
                </div>
              </Link>
              <Badge variant="accent">Verificado</Badge>
            </div>
          </div>

          <Card className="bg-muted/50 border-border">
            <CardContent className="p-6">
              <p className="whitespace-pre-wrap text-muted-foreground">
                {pack.description || "Sem descrição."}
              </p>
              <div className="mt-4 flex items-center space-x-4 text-sm text-muted-foreground">
                <span className="flex items-center">
                  <Check className="mr-1 h-4 w-4 text-foreground" />
                  {pack._count?.files || 0} arquivos
                </span>
                <span className="flex items-center">
                  <ShieldCheck className="mr-1 h-4 w-4 text-foreground" />
                  Acesso vitalício
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20 bg-primary/5">
            <CardContent className="flex flex-col gap-4 p-6">
              <div className="flex items-end justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Preço total</p>
                  <p className="text-4xl font-bold text-foreground font-mono">
                    {formattedPrice}
                  </p>
                </div>
              </div>

              <BuyButton packId={pack.id} />

              <p className="text-center text-xs text-muted-foreground">
                Ao comprar, você confirma ter 18 anos ou mais e aceita os termos
                de uso.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
