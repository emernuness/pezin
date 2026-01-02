"use client";

import { useState, useCallback } from "react";

interface UploadedFile {
  id: string;
  file: File;
  preview: string;
  progress: number;
  status: "pending" | "converting" | "uploading" | "done" | "error";
  error?: string;
}

interface UseMediaUploadOptions {
  maxFiles?: number;
  maxFileSize?: number; // in bytes
  allowedTypes?: string[];
  convertToWebP?: boolean;
  webPQuality?: number; // 0-1
}

interface UseMediaUploadReturn {
  files: UploadedFile[];
  addFiles: (files: FileList | File[]) => Promise<void>;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  uploadFile: (
    file: UploadedFile,
    getUploadUrl: () => Promise<{ uploadUrl: string; key: string; fileId: string }>,
    onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }) => Promise<void>
  ) => Promise<void>;
  uploadAll: (
    getUploadUrl: (file: File) => Promise<{ uploadUrl: string; key: string; fileId: string }>,
    onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }) => Promise<void>
  ) => Promise<void>;
  isUploading: boolean;
}

/**
 * Hook for handling media uploads with WebP conversion and previews.
 * Supports multiple file selection, progress tracking, and automatic image optimization.
 */
export function useMediaUpload(options: UseMediaUploadOptions = {}): UseMediaUploadReturn {
  const {
    maxFiles = 50,
    maxFileSize = 100 * 1024 * 1024, // 100MB
    allowedTypes = ["image/jpeg", "image/png", "image/webp", "video/mp4", "video/quicktime", "video/webm"],
    convertToWebP = true,
    webPQuality = 0.85,
  } = options;

  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  /**
   * Convert image to WebP format using Canvas API
   */
  const convertImageToWebP = useCallback(
    async (file: File): Promise<File> => {
      // Skip if already WebP or not an image
      if (file.type === "image/webp" || !file.type.startsWith("image/")) {
        return file;
      }

      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width;
          canvas.height = img.height;

          const ctx = canvas.getContext("2d");
          if (!ctx) {
            resolve(file); // Fallback to original
            return;
          }

          ctx.drawImage(img, 0, 0);

          canvas.toBlob(
            (blob) => {
              if (!blob) {
                resolve(file); // Fallback to original
                return;
              }

              // Create new file with .webp extension
              const newFilename = file.name.replace(/\.[^.]+$/, ".webp");
              const webpFile = new File([blob], newFilename, {
                type: "image/webp",
                lastModified: Date.now(),
              });

              resolve(webpFile);
            },
            "image/webp",
            webPQuality
          );
        };

        img.onerror = () => reject(new Error("Failed to load image"));
        img.src = URL.createObjectURL(file);
      });
    },
    [webPQuality]
  );

  /**
   * Create preview URL for file
   */
  const createPreview = useCallback((file: File): string => {
    if (file.type.startsWith("image/") || file.type.startsWith("video/")) {
      return URL.createObjectURL(file);
    }
    return "";
  }, []);

  /**
   * Generate unique ID for file
   */
  const generateId = useCallback(() => {
    return `${Date.now()}_${Math.random().toString(36).substring(7)}`;
  }, []);

  /**
   * Add files to the upload queue
   */
  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      // Check max files limit
      if (files.length + fileArray.length > maxFiles) {
        throw new Error(`Máximo de ${maxFiles} arquivos permitidos`);
      }

      const processedFiles: UploadedFile[] = [];

      for (const file of fileArray) {
        // Validate file type
        if (!allowedTypes.some((type) => file.type.match(type.replace("*", ".*")))) {
          console.warn(`Tipo de arquivo não permitido: ${file.type}`);
          continue;
        }

        // Validate file size
        if (file.size > maxFileSize) {
          console.warn(`Arquivo muito grande: ${file.name}`);
          continue;
        }

        const id = generateId();
        let processedFile = file;
        let preview = createPreview(file);

        // Convert images to WebP if enabled
        if (convertToWebP && file.type.startsWith("image/") && file.type !== "image/webp") {
          try {
            // Show converting status
            processedFiles.push({
              id,
              file,
              preview,
              progress: 0,
              status: "converting",
            });

            processedFile = await convertImageToWebP(file);
            // Update preview with converted file
            preview = createPreview(processedFile);
          } catch {
            console.warn(`Falha ao converter ${file.name} para WebP`);
          }
        }

        // Update or add file to list
        const existingIndex = processedFiles.findIndex((f) => f.id === id);
        if (existingIndex >= 0) {
          processedFiles[existingIndex] = {
            id,
            file: processedFile,
            preview,
            progress: 0,
            status: "pending",
          };
        } else {
          processedFiles.push({
            id,
            file: processedFile,
            preview,
            progress: 0,
            status: "pending",
          });
        }
      }

      setFiles((prev) => [...prev, ...processedFiles]);
    },
    [files.length, maxFiles, maxFileSize, allowedTypes, convertToWebP, generateId, createPreview, convertImageToWebP]
  );

  /**
   * Remove file from queue
   */
  const removeFile = useCallback((id: string) => {
    setFiles((prev) => {
      const file = prev.find((f) => f.id === id);
      if (file?.preview) {
        URL.revokeObjectURL(file.preview);
      }
      return prev.filter((f) => f.id !== id);
    });
  }, []);

  /**
   * Clear all files
   */
  const clearFiles = useCallback(() => {
    files.forEach((f) => {
      if (f.preview) {
        URL.revokeObjectURL(f.preview);
      }
    });
    setFiles([]);
  }, [files]);

  /**
   * Upload a single file
   */
  const uploadFile = useCallback(
    async (
      uploadedFile: UploadedFile,
      getUploadUrl: () => Promise<{ uploadUrl: string; key: string; fileId: string }>,
      onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }) => Promise<void>
    ) => {
      try {
        // Update status to uploading
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "uploading" as const, progress: 0 } : f))
        );

        // Get upload URL
        const { uploadUrl, key, fileId } = await getUploadUrl();

        // Upload to storage with progress
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest();

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              const progress = Math.round((e.loaded / e.total) * 100);
              setFiles((prev) => prev.map((f) => (f.id === uploadedFile.id ? { ...f, progress } : f)));
            }
          });

          xhr.addEventListener("load", () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve();
            } else {
              reject(new Error(`Upload failed: ${xhr.status}`));
            }
          });

          xhr.addEventListener("error", () => reject(new Error("Network error")));
          xhr.addEventListener("abort", () => reject(new Error("Upload aborted")));

          xhr.open("PUT", uploadUrl);
          xhr.setRequestHeader("Content-Type", uploadedFile.file.type);
          xhr.send(uploadedFile.file);
        });

        // Confirm upload
        await onConfirm({
          fileId,
          key,
          filename: uploadedFile.file.name,
          mimeType: uploadedFile.file.type,
          size: uploadedFile.file.size,
        });

        // Update status to done
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "done" as const, progress: 100 } : f))
        );
      } catch (error) {
        const message = error instanceof Error ? error.message : "Erro no upload";
        setFiles((prev) =>
          prev.map((f) => (f.id === uploadedFile.id ? { ...f, status: "error" as const, error: message } : f))
        );
        throw error;
      }
    },
    []
  );

  /**
   * Upload all pending files
   */
  const uploadAll = useCallback(
    async (
      getUploadUrl: (file: File) => Promise<{ uploadUrl: string; key: string; fileId: string }>,
      onConfirm: (data: { fileId: string; key: string; filename: string; mimeType: string; size: number }) => Promise<void>
    ) => {
      setIsUploading(true);

      const pendingFiles = files.filter((f) => f.status === "pending");

      try {
        for (const file of pendingFiles) {
          await uploadFile(file, () => getUploadUrl(file.file), onConfirm);
        }
      } finally {
        setIsUploading(false);
      }
    },
    [files, uploadFile]
  );

  return {
    files,
    addFiles,
    removeFile,
    clearFiles,
    uploadFile,
    uploadAll,
    isUploading,
  };
}
