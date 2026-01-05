"use client";

import { useCallback, useRef, useState, useEffect, forwardRef, useImperativeHandle } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Upload,
  X,
  FileImage,
  FileVideo,
  Check,
  AlertCircle,
  Loader2,
  Star,
  Play,
  ZoomIn,
} from "lucide-react";
import { PLACEHOLDER_IMAGE_SVG } from "@/utils/constants";

interface ExistingFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  previewUrl?: string;
  isPreview: boolean;
}

interface PendingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "converting" | "uploading" | "done" | "error";
  error?: string;
  isPreview: boolean;
}

export interface PackMediaManagerRef {
  getPendingFiles: () => { file: PendingFile; type: "preview" | "file" }[];
  hasPendingFiles: boolean;
  uploadAll: (
    getUploadUrl: (file: File, type: "preview" | "file") => Promise<{ uploadUrl: string; key: string; fileId: string }>,
    onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }, type: "preview" | "file") => Promise<void>
  ) => Promise<void>;
  clearDoneFiles: () => void;
}

interface PackMediaManagerProps {
  existingFiles: ExistingFile[];
  existingPreviews: { id: string; url: string }[];
  maxPreviews?: number;
  onDeleteFile: (fileId: string) => Promise<void>;
  onDeletePreview: (previewId: string) => Promise<void>;
  onTogglePreview: (fileId: string, isPreview: boolean) => Promise<void>;
  onFilesChange?: (pendingCount: number) => void;
  onOpenLightbox?: (index: number, items: { url: string; type: "image" | "video"; title?: string }[]) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * Componente unificado para gerenciar todas as midias de um pack.
 * Permite adicionar arquivos e marcar quais serao usados como capa.
 */
export const PackMediaManager = forwardRef<PackMediaManagerRef, PackMediaManagerProps>(
  function PackMediaManager(
    {
      existingFiles,
      existingPreviews,
      maxPreviews = 3,
      onDeleteFile,
      onDeletePreview,
      onTogglePreview,
      onFilesChange,
      onOpenLightbox,
      disabled = false,
      className,
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);
    const [deleting, setDeleting] = useState<string | null>(null);
    const [togglingPreview, setTogglingPreview] = useState<string | null>(null);
    const [pendingPreviewIds, setPendingPreviewIds] = useState<Set<string>>(new Set());

    const {
      files: pendingFiles,
      addFiles,
      removeFile,
      uploadFile,
      uploadAll,
      isUploading,
    } = useMediaUpload({
      maxFiles: 50,
      maxFileSize: 100 * 1024 * 1024,
      convertToWebP: true,
      allowedTypes: [
        "image/jpeg",
        "image/png",
        "image/webp",
        "video/mp4",
        "video/quicktime",
        "video/webm",
      ],
    });

    // Combine existing files with preview info
    const allExistingMedia = [
      ...existingPreviews.map((p) => ({
        id: p.id,
        filename: "Preview",
        size: 0,
        mimeType: "image/webp",
        previewUrl: p.url,
        isPreview: true,
        isPreviewOnly: true, // This is a preview-only file (from previews table)
      })),
      ...existingFiles.map((f) => ({
        ...f,
        isPreviewOnly: false,
      })),
    ];

    // Count current previews (standalone + file-linked + pending)
    const filePreviewCount = existingFiles.filter((f) => f.isPreview).length;
    const currentPreviewCount = existingPreviews.length + filePreviewCount + pendingPreviewIds.size;
    const canAddMorePreviews = currentPreviewCount < maxPreviews;

    // Pending count for parent notification
    const pendingCount = pendingFiles.filter((f) => f.status === "pending").length;

    useEffect(() => {
      onFilesChange?.(pendingCount);
    }, [pendingCount, onFilesChange]);

    // Expose methods to parent
    useImperativeHandle(ref, () => ({
      getPendingFiles: () => {
        return pendingFiles
          .filter((f) => f.status === "pending")
          .map((f) => ({
            file: { ...f, isPreview: pendingPreviewIds.has(f.id) },
            type: pendingPreviewIds.has(f.id) ? "preview" as const : "file" as const,
          }));
      },
      hasPendingFiles: pendingCount > 0,
      uploadAll: async (getUploadUrl, onConfirm) => {
        const pending = pendingFiles.filter((f) => f.status === "pending");
        for (const file of pending) {
          const type = pendingPreviewIds.has(file.id) ? "preview" : "file";
          await uploadFile(
            file,
            () => getUploadUrl(file.file, type as "preview" | "file"),
            (data) => onConfirm(data, type as "preview" | "file")
          );
        }
      },
      clearDoneFiles: () => {
        const doneIds = pendingFiles.filter((f) => f.status === "done").map((f) => f.id);
        doneIds.forEach((id) => {
          removeFile(id);
          setPendingPreviewIds((prev) => {
            const next = new Set(prev);
            next.delete(id);
            return next;
          });
        });
      },
    }), [pendingFiles, pendingPreviewIds, uploadFile, removeFile, pendingCount]);

    const handleFileSelect = useCallback(
      async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files?.length) {
          await addFiles(e.target.files);
          e.target.value = "";
        }
      },
      [addFiles]
    );

