import React from 'react';
import Link from 'next/link';

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
  const formattedPrice = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(price / 100);

  return (
    <Link href={purchased ? `/me/purchases/${id}` : `/pack/${id}`}>
      <div className="group relative overflow-hidden rounded-2xl bg-white shadow-sm transition-all hover:-translate-y-1 hover:shadow-cardHover">
        <div className="aspect-[4/5] w-full overflow-hidden bg-gray-100">
          <img
            src={imageUrl || '/placeholder-pack.jpg'}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="truncate text-lg font-semibold text-gray-900 group-hover:text-lime-700">
            {title}
          </h3>
          <p className="mt-1 text-sm text-gray-500">por @{creatorName}</p>
          <div className="mt-3 flex items-center justify-between">
            {purchased ? (
              <span className="inline-flex items-center rounded-md bg-lime-100 px-2 py-1 text-xs font-medium text-lime-800">
                Comprado
              </span>
            ) : (
              <span className="text-lg font-bold text-gray-900">
                {formattedPrice}
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}
