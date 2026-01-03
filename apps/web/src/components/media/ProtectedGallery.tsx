"use client";

import { useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProtectedMedia } from "./ProtectedMedia";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, X, Play, ImageIcon, VideoIcon } from "lucide-react";

export interface GalleryItem {
  id: string;
  url: string;
  thumbnailUrl?: string;
  type: "image" | "video";
  filename?: string;
}

interface ProtectedGalleryProps {
  items: GalleryItem[];
  columns?: 2 | 3 | 4 | 5;
  className?: string;
}

/**
 * Protected gallery component with lightbox viewer.
 * Designed for viewing purchased content securely without easy download options.
 *
 * Features:
 * - Grid layout with thumbnails
 * - Full-screen lightbox for viewing
 * - Keyboard navigation (arrow keys, escape)
 * - Anti-download protections on all media
 * - No download buttons or save options
 */
export function ProtectedGallery({
  items,
  columns = 4,
  className,
}: ProtectedGalleryProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loadedThumbnails, setLoadedThumbnails] = useState<Set<string>>(new Set());

  const currentItem = items[currentIndex];

  const openLightbox = (index: number) => {
    setCurrentIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const goNext = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, [items.length]);

  const goPrev = useCallback(() => {
    setCurrentIndex((prev) => (prev - 1 + items.length) % items.length);
  }, [items.length]);

  // Keyboard navigation
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key) {
        case "ArrowRight":
          goNext();
          break;
        case "ArrowLeft":
          goPrev();
          break;
        case "Escape":
          closeLightbox();
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxOpen, goNext, goPrev]);

  // Prevent context menu on the entire gallery
  const handleContextMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  };

  const handleThumbnailLoad = (id: string) => {
    setLoadedThumbnails((prev) => new Set(prev).add(id));
  };

  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-2 sm:grid-cols-3",
    4: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4",
    5: "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5",
  };

  return (
    <>
      {/* Gallery Grid */}
      <div
        className={cn("grid gap-3", gridCols[columns], className)}
        onContextMenu={handleContextMenu}
      >
        {items.map((item, index) => (
          <button
            key={item.id}
            type="button"
            onClick={() => openLightbox(index)}
            className="group relative aspect-square overflow-hidden rounded-lg bg-muted focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {/* Thumbnail */}
            {item.thumbnailUrl || item.type === "image" ? (
              <img
                src={item.thumbnailUrl || item.url}
                alt={item.filename || `Item ${index + 1}`}
                draggable={false}
                onLoad={() => handleThumbnailLoad(item.id)}
                className={cn(
                  "h-full w-full object-cover transition-transform duration-200 group-hover:scale-105",
                  !loadedThumbnails.has(item.id) && "opacity-0"
                )}
                style={{
                  WebkitUserSelect: "none",
                  userSelect: "none",
                  pointerEvents: "none",
                }}
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <VideoIcon className="h-12 w-12 text-muted-foreground" />
              </div>
            )}

            {/* Loading placeholder */}
            {!loadedThumbnails.has(item.id) && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                {item.type === "image" ? (
                  <ImageIcon className="h-8 w-8 text-muted-foreground/50" />
                ) : (
                  <VideoIcon className="h-8 w-8 text-muted-foreground/50" />
                )}
              </div>
            )}

            {/* Video play icon overlay */}
            {item.type === "video" && (
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="rounded-full bg-black/60 p-3 transition-transform group-hover:scale-110">
                  <Play className="h-6 w-6 text-white fill-white" />
                </div>
              </div>
            )}

            {/* Hover overlay */}
            <div className="absolute inset-0 bg-black/0 transition-colors group-hover:bg-black/20" />
          </button>
        ))}
      </div>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent
          className="max-w-[100vw] max-h-[100vh] w-screen h-screen p-0 bg-black border-none rounded-none [&>button]:hidden"
          onContextMenu={handleContextMenu}
        >
          <DialogTitle className="sr-only">Visualizar conteúdo</DialogTitle>
          <DialogDescription className="sr-only">
            Visualização em tela cheia do conteúdo. Use as setas para navegar.
          </DialogDescription>

          {currentItem && (
            <div className="relative flex h-full w-full items-center justify-center select-none">
              {/* Close button */}
              <button
                type="button"
                onClick={closeLightbox}
                className="absolute top-4 right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
                aria-label="Fechar"
              >
                <X className="h-6 w-6" />
              </button>

              {/* Navigation - Previous */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={goPrev}
                  className="absolute left-4 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
                  aria-label="Anterior"
                >
                  <ChevronLeft className="h-8 w-8" />
                </button>
              )}

              {/* Media content */}
              <div className="flex items-center justify-center w-full h-full px-16 py-20">
                <ProtectedMedia
                  key={currentItem.id}
                  src={currentItem.url}
                  type={currentItem.type}
                  alt={currentItem.filename}
                  className="max-h-full max-w-full"
                />
              </div>

              {/* Navigation - Next */}
              {items.length > 1 && (
                <button
                  type="button"
                  onClick={goNext}
                  className="absolute right-4 z-50 rounded-full bg-white/10 p-3 text-white hover:bg-white/20 transition-colors"
                  aria-label="Próximo"
                >
                  <ChevronRight className="h-8 w-8" />
                </button>
              )}

              {/* Counter */}
              <div className="absolute bottom-4 left-0 right-0 text-center pointer-events-none">
                <span className="rounded-full bg-black/50 px-4 py-2 text-sm text-white">
                  {currentIndex + 1} / {items.length}
                </span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
