import React from 'react';
import Link from 'next/link';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface CreatorCardProps {
  id: string;
  displayName: string;
  slug: string;
  profileImage?: string | null;
  coverImage?: string | null;
}

export function CreatorCard({
  displayName,
  slug,
  profileImage,
  coverImage,
}: CreatorCardProps) {
  return (
    <Link href={`/c/${slug}`}>
      <div className="group overflow-hidden rounded-xl bg-white shadow-sm transition-all hover:shadow-md">
        <div className="h-24 w-full bg-gray-100">
            {coverImage && (
                <img src={coverImage} alt="Cover" className="h-full w-full object-cover" />
            )}
        </div>
        <div className="relative px-4 pb-4">
          <div className="-mt-8 mb-3 flex justify-center">
            <Avatar className="h-16 w-16 border-4 border-white">
              <AvatarImage src={profileImage || ''} alt={displayName} />
              <AvatarFallback>{displayName.slice(0, 2).toUpperCase()}</AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-gray-900 group-hover:text-lime-700">
              {displayName}
            </h3>
            <p className="text-sm text-gray-500">@{slug}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
