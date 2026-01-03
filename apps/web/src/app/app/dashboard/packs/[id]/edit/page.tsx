"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { MediaUploader } from "@/components/forms";
import { api } from "@/services/api";
import { PLACEHOLDER_IMAGE_SVG } from "@/utils/constants";
import { ArrowLeft, Trash2, X, FileVideo, FileImage, Play, ZoomIn, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";

interface EditPackPageProps {
  params: {
    id: string;
  };
}

interface PackFile {
  id: string;
  filename: string;
  size: number;
  mimeType: string;
  previewUrl?: string;
}

interface PackPreview {
  id: string;
  url: string;
}

interface Pack {
  id: string;
  title: string;
  description: string | null;
  price: number;
  status: string;
  files: PackFile[];
  previews: PackPreview[];
  _count?: {
    purchases: number;
  };
}

// Lightbox media item type
interface LightboxItem {
  url: string;
  type: "image" | "video";
  title?: string;
}

export default function EditPackPage({ params }: EditPackPageProps) {
  const router = useRouter();
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [deletingPack, setDeletingPack] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxItems, setLightboxItems] = useState<LightboxItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Refresh pack data
  const refreshPack = useCallback(async () => {
    const { data } = await api.get(`/packs/${params.id}`);
    setPack(data);
  }, [params.id]);

  useEffect(() => {
    async function fetchPack() {
      try {
        const { data } = await api.get(`/packs/${params.id}`);
        setPack(data);
        setTitle(data.title);
        setDescription(data.description || "");
        setPrice((data.price / 100).toFixed(2).replace(".", ","));
      } catch {
        toast.error("Erro ao carregar pack");
        router.push("/app/dashboard/packs");
      } finally {
        setLoading(false);
      }
    }
    fetchPack();
  }, [params.id, router]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const priceInCents = Math.round(
        Number.parseFloat(price.replace(",", ".")) * 100
      );

      await api.patch(`/packs/${params.id}`, {
        title,
        description: description || undefined,
        price: priceInCents,
      });

      toast.success("Pack atualizado com sucesso!");

      // Refresh pack data
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
    } catch {
      toast.error("Erro ao salvar alteracoes");
    } finally {
      setSaving(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post(`/packs/${params.id}/publish`);
      toast.success("Pack publicado com sucesso!");
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { errors?: string[]; message?: string } } };
      const errors = axiosError.response?.data?.errors;
      if (errors && Array.isArray(errors)) {
        errors.forEach((err) => toast.error(err));
      } else {
        toast.error(
          axiosError.response?.data?.message ||
            "Erro ao publicar. Verifique requisitos."
        );
      }
    }
  };

  const handleUnpublish = async () => {
    try {
      await api.post(`/packs/${params.id}/unpublish`);
      toast.success("Pack despublicado");
      await refreshPack();
    } catch {
      toast.error("Erro ao despublicar pack");
    }
  };

  const handleDeletePack = () => {
    setDeleteDialogOpen(true);
  };

  const confirmDeletePack = async () => {
    const hasPurchases = (pack?._count?.purchases ?? 0) > 0;

    setDeletingPack(true);
    setDeleteDialogOpen(false);
    try {
      await api.delete(`/packs/${params.id}`);
      toast.success(hasPurchases ? "Pack arquivado com sucesso" : "Pack excluído com sucesso");
      router.push("/app/dashboard/packs");
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir pack");
    } finally {
      setDeletingPack(false);
    }
  };

  // Upload handlers for MediaUploader
  const handlePreviewUpload = useCallback(
    async (file: File) => {
      const { data } = await api.post(`/packs/${params.id}/upload-url`, {
        filename: file.name,
        contentType: file.type,
        type: "preview",
      });
      return data;
    },
    [params.id]
  );

  const handleFileUpload = useCallback(
    async (file: File) => {
      const { data } = await api.post(`/packs/${params.id}/upload-url`, {
        filename: file.name,
        contentType: file.type,
        type: "file",
      });
      return data;
    },
    [params.id]
  );

  const handleUploadConfirm = useCallback(
    async (
      data: { fileId: string; key: string; filename: string; mimeType: string; size: number },
      type: "preview" | "file"
    ) => {
      await api.post(`/packs/${params.id}/files`, {
        ...data,
        type,
      });
    },
    [params.id]
  );

  const handlePreviewComplete = useCallback(() => {
    refreshPack();
    toast.success("Previews enviados com sucesso!");
  }, [refreshPack]);

  const handleFilesComplete = useCallback(() => {
    refreshPack();
    toast.success("Arquivos enviados com sucesso!");
  }, [refreshPack]);

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    setDeleting(fileId);

    try {
      await api.delete(`/packs/${params.id}/files/${fileId}`);
      toast.success("Arquivo excluido");
      await refreshPack();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir arquivo");
    } finally {
      setDeleting(null);
    }
  };

  const handleDeletePreview = async (previewId: string) => {
    if (!confirm("Tem certeza que deseja excluir este preview?")) return;
    setDeleting(previewId);

    try {
      await api.delete(`/packs/${params.id}/previews/${previewId}`);
      toast.success("Preview excluido");
      await refreshPack();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir preview");
    } finally {
      setDeleting(null);
    }
  };

  const isImage = (mimeType: string) => mimeType.startsWith("image/");
  const isVideo = (mimeType: string) => mimeType.startsWith("video/");

  // Open lightbox with files
  const openFileLightbox = (index: number) => {
    if (!pack) return;
    const items: LightboxItem[] = pack.files
      .filter((f) => f.previewUrl)
      .map((f) => ({
        url: f.previewUrl!,
        type: isVideo(f.mimeType) ? "video" : "image",
        title: f.filename,
      }));
    if (items.length > 0) {
      setLightboxItems(items);
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  // Open lightbox with previews
  const openPreviewLightbox = (index: number) => {
    if (!pack) return;
    const items: LightboxItem[] = pack.previews.map((p) => ({
      url: p.url,
      type: "image" as const,
      title: `Preview ${index + 1}`,
    }));
    if (items.length > 0) {
      setLightboxItems(items);
      setLightboxIndex(index);
      setLightboxOpen(true);
    }
  };

  const lightboxNext = () => {
    setLightboxIndex((i) => (i + 1) % lightboxItems.length);
  };

  const lightboxPrev = () => {
    setLightboxIndex((i) => (i - 1 + lightboxItems.length) % lightboxItems.length);
  };

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  if (!pack) return null;

  const canEdit = pack.status === "draft" || pack.status === "unpublished";
  const canPublish = pack.previews.length >= 1 && pack.files.length >= 3;

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/app/dashboard/packs"
          className="mb-4 inline-flex items-center text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Meus Packs
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Editar Pack</h1>
            <div className="mt-2 flex items-center gap-2">
              <Badge
                variant={
                  pack.status === "published"
                    ? "default"
                    : pack.status === "draft"
                      ? "secondary"
                      : "outline"
                }
              >
                {pack.status === "published"
                  ? "Publicado"
                  : pack.status === "draft"
                    ? "Rascunho"
                    : "Despublicado"}
              </Badge>
              {pack._count && pack._count.purchases > 0 && (
                <span className="text-sm text-muted-foreground">
                  {pack._count.purchases} vendas
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2">
            {pack.status === "draft" && (
              <Button
                onClick={handlePublish}
                disabled={!canPublish}
                title={
                  !canPublish
                    ? "Necessario: 1 preview e 3 arquivos"
                    : undefined
                }
              >
                Publicar
              </Button>
            )}
            {pack.status === "published" && (
              <Button variant="outline" onClick={handleUnpublish}>
                Despublicar
              </Button>
            )}
            {pack.status === "unpublished" && (
              <Button onClick={handlePublish} disabled={!canPublish}>
                Republicar
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Form Section */}
      <div className="mb-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-foreground">
          Informacoes do Pack
        </h2>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Titulo</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Pack Pezinhos #01"
              disabled={!canEdit}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descricao</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setDescription(e.target.value)}
              placeholder="Descreva o conteudo do seu pack..."
              rows={4}
              disabled={!canEdit}
            />
            <p className="text-xs text-muted-foreground">
              Uma boa descricao ajuda a vender mais!
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Preco (R$)</Label>
            <Input
              id="price"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="29,90"
              disabled={!canEdit}
            />
            <p className="text-xs text-muted-foreground">
              Minimo R$ 9,90 - Maximo R$ 500,00
            </p>
          </div>

          {canEdit && (
            <Button onClick={handleSave} disabled={saving}>
              {saving ? "Salvando..." : "Salvar Alteracoes"}
            </Button>
          )}
        </div>
      </div>

      {/* Previews and Files Grid */}
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Previews Section */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h3 className="font-semibold text-foreground">
              Previews (Capa) - {pack.previews.length}/3
            </h3>
            <p className="text-xs text-muted-foreground">
              Imagens publicas. Sem nudez explicita.
            </p>
          </div>

          {/* Existing previews */}
          {pack.previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2">
              {pack.previews.map((preview, index) => (
                <div
                  key={preview.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                  onClick={() => openPreviewLightbox(index)}
                >
                  <img
                    src={preview.url || PLACEHOLDER_IMAGE_SVG}
                    alt="Preview"
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                  {/* Zoom overlay on hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreview(preview.id);
                      }}
                      disabled={deleting === preview.id}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 z-10"
                      title="Excluir preview"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {/* Upload new previews */}
          {pack.previews.length < 3 && canEdit && (
            <MediaUploader
              onUpload={handlePreviewUpload}
              onConfirm={(data) => handleUploadConfirm(data, "preview")}
              onComplete={handlePreviewComplete}
              accept="image/jpeg,image/png,image/webp"
              multiple={true}
              maxFiles={3 - pack.previews.length}
              maxFileSize={5 * 1024 * 1024}
              convertToWebP={true}
              showPreviews={true}
              previewMode="grid"
              label="Adicionar previews"
              hint={`Máximo ${3 - pack.previews.length} imagem(ns). Convertidas para WebP.`}
            />
          )}

          {!canEdit && pack.previews.length < 3 && (
            <p className="text-xs text-gray-400">
              Despublique o pack para adicionar mais previews.
            </p>
          )}
        </div>

        {/* Files Section */}
        <div className="space-y-4 rounded-xl border bg-card p-6 shadow-sm">
          <div>
            <h3 className="font-semibold text-foreground">
              Arquivos do Pack - {pack.files.length}
            </h3>
            <p className="text-xs text-muted-foreground">
              Conteudo exclusivo (Fotos/Videos). Minimo 3 arquivos.
            </p>
          </div>

          {/* Existing files - Grid with thumbnails */}
          {pack.files.length > 0 && (
            <div className="grid grid-cols-3 gap-2 max-h-80 overflow-y-auto">
              {pack.files.map((file, index) => (
                <div
                  key={file.id}
                  className="group relative aspect-square overflow-hidden rounded-lg bg-muted cursor-pointer"
                  onClick={() => file.previewUrl && openFileLightbox(index)}
                >
                  {/* Thumbnail */}
                  {file.previewUrl ? (
                    isVideo(file.mimeType) ? (
                      <>
                        <video
                          src={file.previewUrl}
                          className="h-full w-full object-cover"
                          muted
                          preload="metadata"
                        />
                        {/* Play icon overlay for videos */}
                        <div className="absolute inset-0 flex items-center justify-center">
                          <div className="rounded-full bg-black/60 p-2">
                            <Play className="h-6 w-6 text-white fill-white" />
                          </div>
                        </div>
                      </>
                    ) : (
                      <img
                        src={file.previewUrl}
                        alt={file.filename}
                        className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      />
                    )
                  ) : (
                    <div className="flex h-full w-full items-center justify-center">
                      {isImage(file.mimeType) ? (
                        <FileImage className="h-8 w-8 text-muted-foreground" />
                      ) : (
                        <FileVideo className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                  )}

                  {/* Hover overlay with zoom icon */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                    <ZoomIn className="h-6 w-6 text-white" />
                  </div>

                  {/* File info at bottom */}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2 opacity-0 transition-opacity group-hover:opacity-100">
                    <p className="truncate text-xs text-white font-medium">
                      {file.filename}
                    </p>
                    <p className="text-xs text-white/70">
                      {(file.size / 1024 / 1024).toFixed(1)} MB
                    </p>
                  </div>

                  {/* Delete button */}
                  {canEdit && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteFile(file.id);
                      }}
                      disabled={deleting === file.id}
                      className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100 z-10"
                      title="Excluir arquivo"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {pack.files.length === 0 && (
            <p className="py-4 text-center text-sm text-muted-foreground">
              Nenhum arquivo adicionado ainda.
            </p>
          )}

          {/* Upload new files */}
          {canEdit && (
            <MediaUploader
              onUpload={handleFileUpload}
              onConfirm={(data) => handleUploadConfirm(data, "file")}
              onComplete={handleFilesComplete}
              accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm"
              multiple={true}
              maxFiles={50 - pack.files.length}
              maxFileSize={100 * 1024 * 1024}
              convertToWebP={true}
              showPreviews={true}
              previewMode="list"
              label="Adicionar arquivos"
              hint="Fotos e vídeos. Imagens convertidas para WebP."
            />
          )}

          {!canEdit && (
            <p className="text-xs text-gray-400">
              Despublique o pack para modificar arquivos.
            </p>
          )}
        </div>
      </div>

      {/* Publishing Requirements */}
      {pack.status === "draft" && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-medium text-gray-800">
            Requisitos para publicar:
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            <li className={pack.previews.length >= 1 ? "line-through opacity-50" : ""}>
              - Ao menos 1 imagem de preview
            </li>
            <li className={pack.files.length >= 3 ? "line-through opacity-50" : ""}>
              - Ao menos 3 arquivos no pack
            </li>
            <li className={title.length >= 3 ? "line-through opacity-50" : ""}>
              - Titulo com pelo menos 3 caracteres
            </li>
          </ul>
        </div>
      )}

      {/* Danger Zone - Delete/Archive */}
      <div className="mt-12 border-t pt-8 text-center">
        <button
          type="button"
          onClick={handleDeletePack}
          disabled={deletingPack}
          className="text-sm text-red-800 hover:text-destructive transition-colors disabled:opacity-50"
        >
          {deletingPack
            ? "Processando..."
            : pack._count?.purchases
              ? "Arquivar este pack"
              : "Excluir este pack"}
        </button>
        <p className="mt-1 text-xs text-muted-foreground/70">
          {pack._count?.purchases
            ? "O pack será removido da sua lista, mas compradores manterão acesso."
            : "Esta ação não pode ser desfeita."}
        </p>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {pack._count?.purchases ? "Arquivar pack?" : "Excluir pack?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {pack._count?.purchases
                ? `Este pack tem ${pack._count.purchases} venda(s). Ele será removido da sua lista, mas os compradores manterão acesso ao conteúdo.`
                : "Esta ação não pode ser desfeita. O pack e todos os seus arquivos serão excluídos permanentemente."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeletePack}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {pack._count?.purchases ? "Arquivar" : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Lightbox Dialog */}
      <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
        <DialogContent className="max-w-[95vw] max-h-[95vh] w-full h-full p-0 bg-black/95 border-none overflow-hidden [&>button]:hidden">
          <DialogTitle className="sr-only">Visualizar mídia</DialogTitle>
          <DialogDescription className="sr-only">
            Visualização em tela cheia da mídia selecionada
          </DialogDescription>
          {lightboxItems.length > 0 && (
            <div className="relative flex h-full w-full items-center justify-center overflow-hidden">
              {/* Close button */}
              <button
                type="button"
                onClick={() => setLightboxOpen(false)}
                className="absolute top-2 right-2 sm:top-4 sm:right-4 z-50 rounded-full bg-white/10 p-2 text-white hover:bg-white/20 transition-colors"
              >
                <X className="h-5 w-5 sm:h-6 sm:w-6" />
              </button>

              {/* Navigation - Previous */}
              {lightboxItems.length > 1 && (
                <button
                  type="button"
                  onClick={lightboxPrev}
                  className="absolute left-2 sm:left-4 z-50 rounded-full bg-white/10 p-2 sm:p-3 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronLeft className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              )}

              {/* Media content */}
              <div className="flex items-center justify-center w-full h-full px-12 sm:px-16 py-16 sm:py-20 overflow-hidden">
                {lightboxItems[lightboxIndex]?.type === "video" ? (
                  <video
                    key={lightboxItems[lightboxIndex].url}
                    src={lightboxItems[lightboxIndex].url}
                    controls
                    autoPlay
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                    style={{ maxHeight: 'calc(95vh - 120px)', maxWidth: 'calc(95vw - 100px)' }}
                  />
                ) : (
                  <img
                    key={lightboxItems[lightboxIndex].url}
                    src={lightboxItems[lightboxIndex].url}
                    alt={lightboxItems[lightboxIndex].title || "Media"}
                    className="max-h-full max-w-full w-auto h-auto object-contain rounded-lg"
                    style={{ maxHeight: 'calc(95vh - 120px)', maxWidth: 'calc(95vw - 100px)' }}
                  />
                )}
              </div>

              {/* Navigation - Next */}
              {lightboxItems.length > 1 && (
                <button
                  type="button"
                  onClick={lightboxNext}
                  className="absolute right-2 sm:right-4 z-50 rounded-full bg-white/10 p-2 sm:p-3 text-white hover:bg-white/20 transition-colors"
                >
                  <ChevronRight className="h-6 w-6 sm:h-8 sm:w-8" />
                </button>
              )}

              {/* Counter and title */}
              <div className="absolute bottom-2 sm:bottom-4 left-0 right-0 text-center">
                <p className="text-white/70 text-xs sm:text-sm">
                  {lightboxIndex + 1} / {lightboxItems.length}
                </p>
                {lightboxItems[lightboxIndex]?.title && (
                  <p className="text-white text-xs sm:text-sm mt-1 truncate px-8">
                    {lightboxItems[lightboxIndex].title}
                  </p>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
