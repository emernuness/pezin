"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface ProtectedMediaProps {
  src: string;
  alt?: string;
  type: "image" | "video";
  className?: string;
  onLoad?: () => void;
  onError?: () => void;
  onClick?: () => void;
}

/**
 * Protected media component that prevents easy downloading.
 * Implements multiple layers of protection:
 * - Disables right-click context menu
 * - Disables drag-and-drop
 * - Prevents save-as via keyboard shortcuts
 * - Uses CSS to prevent selection
 * - For videos: disables download button in controls
 */
export function ProtectedMedia({
  src,
  alt = "",
  type,
  className,
  onLoad,
  onError,
  onClick,
}: ProtectedMediaProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [loaded, setLoaded] = useState(false);

  // Prevent context menu (right-click)
  const handleContextMenu = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Prevent drag start
  const handleDragStart = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    return false;
  }, []);

  // Prevent keyboard shortcuts for saving
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent Ctrl+S, Cmd+S (save)
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
      }
      // Prevent Ctrl+Shift+S (save as)
      if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === "S") {
        e.preventDefault();
      }
    };

    container.addEventListener("keydown", handleKeyDown);
    return () => container.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLoad = () => {
    setLoaded(true);
    onLoad?.();
  };

  if (type === "video") {
    return (
      <div
        ref={containerRef}
        className={cn(
          "relative select-none",
          className
        )}
        onContextMenu={handleContextMenu}
        onDragStart={handleDragStart}
      >
        <video
          src={src}
          controls
          controlsList="nodownload noplaybackrate"
          disablePictureInPicture
          playsInline
          onLoadedData={handleLoad}
          onError={onError}
          onClick={onClick}
          className={cn(
            "w-full h-full object-contain pointer-events-auto",
            !loaded && "opacity-0"
          )}
          style={{
            WebkitUserSelect: "none",
            userSelect: "none",
          }}
        />
        {!loaded && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative select-none",
        className
      )}
      onContextMenu={handleContextMenu}
      onDragStart={handleDragStart}
      onClick={onClick}
    >
      <img
        src={src}
        alt={alt}
        onLoad={handleLoad}
        onError={onError}
        draggable={false}
        className={cn(
          "w-full h-full object-contain pointer-events-none",
          !loaded && "opacity-0"
        )}
        style={{
          WebkitUserSelect: "none",
          userSelect: "none",
          WebkitTouchCallout: "none",
        }}
      />
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-muted">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  );
}
