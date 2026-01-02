"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";

interface CreatorCardProps {
  id: string;
  displayName: string;
  slug: string;
  profileImage?: string | null;
  coverImage?: string | null;
}

/**
 * Card component for displaying a creator profile.
 * Shows cover image, avatar, name and slug.
 */
export function CreatorCard({
  displayName,
  slug,
  profileImage,
  coverImage,
}: CreatorCardProps) {
  return (
    <Link href={`/c/${slug}`}>
      <div className="group overflow-hidden rounded-xl bg-card shadow-sm transition-all hover:shadow-cardHover border border-border/50">
        <div className="h-24 w-full bg-muted">
          {coverImage && (
            <img
              src={coverImage}
              alt="Cover"
              className="h-full w-full object-cover"
            />
          )}
        </div>
        <div className="relative px-4 pb-4">
          <div className="-mt-8 mb-3 flex justify-center">
            <Avatar className="h-16 w-16 border-4 border-card bg-card">
              <AvatarImage src={profileImage || ""} alt={displayName} />
              <AvatarFallback>
                {displayName.slice(0, 2).toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
          <div className="text-center">
            <h3 className="text-base font-semibold text-foreground group-hover:underline group-hover:decoration-primary">
              {displayName}
            </h3>
            <p className="text-sm text-muted-foreground">@{slug}</p>
          </div>
        </div>
      </div>
    </Link>
  );
}
