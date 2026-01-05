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
import {
  PriceBreakdown,
  UploadProgressDialog,
  PackMediaManager,
  type PackMediaManagerRef,
  type UploadPhase,
} from "@/components/forms";
import { api } from "@/services/api";
import { ArrowLeft, X, ChevronLeft, ChevronRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
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
  isPreview?: boolean;
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

  // Upload refs and progress state
  const mediaManagerRef = useRef<PackMediaManagerRef>(null);
  const [pendingFilesCount, setPendingFilesCount] = useState(0);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [uploadPhase, setUploadPhase] = useState<UploadPhase>("idle");
  const [uploadTotalFiles, setUploadTotalFiles] = useState(0);
  const [uploadedFilesCount, setUploadedFilesCount] = useState(0);

  // Calcula preco em centavos em tempo real para o breakdown
  const priceInCents = useMemo(() => {
    const parsed = Math.round(
      Number.parseFloat(price.replace(",", ".")) * 100
    );
    return Number.isNaN(parsed) ? 0 : parsed;
  }, [price]);

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
    const pendingItems = mediaManagerRef.current?.getPendingFiles() || [];
    const totalPending = pendingItems.length;

    // If there are pending files, show progress dialog
    if (totalPending > 0) {
      setUploadTotalFiles(totalPending);
      setUploadedFilesCount(0);
      setUploadPhase("uploading");
      setUploadDialogOpen(true);

      try {
        let uploaded = 0;

        await mediaManagerRef.current?.uploadAll(
          async (file, type) => {
            const { data } = await api.post(`/packs/${params.id}/upload-url`, {
              filename: file.name,
              contentType: file.type,
              type,
            });
            return data;
          },
          async (data, type) => {
            await api.post(`/packs/${params.id}/files`, { ...data, type });
            uploaded++;
            setUploadedFilesCount(uploaded);
          }
        );
      } catch (error) {
        setUploadPhase("error");
        setTimeout(() => {
          setUploadDialogOpen(false);
          setUploadPhase("idle");
        }, 2000);
        return;
      }
    }

    // Now save pack data
    if (totalPending > 0) {
      setUploadPhase("saving");
    } else {
      setSaving(true);
    }

    try {
      const priceValue = Math.round(
        Number.parseFloat(price.replace(",", ".")) * 100
      );

      await api.patch(`/packs/${params.id}`, {
        title,
        description: description || undefined,
        price: priceValue,
      });

      // Refresh pack data
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);

      // Clear done files from uploader
      mediaManagerRef.current?.clearDoneFiles();

      if (totalPending > 0) {
        setUploadPhase("done");
        setTimeout(() => {
          setUploadDialogOpen(false);
          setUploadPhase("idle");
          toast.success("Pack atualizado com sucesso!");
        }, 1500);
      } else {
        toast.success("Pack atualizado com sucesso!");
      }
    } catch {
      if (totalPending > 0) {
        setUploadPhase("error");
        setTimeout(() => {
          setUploadDialogOpen(false);
          setUploadPhase("idle");
        }, 2000);
      } else {
        toast.error("Erro ao salvar alteracoes");
      }
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

  // Handler for toggling preview status
  const handleTogglePreview = useCallback(
    async (fileId: string, isPreview: boolean) => {
      try {
        await api.patch(`/packs/${params.id}/files/${fileId}/toggle-preview`, {
          isPreview,
        });
        toast.success(isPreview ? "Arquivo marcado como capa" : "Capa removida");
        await refreshPack();
      } catch (error: unknown) {
        const axiosError = error as { response?: { data?: { message?: string } } };
        toast.error(axiosError.response?.data?.message || "Erro ao alterar capa");
        throw error;
      }
    },
    [params.id, refreshPack]
  );

  const handleDeleteFile = useCallback(async (fileId: string) => {
    try {
      await api.delete(`/packs/${params.id}/files/${fileId}`);
      toast.success("Arquivo excluido");
      await refreshPack();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir arquivo");
      throw error;
    }
  }, [params.id, refreshPack]);

  const handleDeletePreview = useCallback(async (previewId: string) => {
    try {
      await api.delete(`/packs/${params.id}/previews/${previewId}`);
      toast.success("Preview excluido");
      await refreshPack();
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir preview");
      throw error;
    }
  }, [params.id, refreshPack]);

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
      {/* Unified Media Manager */}
      <PackMediaManager
        ref={mediaManagerRef}
        existingFiles={pack.files.map((f) => ({
          id: f.id,
          filename: f.filename,
          size: f.size,
          mimeType: f.mimeType,
          previewUrl: f.previewUrl,
          isPreview: f.isPreview || false,
        }))}
        existingPreviews={pack.previews}
        maxPreviews={3}
        onDeleteFile={handleDeleteFile}
        onDeletePreview={handleDeletePreview}
        onTogglePreview={handleTogglePreview}
        onFilesChange={setPendingFilesCount}
        onOpenLightbox={(index, items) => {
          setLightboxItems(items);
          setLightboxIndex(index);
          setLightboxOpen(true);
        }}
        disabled={!canEdit}
      />
      {/* Form Section */}
      <div className="mt-8 space-y-6 rounded-xl border bg-card p-6 shadow-sm">
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

          <div className="space-y-4">
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

            {/* Breakdown transparente das taxas */}
            <PriceBreakdown priceInCents={priceInCents} />
          </div>

          {canEdit && (
            <div className="space-y-2">
              <Button onClick={handleSave} disabled={saving} className="w-full">
                {saving ? "Salvando..." : pendingFilesCount > 0
                  ? `Enviar ${pendingFilesCount} arquivo(s) e Salvar`
                  : "Salvar Alteracoes"}
              </Button>
            </div>
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

      {/* Upload Progress Dialog */}
      <UploadProgressDialog
        open={uploadDialogOpen}
        phase={uploadPhase}
        totalFiles={uploadTotalFiles}
        uploadedFiles={uploadedFilesCount}
      />
    </div>
  );
}
