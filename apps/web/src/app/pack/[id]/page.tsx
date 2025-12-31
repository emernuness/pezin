import React from 'react';
import { api } from '@/services/api';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { Check, ShieldCheck } from 'lucide-react';
import { BuyButton } from '@/components/BuyButton';

interface PackDetailProps {
  params: {
    id: string;
  };
}

async function getPack(id: string) {
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
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Pack não encontrado</h1>
          <Link href="/" className="mt-4 text-lime-600 hover:underline">
            Voltar para a vitrine
          </Link>
        </div>
      </div>
    );
  }

  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(pack.price / 100);

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Left Column: Previews */}
        <div className="space-y-4">
          <div className="overflow-hidden rounded-2xl border bg-gray-100 shadow-sm">
            <div className="aspect-[3/4] w-full">
              <img
                src={pack.previews?.[0]?.url || '/placeholder-pack.jpg'}
                alt={pack.title}
                className="h-full w-full object-cover"
              />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            {pack.previews?.slice(1).map((preview: any) => (
              <div key={preview.id} className="aspect-square overflow-hidden rounded-lg border bg-gray-50">
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
            <h1 className="text-3xl font-bold text-gray-900 md:text-4xl">
              {pack.title}
            </h1>
            <div className="mt-4 flex items-center space-x-3">
              <Link href={`/c/${pack.creator.slug}`}>
                <div className="flex items-center space-x-2 hover:opacity-80">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={pack.creator.profileImage} />
                    <AvatarFallback>{pack.creator.displayName[0]}</AvatarFallback>
                  </Avatar>
                  <span className="font-medium text-gray-700">
                    @{pack.creator.displayName}
                  </span>
                </div>
              </Link>
              <Badge variant="secondary" className="bg-lime-100 text-lime-800 hover:bg-lime-200">
                Verificado
              </Badge>
            </div>
          </div>

          <div className="rounded-xl border bg-gray-50 p-6">
            <p className="whitespace-pre-wrap text-gray-600">
              {pack.description || 'Sem descrição.'}
            </p>
            <div className="mt-4 flex items-center space-x-4 text-sm text-gray-500">
              <span className="flex items-center">
                <Check className="mr-1 h-4 w-4 text-lime-600" />
                {pack._count?.files || 0} arquivos
              </span>
              <span className="flex items-center">
                <ShieldCheck className="mr-1 h-4 w-4 text-lime-600" />
                Acesso vitalício
              </span>
            </div>
          </div>

          <div className="flex flex-col gap-4 rounded-xl border border-lime-200 bg-lime-50/50 p-6">
            <div className="flex items-end justify-between">
              <div>
                <p className="text-sm text-gray-500">Preço total</p>
                <p className="text-4xl font-bold text-gray-900">{formattedPrice}</p>
              </div>
            </div>

            <BuyButton packId={pack.id} />

            <p className="text-center text-xs text-gray-500">
              Ao comprar, você confirma ter 18 anos ou mais e aceita os termos de uso.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
