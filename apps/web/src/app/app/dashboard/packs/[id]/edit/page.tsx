"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { ArrowLeft, Trash2, Upload, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

// Simple SVG placeholder as data URL
const PLACEHOLDER_IMAGE = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect fill='%23e5e7eb' width='100' height='100'/%3E%3Cpath fill='%239ca3af' d='M35 40h30v20H35z'/%3E%3Ccircle fill='%239ca3af' cx='40' cy='35' r='5'/%3E%3C/svg%3E";

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

export default function EditPackPage({ params }: EditPackPageProps) {
  const router = useRouter();
  const [pack, setPack] = useState<Pack | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  // Form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");

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
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
    } catch {
      toast.error("Erro ao despublicar pack");
    }
  };

  const handleFileUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: "preview" | "file"
  ) => {
    if (!e.target.files?.length) return;
    setUploading(true);

    try {
      const file = e.target.files[0];

      // Get upload URL
      const { data: uploadData } = await api.post(
        `/packs/${params.id}/upload-url`,
        {
          filename: file.name,
          contentType: file.type,
          type,
        }
      );

      // Upload to R2
      await fetch(uploadData.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      // Confirm upload
      await api.post(`/packs/${params.id}/files`, {
        fileId: uploadData.fileId,
        key: uploadData.key,
        filename: file.name,
        mimeType: file.type,
        size: file.size,
        type,
      });

      toast.success(type === "preview" ? "Preview adicionado!" : "Arquivo adicionado!");

      // Refresh pack data
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
    } catch {
      toast.error("Erro no upload. Tente novamente.");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const handleDeleteFile = async (fileId: string) => {
    if (!confirm("Tem certeza que deseja excluir este arquivo?")) return;
    setDeleting(fileId);

    try {
      await api.delete(`/packs/${params.id}/files/${fileId}`);
      toast.success("Arquivo excluido");
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
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
      const { data } = await api.get(`/packs/${params.id}`);
      setPack(data);
    } catch (error: unknown) {
      const axiosError = error as { response?: { data?: { message?: string } } };
      toast.error(axiosError.response?.data?.message || "Erro ao excluir preview");
    } finally {
      setDeleting(null);
    }
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

          <div className="grid grid-cols-3 gap-2">
            {pack.previews.map((preview) => (
              <div
                key={preview.id}
                className="group relative aspect-square overflow-hidden rounded-lg bg-muted"
              >
                <img
                  src={preview.url || PLACEHOLDER_IMAGE}
                  alt="Preview"
                  className="h-full w-full object-cover"
                />
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeletePreview(preview.id)}
                    disabled={deleting === preview.id}
                    className="absolute right-1 top-1 rounded-full bg-destructive p-1 text-destructive-foreground opacity-0 transition-opacity group-hover:opacity-100"
                    title="Excluir preview"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}
            {pack.previews.length < 3 && canEdit && (
              <Label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border hover:bg-muted">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="mt-2 text-xs text-muted-foreground">
                  {uploading ? "..." : "Adicionar"}
                </span>
                <Input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={(e) => handleFileUpload(e, "preview")}
                  disabled={uploading}
                />
              </Label>
            )}
          </div>

          {!canEdit && pack.previews.length < 3 && (
            <p className="text-xs text-amber-600">
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

          <div className="max-h-64 space-y-2 overflow-y-auto">
            {pack.files.map((file) => (
              <div
                key={file.id}
                className="flex items-center justify-between rounded-lg border bg-muted/50 p-3"
              >
                <div className="flex-1 min-w-0">
                  <span className="block truncate text-sm font-medium text-foreground">
                    {file.filename}
                  </span>
                  <span className="text-xs text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </span>
                </div>
                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleDeleteFile(file.id)}
                    disabled={deleting === file.id}
                    className="ml-2 rounded p-1 text-muted-foreground hover:bg-destructive hover:text-destructive-foreground"
                    title="Excluir arquivo"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                )}
              </div>
            ))}

            {pack.files.length === 0 && (
              <p className="py-4 text-center text-sm text-muted-foreground">
                Nenhum arquivo adicionado ainda.
              </p>
            )}
          </div>

          {canEdit && (
            <Label className="flex w-full cursor-pointer items-center justify-center rounded-lg border-2 border-dashed border-border py-6 hover:bg-muted">
              <div className="flex flex-col items-center">
                <Upload className="h-8 w-8 text-muted-foreground" />
                <span className="mt-2 text-sm text-muted-foreground">
                  {uploading ? "Enviando..." : "Adicionar Arquivos"}
                </span>
              </div>
              <Input
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => handleFileUpload(e, "file")}
                disabled={uploading}
              />
            </Label>
          )}

          {!canEdit && (
            <p className="text-xs text-amber-600">
              Despublique o pack para modificar arquivos.
            </p>
          )}
        </div>
      </div>

      {/* Publishing Requirements */}
      {pack.status === "draft" && (
        <div className="mt-8 rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h4 className="font-medium text-amber-800">
            Requisitos para publicar:
          </h4>
          <ul className="mt-2 space-y-1 text-sm text-amber-700">
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
    </div>
  );
}
