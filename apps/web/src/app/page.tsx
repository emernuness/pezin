import React from 'react';
import { api } from '@/services/api';
import { PackCard } from '@/components/PackCard';
import { FilterBar } from '@/components/FilterBar';
import { Pagination } from '@/components/Pagination';

interface HomeProps {
  searchParams: {
    page?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

async function getPacks(params: any) {
  try {
    const { data } = await api.get('/public/packs', { params });
    return data;
  } catch (error) {
    console.error('Failed to fetch packs', error);
    return { data: [], meta: { total: 0, totalPages: 0, page: 1 } };
  }
}

export default async function HomePage({ searchParams }: HomeProps) {
  const packsData = await getPacks({
    page: searchParams.page || 1,
    limit: 12,
    search: searchParams.search,
    sort: searchParams.sort,
    minPrice: searchParams.minPrice,
    maxPrice: searchParams.maxPrice,
  });

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      <section className="mb-12 text-center">
        <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 md:text-5xl lg:text-6xl">
          Descubra packs <span className="text-lime-600">exclusivos</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-gray-600">
          Apoie seus criadores favoritos e tenha acesso a conteúdos únicos.
          Simples, rápido e seguro.
        </p>
      </section>

      <FilterBar />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packsData.data.map((pack: any) => (
          <PackCard
            key={pack.id}
            id={pack.id}
            title={pack.title}
            price={pack.price}
            imageUrl={pack.previews?.[0]?.url}
            creatorName={pack.creator.displayName}
            creatorSlug={pack.creator.slug}
          />
        ))}
      </div>

      {packsData.data.length === 0 && (
        <div className="mt-12 text-center text-gray-500">
          Nenhum pack encontrado com esses filtros.
        </div>
      )}

      <Pagination
        currentPage={packsData.meta.page}
        totalPages={packsData.meta.totalPages}
      />
    </main>
  );
}
