"use client";

import { useCallback, useRef, useImperativeHandle, forwardRef, useEffect } from "react";
import { useMediaUpload } from "@/hooks/useMediaUpload";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import { Upload, X, FileImage, FileVideo, Check, AlertCircle, Loader2 } from "lucide-react";

export interface PendingFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "converting" | "uploading" | "done" | "error";
  error?: string;
}

export interface MediaUploaderRef {
  getPendingFiles: () => PendingFile[];
  uploadAll: (
    getUploadUrl: (file: File) => Promise<{ uploadUrl: string; key: string; fileId: string }>,
    onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }) => Promise<void>
  ) => Promise<void>;
  clearDoneFiles: () => void;
  isUploading: boolean;
}

interface MediaUploaderProps {
  onUpload: (
    file: File
  ) => Promise<{ uploadUrl: string; key: string; fileId: string }>;
  onConfirm: (data: {
    fileId: string;
    key: string;
    filename: string;
    mimeType: string;
    size: number;
  }) => Promise<void>;
  onComplete?: () => void;
  onFilesChange?: (pendingCount: number) => void;
  accept?: string;
  multiple?: boolean;
  maxFiles?: number;
  maxFileSize?: number;
  convertToWebP?: boolean;
  showPreviews?: boolean;
  previewMode?: "grid" | "list";
  className?: string;
  disabled?: boolean;
  label?: string;
  hint?: string;
  /** When true, hides the upload button - parent controls upload via ref */
  deferUpload?: boolean;
}

/**
 * Reusable media uploader component with WebP conversion and visual previews.
 * Supports deferred upload mode where parent controls when uploads happen.
 */
export const MediaUploader = forwardRef<MediaUploaderRef, MediaUploaderProps>(
  function MediaUploader(
    {
      onUpload,
      onConfirm,
      onComplete,
      onFilesChange,
      accept = "image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm",
      multiple = true,
      maxFiles = 50,
      maxFileSize = 100 * 1024 * 1024,
      convertToWebP = true,
      showPreviews = true,
      previewMode = "grid",
      className,
      disabled = false,
      label = "Adicionar arquivos",
      hint,
      deferUpload = false,
    },
    ref
  ) {
    const inputRef = useRef<HTMLInputElement>(null);

    const {
      files,
      addFiles,
      removeFile,
      clearFiles,
      uploadFile,
      uploadAll,
      isUploading,
    } = useMediaUpload({
      maxFiles,
      maxFileSize,
      convertToWebP,
      allowedTypes: accept.split(",").map((t) => t.trim()),
    });

    // Expose methods to parent via ref
    useImperativeHandle(ref, () => ({
      getPendingFiles: () => files.filter((f) => f.status === "pending"),
      uploadAll: async (getUploadUrl, confirmFn) => {
        await uploadAll(getUploadUrl, confirmFn);
      },
      clearDoneFiles: () => {
        const doneFiles = files.filter((f) => f.status === "done");
        doneFiles.forEach((f) => removeFile(f.id));
      },
      isUploading,
    }), [files, uploadAll, removeFile, isUploading]);

    // Calculate pending count
    const pendingCount = files.filter((f) => f.status === "pending").length;

    // Notify parent when pending files change (in useEffect to avoid setState during render)
    useEffect(() => {
      onFilesChange?.(pendingCount);
    }, [pendingCount, onFilesChange]);

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

  const handleUploadAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === "pending");

    for (const file of pendingFiles) {
      try {
        await uploadFile(
          file,
          () => onUpload(file.file),
          onConfirm
        );
      } catch (error) {
        console.error("Upload error:", error);
      }
    }

    onComplete?.();
  }, [files, uploadFile, onUpload, onConfirm, onComplete]);

  const uploadingCount = files.filter((f) => f.status === "uploading").length;
  const doneCount = files.filter((f) => f.status === "done").length;

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

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  return (
    <div className={cn("space-y-4", className)}>
      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onClick={() => !disabled && inputRef.current?.click()}
        className={cn(
          "flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:bg-muted/50",
          disabled && "cursor-not-allowed opacity-50",
          isUploading && "pointer-events-none"
        )}
      >
        <Upload className="h-8 w-8 text-muted-foreground" />
        <span className="mt-2 text-sm font-medium text-foreground">
          {isUploading ? "Enviando..." : label}
        </span>
        {hint && (
          <span className="mt-1 text-xs text-muted-foreground">{hint}</span>
        )}
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || isUploading}
        />
      </div>

      {/* File previews */}
      {showPreviews && files.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {files.length} arquivo(s) selecionado(s)
              {doneCount > 0 && ` (${doneCount} enviado(s))`}
            </span>
            {files.length > 0 && !isUploading && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFiles}
                className="text-muted-foreground hover:text-destructive"
              >
                Limpar
              </Button>
            )}
          </div>

          {previewMode === "grid" ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
                >
                  {isImage(file.file.type) && file.preview ? (
                    <img
                      src={file.preview}
                      alt={file.file.name}
                      className="h-full w-full object-cover"
                    />
                  ) : isVideo(file.file.type) && file.preview ? (
                    <video
                      src={file.preview}
                      className="h-full w-full object-cover"
                      muted
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {isImage(file.file.type) ? (
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <FileVideo className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Overlay with status */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    {file.status === "pending" && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(file.id);
                        }}
                        className="rounded-full bg-destructive p-1 text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>

                  {/* Status indicator */}
                  {file.status !== "pending" && (
                    <div className="absolute right-1 top-1">
                      {getStatusIcon(file.status)}
                    </div>
                  )}

                  {/* Progress bar */}
                  {file.status === "uploading" && (
                    <div className="absolute bottom-0 left-0 right-0">
                      <Progress value={file.progress} className="h-1 rounded-none" />
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center gap-3 rounded-lg border bg-muted/50 p-3"
                >
                  {/* Thumbnail */}
                  <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded bg-muted">
                    {isImage(file.file.type) && file.preview ? (
                      <img
                        src={file.preview}
                        alt={file.file.name}
                        className="h-full w-full object-cover"
                      />
                    ) : isVideo(file.file.type) && file.preview ? (
                      <video
                        src={file.preview}
                        className="h-full w-full object-cover"
                        muted
                      />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center">
                        {isImage(file.file.type) ? (
                          <FileImage className="h-5 w-5 text-muted-foreground" />
                        ) : (
                          <FileVideo className="h-5 w-5 text-muted-foreground" />
                        )}
                      </div>
                    )}
                  </div>

                  {/* File info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-foreground">
                      {file.file.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                      {file.status === "converting" && " - Convertendo..."}
                      {file.status === "uploading" && ` - ${file.progress}%`}
                      {file.error && ` - ${file.error}`}
                    </p>
                    {file.status === "uploading" && (
                      <Progress value={file.progress} className="mt-1 h-1" />
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {getStatusIcon(file.status)}
                    {file.status === "pending" && (
                      <button
                        type="button"
                        onClick={() => removeFile(file.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload button - only shown when not in deferred mode */}
          {pendingCount > 0 && !deferUpload && (
            <Button
              onClick={handleUploadAll}
              disabled={isUploading}
              className="w-full"
            >
              {isUploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Enviando {uploadingCount} de {pendingCount + uploadingCount}...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Enviar {pendingCount} arquivo(s)
                </>
              )}
            </Button>
          )}

          {/* Pending indicator for deferred mode */}
          {pendingCount > 0 && deferUpload && (
            <p className="text-xs text-muted-foreground text-center">
              {pendingCount} arquivo(s) serao enviados ao salvar
            </p>
          )}
        </div>
      )}
    </div>
  );
});
