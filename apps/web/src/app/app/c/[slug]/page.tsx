import { PackCard } from "@/components/cards";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { api } from "@/services/api";
import { PLACEHOLDER_IMAGE } from "@/utils/constants";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

interface CreatorProfileProps {
  params: {
    slug: string;
  };
}

interface Pack {
  id: string;
  title: string;
  price: number;
  previews?: { url: string }[];
}

interface Creator {
  displayName: string;
  slug: string;
  bio?: string;
  profileImage?: string;
  coverImage?: string;
}

interface CreatorData extends Creator {
  packs: Pack[];
}

async function getCreator(slug: string): Promise<CreatorData | null> {
  try {
    const { data } = await api.get(`/public/creators/${slug}`);
    return data;
  } catch (error) {
    return null;
  }
}

export default async function CreatorPage({ params }: CreatorProfileProps) {
  const data = await getCreator(params.slug);

  if (!data) {
    return (
      <div className="flex h-screen items-center justify-center bg-muted">
        <h1 className="text-2xl font-bold text-foreground">
          Criador nao encontrado
        </h1>
      </div>
    );
  }

  const { packs, ...creator } = data;

  return (
    <main className="min-h-screen bg-muted pb-12">
      <div className="h-48 w-full bg-secondary md:h-64">
        {creator.coverImage && (
          <img
            src={creator.coverImage}
            alt="Cover"
            className="h-full w-full object-cover opacity-80"
          />
        )}
      </div>

      <div className="container mx-auto px-4">
        <Link
          href="/app/explore"
          className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-4 mt-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
          Voltar a vitrine
        </Link>
        <div className="relative -mt-16 mb-8 flex flex-col items-center md:items-start">
          <Avatar className="h-40 w-40 border-4 border-background shadow-lg">
            <AvatarImage src={creator.profileImage} />
            <AvatarFallback className="text-4xl">
              {creator.displayName[0]}
            </AvatarFallback>
          </Avatar>

          <div className="mt-4 text-center md:text-left">
            <h1 className="text-3xl font-bold text-foreground">
              {creator.displayName}
            </h1>
            <p className="text-muted-foreground">@{creator.slug}</p>
          </div>

          <div className="mt-6 max-w-2xl text-center text-foreground/80 md:text-left">
            {creator.bio || "Sem biografia."}
          </div>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-foreground">
            Packs Publicados
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {packs.map((pack) => (
            <PackCard
              key={pack.id}
              id={pack.id}
              title={pack.title}
              price={pack.price}
              imageUrl={pack.previews?.[0]?.url || PLACEHOLDER_IMAGE}
              creatorName={creator.displayName}
              creatorSlug={creator.slug}
            />
          ))}
          {packs.length === 0 && (
            <p className="col-span-full py-8 text-center text-muted-foreground">
              Este criador ainda nao publicou nenhum pack.
            </p>
          )}
        </div>
      </div>
    </main>
  );
}
