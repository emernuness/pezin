import Link from "next/link";
import React from "react";

// Simple SVG placeholder as data URL
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M35 40h30v20H35z'/%3E%3Ccircle fill='%239ca3af' cx='40' cy='35' r='5'/%3E%3C/svg%3E";

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
    <Link href={purchased ? `/app/me/purchases/${id}` : `/app/pack/${id}`}>
      <div className="group relative overflow-hidden rounded-lg bg-card shadow-card transition-all hover:-translate-y-1 hover:shadow-cardHover border border-border/50">
        <div className="aspect-[4/5] w-full overflow-hidden bg-muted">
          <img
            src={imageUrl || PLACEHOLDER_IMAGE}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-foreground group-hover:underline group-hover:decoration-primary transition-colors">
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
              <>
                <span className="text-lg font-bold text-foreground font-mono">
                  {formattedPrice}
                </span>
                <span className="text-sm text-muted-foreground font-medium group-hover:text-foreground transition-colors group-hover:underline group-hover:decoration-primary">
                  Ver pack →
                </span>
              </>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
