"use client";

import { useRef, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog";
import { Camera, Loader2 } from "lucide-react";
import { api } from "@/services/api";

interface ProfileImageUploaderProps {
  currentImage?: string | null;
  displayName?: string | null;
  onImageUpdate: (imageUrl: string) => void;
}

/**
 * Profile image upload card with crop dialog.
 * Handles file selection, validation, cropping, and upload.
 */
export function ProfileImageUploader({
  currentImage,
  displayName,
  onImageUpdate,
}: ProfileImageUploaderProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  function getInitials(name?: string | null) {
    if (!name) return "U";
    const trimmedName = name.trim();
    if (!trimmedName) return "U";
    return trimmedName
      .split(/\s+/)
      .filter(Boolean)
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2) || "U";
  }

  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setError("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError("Arquivo muito grande. Tamanho máximo: 5MB.");
      return;
    }

    setError(null);

    // Create object URL for the image and open crop dialog
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageSrc(imageUrl);
    setCropDialogOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  async function handleCroppedImageUpload(croppedBlob: Blob) {
    setUploading(true);
    setError(null);

    try {
      // Step 1: Get presigned upload URL
      const { data: uploadData } = await api.post("/auth/profile-image/upload-url", {
        contentType: "image/jpeg",
        imageType: "profile",
      });

      // Step 2: Upload cropped file directly to R2
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: croppedBlob,
        headers: {
          "Content-Type": "image/jpeg",
        },
      });

      // Step 3: Confirm upload and update user profile
      const { data: confirmData } = await api.post("/auth/profile-image/confirm", {
        key: uploadData.key,
        imageType: "profile",
      });

      onImageUpdate(confirmData.user.profileImage);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao fazer upload da imagem");
    } finally {
      setUploading(false);
      // Clean up object URL
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
        setSelectedImageSrc(null);
      }
    }
  }

  return (
    <>
      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="text-lg">Foto de Perfil</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-4">
          <div className="relative">
            <Avatar className="h-24 w-24 rounded-xl">
              <AvatarImage
                src={currentImage || undefined}
                alt={displayName || "Usuario"}
              />
              <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-semibold">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Camera className="h-4 w-4" />
              )}
            </button>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={handleFileSelect}
              className="hidden"
            />
          </div>
          {error && (
            <p className="text-xs text-destructive text-center">{error}</p>
          )}
          <p className="text-xs text-muted-foreground text-center">
            JPEG, PNG ou WebP. Máximo 5MB.
          </p>
        </CardContent>
      </Card>

      {selectedImageSrc && (
        <ImageCropperDialog
          open={cropDialogOpen}
          onOpenChange={(open) => {
            setCropDialogOpen(open);
            if (!open && selectedImageSrc) {
              URL.revokeObjectURL(selectedImageSrc);
              setSelectedImageSrc(null);
            }
          }}
          imageSrc={selectedImageSrc}
          onCropComplete={handleCroppedImageUpload}
          aspectRatio={1}
          circularCrop={true}
          title="Recortar Foto de Perfil"
          description="Ajuste a área de recorte para personalizar sua foto de perfil."
        />
      )}
    </>
  );
}
