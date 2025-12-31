import Link from "next/link";
import React from "react";

interface PackCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  creatorName: string;
  creatorSlug: string;
  purchased?: boolean;
}

export function PackCard({
  id,
  title,
  price,
  imageUrl,
  creatorName,
  creatorSlug,
  purchased = false,
}: PackCardProps) {
  const formattedPrice = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(price / 100);

  return (
    <Link href={purchased ? `/me/purchases/${id}` : `/pack/${id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover border border-border/50">
        <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
          <img
            src={imageUrl || "/placeholder-pack.jpg"}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            por @{creatorName}
          </p>
          <div className="mt-3 flex items-center justify-between">
            {purchased ? (
              <span className="inline-flex items-center rounded-md bg-accent px-2 py-1 text-xs font-medium text-accent-foreground">
                Comprado
              </span>
            ) : (
              <span className="text-lg font-bold text-foreground font-mono">
                {formattedPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