    const handleDrop = useCallback(
      async (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (e.dataTransfer.files?.length) {
          await addFiles(e.dataTransfer.files);
        }
      },
      [addFiles]
    );

    const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
    }, []);

    const handleDeleteExisting = async (id: string, isPreviewOnly: boolean) => {
      if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
      setDeleting(id);
      try {
        if (isPreviewOnly) {
          await onDeletePreview(id);
        } else {
          await onDeleteFile(id);
        }
      } finally {
        setDeleting(null);
      }
    };

    const handleTogglePendingPreview = (id: string) => {
      setPendingPreviewIds((prev) => {
        const next = new Set(prev);
        if (next.has(id)) {
          next.delete(id);
        } else if (next.size + existingPreviews.length < maxPreviews) {
          next.add(id);
        }
        return next;
      });
    };

    const handleToggleExistingPreview = async (id: string, currentlyIsPreview: boolean) => {
      if (!currentlyIsPreview && !canAddMorePreviews) return;
      setTogglingPreview(id);
      try {
        await onTogglePreview(id, !currentlyIsPreview);
      } finally {
        setTogglingPreview(null);
      }
    };

    const isImage = (mimeType: string) => mimeType.startsWith("image/");
    const isVideo = (mimeType: string) => mimeType.startsWith("video/");

    const getStatusIcon = (status: string) => {
      switch (status) {
        case "converting":
          return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
        case "uploading":
          return <Loader2 className="h-4 w-4 animate-spin text-primary" />;
        case "done":
          return <Check className="h-4 w-4 text-green-500" />;
        case "error":
          return <AlertCircle className="h-4 w-4 text-destructive" />;
        default:
          return null;
      }
    };

    const handleOpenLightbox = (index: number) => {
      if (!onOpenLightbox) return;
      const items = [
        ...allExistingMedia
          .filter((f) => f.previewUrl)
          .map((f) => ({
            url: f.previewUrl!,
            type: isVideo(f.mimeType) ? "video" as const : "image" as const,
            title: f.filename,
          })),
      ];
      if (items.length > 0) {
        onOpenLightbox(index, items);
      }
    };

    const totalFiles = allExistingMedia.length + pendingFiles.length;
    const totalPreviews = currentPreviewCount;

    return (
      <div className={cn("space-y-4 rounded-xl border bg-card p-6 shadow-sm", className)}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground">
              Midias do Pack
            </h3>
            <p className="text-xs text-muted-foreground">
              {totalFiles} arquivo(s) • {totalPreviews}/{maxPreviews} capa(s) selecionada(s)
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Star className="h-3.5 w-3.5 fill-primary text-primary" />
            <span>= Capa</span>
          </div>
        </div>

        {/* Info box */}
        <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground">
          <p>
            <strong>Dica:</strong> Clique na <Star className="inline h-3 w-3" /> para marcar como capa (maximo {maxPreviews}).
            Capas aparecem na vitrine e nao devem conter nudez explicita.
          </p>
        </div>

        {/* Drop zone */}
        {!disabled && (
          <div
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:bg-muted/50",
              isUploading && "pointer-events-none opacity-50"
            )}
          >
            <Upload className="h-8 w-8 text-muted-foreground" />
            <span className="mt-2 text-sm font-medium text-foreground">
              {isUploading ? "Enviando..." : "Adicionar fotos e videos"}
            </span>
            <span className="mt-1 text-xs text-muted-foreground">
              Arraste ou clique para selecionar
            </span>
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              multiple
              onChange={handleFileSelect}
              className="hidden"
              disabled={disabled || isUploading}
            />
          </div>
        )}

        {/* Media Grid */}
        {(allExistingMedia.length > 0 || pendingFiles.length > 0) && (
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6">
            {/* Existing media */}
            {allExistingMedia.map((media, index) => (
              <div
                key={media.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer",
                  media.isPreview && "ring-2 ring-primary ring-offset-2"
                )}
                onClick={() => handleOpenLightbox(index)}
              >
                {/* Thumbnail */}
                {media.previewUrl ? (
                  isVideo(media.mimeType) ? (
                    <>
                      <video
                        src={media.previewUrl}
                        className="h-full w-full object-cover"
                        muted
                        preload="metadata"
                      />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="rounded-full bg-black/60 p-2">
                          <Play className="h-4 w-4 text-white fill-white" />
                        </div>
                      </div>
                    </>
                  ) : (
                    <img
                      src={media.previewUrl}
                      alt={media.filename}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                    />
                  )
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {isImage(media.mimeType) ? (
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileVideo className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Preview badge */}
                {media.isPreview && (
                  <div className="absolute left-1 top-1 rounded-full bg-primary p-1">
                    <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
                  </div>
                )}

                {/* Hover overlay */}
                <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                  {/* Toggle preview button (only for images, not preview-only) */}
                  {!media.isPreviewOnly && isImage(media.mimeType) && !disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleToggleExistingPreview(media.id, media.isPreview);
                      }}
                      disabled={togglingPreview === media.id || (!media.isPreview && !canAddMorePreviews)}
                      className={cn(
                        "rounded-full p-1.5 transition-colors",
                        media.isPreview
                          ? "bg-primary text-primary-foreground"
                          : "bg-white/20 text-white hover:bg-primary hover:text-primary-foreground",
                        (!media.isPreview && !canAddMorePreviews) && "opacity-50 cursor-not-allowed"
                      )}
                      title={media.isPreview ? "Remover como capa" : "Definir como capa"}
                    >
                      {togglingPreview === media.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Star className={cn("h-4 w-4", media.isPreview && "fill-current")} />
                      )}
                    </button>
                  )}

                  {/* Zoom button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenLightbox(index);
                    }}
                    className="rounded-full bg-white/20 p-1.5 text-white hover:bg-white/30"
                  >
                    <ZoomIn className="h-4 w-4" />
                  </button>

                  {/* Delete button */}
                  {!disabled && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteExisting(media.id, media.isPreviewOnly || false);
                      }}
                      disabled={deleting === media.id}
                      className="rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
                    >
                      {deleting === media.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <X className="h-4 w-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}

            {/* Pending files */}
            {pendingFiles.map((file) => (
              <div
                key={file.id}
                className={cn(
                  "group relative aspect-square overflow-hidden rounded-lg bg-muted",
                  pendingPreviewIds.has(file.id) && "ring-2 ring-primary ring-offset-2"
                )}
              >
                {/* Thumbnail */}
                {isImage(file.file.type) && file.preview ? (
                  <img
                    src={file.preview}
                    alt={file.file.name}
                    className="h-full w-full object-cover"
                  />
                ) : isVideo(file.file.type) && file.preview ? (
                  <>
                    <video src={file.preview} className="h-full w-full object-cover" muted />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="rounded-full bg-black/60 p-2">
                        <Play className="h-4 w-4 text-white fill-white" />
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    {isImage(file.file.type) ? (
                      <FileImage className="h-8 w-8 text-muted-foreground" />
                    ) : (
                      <FileVideo className="h-8 w-8 text-muted-foreground" />
                    )}
                  </div>
                )}

                {/* Preview badge */}
                {pendingPreviewIds.has(file.id) && (
                  <div className="absolute left-1 top-1 rounded-full bg-primary p-1">
                    <Star className="h-3 w-3 fill-primary-foreground text-primary-foreground" />
                  </div>
                )}

                {/* Status indicator */}
                {file.status !== "pending" && (
                  <div className="absolute right-1 top-1 rounded-full bg-background p-0.5">
                    {getStatusIcon(file.status)}
                  </div>
                )}

                {/* Progress bar */}
                {file.status === "uploading" && (
                  <div className="absolute bottom-0 left-0 right-0">
                    <Progress value={file.progress} className="h-1 rounded-none" />
                  </div>
                )}

                {/* Hover overlay for pending files */}
                {file.status === "pending" && (
                  <div className="absolute inset-0 flex items-center justify-center gap-1 bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                    {/* Toggle preview button (only for images) */}
                    {isImage(file.file.type) && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTogglePendingPreview(file.id);
                        }}
                        disabled={!pendingPreviewIds.has(file.id) && !canAddMorePreviews}
                        className={cn(
                          "rounded-full p-1.5 transition-colors",
                          pendingPreviewIds.has(file.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-white/20 text-white hover:bg-primary hover:text-primary-foreground",
                          (!pendingPreviewIds.has(file.id) && !canAddMorePreviews) && "opacity-50 cursor-not-allowed"
                        )}
                        title={pendingPreviewIds.has(file.id) ? "Remover como capa" : "Definir como capa"}
                      >
                        <Star className={cn("h-4 w-4", pendingPreviewIds.has(file.id) && "fill-current")} />
                      </button>
                    )}

                    {/* Delete button */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFile(file.id);
                        setPendingPreviewIds((prev) => {
                          const next = new Set(prev);
                          next.delete(file.id);
                          return next;
                        });
                      }}
                      className="rounded-full bg-destructive p-1.5 text-destructive-foreground hover:bg-destructive/90"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {totalFiles === 0 && pendingFiles.length === 0 && (
          <p className="py-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo adicionado ainda.
          </p>
        )}

        {/* Pending info */}
        {pendingCount > 0 && (
          <p className="text-xs text-muted-foreground text-center">
            {pendingCount} arquivo(s) serao enviados ao salvar
          </p>
        )}

        {/* Requirements reminder */}
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-3 text-xs text-amber-800">
          <p>
            <strong>Requisitos:</strong> Minimo 3 arquivos e 1 capa para publicar.
            Capas nao devem conter nudez explicita.
          </p>
        </div>
      </div>
    );
  }
);
