import { EmptyState } from "@/components/EmptyState";
import { FilterBar } from "@/components/FilterBar";
import { PackCard } from "@/components/PackCard";
import { Pagination } from "@/components/Pagination";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { Search } from "lucide-react";
import Link from "next/link";

interface ExploreProps {
  searchParams: {
    page?: string;
    search?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

interface Pack {
  id: string;
  title: string;
  price: number;
  previews: { url: string }[];
  creator: {
    displayName: string;
    slug: string;
  };
}

async function getPacks(params: Record<string, string | number | undefined>) {
  try {
    const { data } = await api.get("/public/packs", { params });
    return data;
  } catch (error) {
    console.error("Failed to fetch packs", error);
    return { data: [], meta: { total: 0, totalPages: 0, page: 1 } };
  }
}

export default async function ExplorePage({ searchParams }: ExploreProps) {
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
        <h1 className="text-4xl font-extrabold tracking-tight text-foreground md:text-5xl lg:text-6xl">
          Descubra packs <span className="inline-block -skew-x-3 transform rounded-sm bg-primary px-2 text-primary-foreground">exclusivos</span>
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground">
          Apoie seus criadores favoritos e tenha acesso a conteudos unicos.
          Simples, rapido e seguro.
        </p>
      </section>

      <FilterBar />

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {packsData.data.map((pack: Pack) => (
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
        <EmptyState
          icon={Search}
          title="Nenhum pack encontrado"
          description="Tente ajustar seus filtros ou explorar outras categorias."
          action={
            <Button asChild variant="outline">
              <Link href="/explore">Limpar filtros</Link>
            </Button>
          }
        />
      )}

      <Pagination
        currentPage={packsData.meta.page}
        totalPages={packsData.meta.totalPages}
      />
    </main>
  );
}
