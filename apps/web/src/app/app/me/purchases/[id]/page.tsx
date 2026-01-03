"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ProtectedGallery, type GalleryItem } from "@/components/media";
import { api } from "@/services/api";
import { ArrowLeft, ImageIcon, VideoIcon, Lock } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

interface PackViewerProps {
  params: {
    id: string;
  };
}

interface PackFile {
  id: string;
  mimeType: string;
  filename: string;
  url: string;
  thumbnailUrl?: string;
}

interface Pack {
  title: string;
  files: PackFile[];
  creator: {
    displayName: string;
    profileImage?: string;
  };
}

interface PurchaseData {
  pack: Pack;
}

export default function PackViewerPage({ params }: PackViewerProps) {
  const [purchase, setPurchase] = useState<PurchaseData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPack() {
      try {
        const { data } = await api.get(`/me/purchases/${params.id}`);
        setPurchase(data);
      } catch (error) {
        console.error("Error fetching pack", error);
      } finally {
        setLoading(false);
      }
    }
    fetchPack();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!purchase) {
    return (
      <div className="flex h-screen flex-col items-center justify-center gap-4">
        <Lock className="h-12 w-12 text-muted-foreground" />
        <p className="text-muted-foreground">Pack não encontrado</p>
        <Link
          href="/app/me/purchases"
          className="text-sm text-primary hover:underline"
        >
          Voltar para Meus Packs
        </Link>
      </div>
    );
  }

  const { pack } = purchase;

  // Transform files to gallery items
  const galleryItems: GalleryItem[] = pack.files.map((file) => ({
    id: file.id,
    url: file.url,
    thumbnailUrl: file.thumbnailUrl,
    type: file.mimeType.startsWith("video/") ? "video" : "image",
    filename: file.filename,
  }));

  // Count images and videos
  const imageCount = pack.files.filter((f) =>
    f.mimeType.startsWith("image/")
  ).length;
  const videoCount = pack.files.filter((f) =>
    f.mimeType.startsWith("video/")
  ).length;

  return (
    <main className="container mx-auto min-h-screen px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/app/me/purchases"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para Meus Packs
        </Link>

        <div className="mt-6">
          <h1 className="text-3xl font-bold text-foreground">{pack.title}</h1>
          <div className="mt-3 flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={pack.creator.profileImage} />
              <AvatarFallback>{pack.creator.displayName[0]}</AvatarFallback>
            </Avatar>
            <span className="text-muted-foreground">
              por {pack.creator.displayName}
            </span>
          </div>
        </div>

        {/* Content stats */}
        <div className="mt-4 flex items-center gap-4 text-sm text-muted-foreground">
          {imageCount > 0 && (
            <div className="flex items-center gap-1.5">
              <ImageIcon className="h-4 w-4" />
              <span>
                {imageCount} {imageCount === 1 ? "foto" : "fotos"}
              </span>
            </div>
          )}
          {videoCount > 0 && (
            <div className="flex items-center gap-1.5">
              <VideoIcon className="h-4 w-4" />
              <span>
                {videoCount} {videoCount === 1 ? "vídeo" : "vídeos"}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Protected Gallery */}
      {galleryItems.length > 0 ? (
        <ProtectedGallery items={galleryItems} columns={4} />
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
          <Lock className="h-12 w-12 mb-4" />
          <p>Nenhum conteúdo disponível</p>
        </div>
      )}

      {/* Footer notice */}
      <div className="mt-8 rounded-lg bg-muted/50 p-4 text-center text-sm text-muted-foreground">
        <Lock className="inline-block h-4 w-4 mr-2" />
        Conteúdo exclusivo. Visualização protegida dentro da plataforma.
      </div>
    </main>
  );
}
