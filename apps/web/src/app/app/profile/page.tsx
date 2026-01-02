"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageCropperDialog } from "@/components/ui/image-cropper-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { updateCreatorProfileSchema } from "@pack-do-pezin/shared";
import { AlertCircle, Camera, CheckCircle2, Loader2, Mail, MapPin, FileText, User } from "lucide-react";
import { useEffect, useRef, useState } from "react";

function ProfileSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-96 rounded-2xl" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

// Utility functions for formatting
function formatCPF(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 3) return cleaned;
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}.${cleaned.slice(3)}`;
  if (cleaned.length <= 9) return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6)}`;
  return `${cleaned.slice(0, 3)}.${cleaned.slice(3, 6)}.${cleaned.slice(6, 9)}-${cleaned.slice(9)}`;
}

function formatPhone(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 11);
  if (cleaned.length <= 2) return cleaned;
  if (cleaned.length <= 7) return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2)}`;
  return `(${cleaned.slice(0, 2)}) ${cleaned.slice(2, 7)}-${cleaned.slice(7)}`;
}

function formatCEP(value: string): string {
  const cleaned = value.replace(/\D/g, "").slice(0, 8);
  if (cleaned.length <= 5) return cleaned;
  return `${cleaned.slice(0, 5)}-${cleaned.slice(5)}`;
}

export default function ProfilePage() {
  const { user, isLoading, setUser, fetchMe } = useAuthStore();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Basic profile
  const [displayName, setDisplayName] = useState("");
  const [bio, setBio] = useState("");
  const [slug, setSlug] = useState("");

  // Personal data (creators)
  const [fullName, setFullName] = useState("");
  const [cpf, setCpf] = useState("");
  const [phone, setPhone] = useState("");

  // Address (creators)
  const [zipCode, setZipCode] = useState("");
  const [street, setStreet] = useState("");
  const [number, setNumber] = useState("");
  const [complement, setComplement] = useState("");
  const [neighborhood, setNeighborhood] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loadingCep, setLoadingCep] = useState(false);

  // Image upload states
  const [uploadingImage, setUploadingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [cropDialogOpen, setCropDialogOpen] = useState(false);
  const [selectedImageSrc, setSelectedImageSrc] = useState<string | null>(null);

  // Email verification states
  const [sendingVerification, setSendingVerification] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);

  const isCreator = user?.userType === "creator";

  useEffect(() => {
    if (user) {
      setDisplayName(user.displayName || "");
      setBio(user.bio || "");
      setSlug(user.slug || "");
      setFullName(user.fullName || "");
      setCpf(user.cpf ? formatCPF(user.cpf) : "");
      setPhone(user.phone ? formatPhone(user.phone) : "");
      setZipCode(user.address?.zipCode ? formatCEP(user.address.zipCode) : "");
      setStreet(user.address?.street || "");
      setNumber(user.address?.number || "");
      setComplement(user.address?.complement || "");
      setNeighborhood(user.address?.neighborhood || "");
      setCity(user.address?.city || "");
      setState(user.address?.state || "");
    }
  }, [user]);

  const getInitials = (name?: string | null) => {
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
  };

  // Handle file selection - opens crop dialog
  function handleFileSelect(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    const allowedTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      setImageError("Tipo de arquivo não permitido. Use JPEG, PNG ou WebP.");
      return;
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setImageError("Arquivo muito grande. Tamanho máximo: 5MB.");
      return;
    }

    setImageError(null);

    // Create object URL for the image and open crop dialog
    const imageUrl = URL.createObjectURL(file);
    setSelectedImageSrc(imageUrl);
    setCropDialogOpen(true);

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  // Handle cropped image upload
  async function handleCroppedImageUpload(croppedBlob: Blob) {
    setUploadingImage(true);
    setImageError(null);

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

      setUser(confirmData.user);
    } catch (err: any) {
      setImageError(err.response?.data?.message || "Erro ao fazer upload da imagem");
    } finally {
      setUploadingImage(false);
      // Clean up object URL
      if (selectedImageSrc) {
        URL.revokeObjectURL(selectedImageSrc);
        setSelectedImageSrc(null);
      }
    }
  }

  // Handle resend verification email
  async function handleResendVerification() {
    setSendingVerification(true);

    try {
      await api.post("/auth/resend-verification");
      setVerificationSent(true);
      setTimeout(() => setVerificationSent(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao reenviar email de verificação");
    } finally {
      setSendingVerification(false);
    }
  }

  // Auto-fill address from CEP
  async function handleCepBlur() {
    const cleanedCep = zipCode.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        setStreet(data.logradouro || "");
        setNeighborhood(data.bairro || "");
        setCity(data.localidade || "");
        setState(data.uf || "");
      }
    } catch {
      // Silently fail - user can fill manually
    } finally {
      setLoadingCep(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const data: any = {
      displayName: displayName || null,
      bio: bio || null,
    };

    // Only add creator fields if user is creator
    if (isCreator) {
      data.slug = slug || null;
      data.fullName = fullName || null;
      data.cpf = cpf || null;
      data.phone = phone || null;

      if (zipCode || street || number || neighborhood || city || state) {
        data.address = {
          zipCode: zipCode.replace(/\D/g, "") || "",
          street: street || "",
          number: number || "",
          complement: complement || null,
          neighborhood: neighborhood || "",
          city: city || "",
          state: state || "",
        };
      }
    }

    const parsed = updateCreatorProfileSchema.safeParse(data);

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Dados inválidos");
      return;
    }

    setSaving(true);

    try {
      const endpoint = isCreator ? "/auth/creator-profile" : "/auth/profile";
      const res = await api.patch(endpoint, data);
      setUser(res.data.user);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao salvar perfil");
    } finally {
      setSaving(false);
    }
  }

  // Check if creator has completed required data for Stripe
  const hasCompleteCreatorData = isCreator && user?.fullName && user?.cpf && user?.phone && user?.address?.zipCode;

  if (isLoading) return <ProfileSkeleton />;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Meu Perfil
        </h1>
        <p className="text-muted-foreground">
          Gerencie suas informações pessoais.
        </p>
      </div>

      {/* Email Verification Alert */}
      {user && !user.emailVerified && (
        <Card className="border-yellow-500/50 bg-yellow-500/5">
          <CardContent className="p-4 flex items-center gap-3">
            <Mail className="h-5 w-5 text-yellow-600 shrink-0" />
            <div className="flex-1">
              <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                Verifique seu email
              </p>
              <p className="text-xs text-yellow-700 dark:text-yellow-300">
                Enviamos um link de verificação para {user.email}. Verifique sua caixa de entrada.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleResendVerification}
              disabled={sendingVerification || verificationSent}
              className="shrink-0"
            >
              {sendingVerification ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : verificationSent ? (
                <>
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Enviado!
                </>
              ) : (
                "Reenviar"
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Foto de Perfil</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4">
              <div className="relative">
                <Avatar className="h-24 w-24 rounded-xl">
                  <AvatarImage
                    src={user?.profileImage || undefined}
                    alt={user?.displayName || "Usuario"}
                  />
                  <AvatarFallback className="rounded-xl bg-primary/10 text-primary text-2xl font-semibold">
                    {getInitials(user?.displayName)}
                  </AvatarFallback>
                </Avatar>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploadingImage}
                  className="absolute -bottom-2 -right-2 p-2 rounded-full bg-primary text-black hover:bg-primary/90 transition-colors disabled:opacity-50"
                >
                  {uploadingImage ? (
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
              {imageError && (
                <p className="text-xs text-destructive text-center">{imageError}</p>
              )}
              <p className="text-xs text-muted-foreground text-center">
                JPEG, PNG ou WebP. Máximo 5MB.
              </p>
            </CardContent>
          </Card>

          <Card className="shadow-sm border-border bg-card lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Informações Básicas
              </CardTitle>
              <CardDescription>
                Informações públicas do seu perfil.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="flex gap-2">
                  <Input
                    id="email"
                    type="email"
                    value={user?.email || ""}
                    disabled
                    className="bg-muted flex-1"
                  />
                  {user?.emailVerified ? (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded-md">
                      <CheckCircle2 className="h-3 w-3 mr-1" />
                      Verificado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-100 rounded-md">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Pendente
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">
                  O email não pode ser alterado.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="displayName">Nome de exibição</Label>
                <Input
                  id="displayName"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder="Seu nome ou apelido"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  {displayName.length}/50 caracteres
                </p>
              </div>

              {isCreator && (
                <div className="space-y-2">
                  <Label htmlFor="slug">URL do Perfil</Label>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">pezin.com/</span>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
                      placeholder="seu-nome"
                      maxLength={30}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Apenas letras minúsculas, números, hífen e underscore.
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="bio">Biografia</Label>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  placeholder="Conte um pouco sobre você..."
                  maxLength={500}
                  rows={4}
                />
                <p className="text-xs text-muted-foreground">
                  {bio.length}/500 caracteres
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Personal Data - Creators Only */}
        {isCreator && (
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Dados Pessoais
              </CardTitle>
              <CardDescription>
                Informações necessárias para receber pagamentos via Stripe Connect.
                Seus dados são protegidos e não serão compartilhados.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Nome Completo *</Label>
                <Input
                  id="fullName"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Seu nome completo (conforme documento)"
                  maxLength={100}
                />
                <p className="text-xs text-muted-foreground">
                  Conforme consta no seu documento de identidade.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cpf">CPF *</Label>
                <Input
                  id="cpf"
                  value={cpf}
                  onChange={(e) => setCpf(formatCPF(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                />
                <p className="text-xs text-muted-foreground">
                  Necessário para transferências bancárias.
                </p>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="phone">Telefone *</Label>
                <Input
                  id="phone"
                  value={phone}
                  onChange={(e) => setPhone(formatPhone(e.target.value))}
                  placeholder="(11) 99999-9999"
                  maxLength={15}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Address - Creators Only */}
        {isCreator && (
          <Card className="shadow-sm border-border bg-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Endereço
              </CardTitle>
              <CardDescription>
                Endereço cadastral para fins de pagamento.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 md:grid-cols-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="zipCode">CEP *</Label>
                <div className="relative">
                  <Input
                    id="zipCode"
                    value={zipCode}
                    onChange={(e) => setZipCode(formatCEP(e.target.value))}
                    onBlur={handleCepBlur}
                    placeholder="00000-000"
                    maxLength={9}
                  />
                  {loadingCep && (
                    <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
                  )}
                </div>
              </div>

              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="street">Rua *</Label>
                <Input
                  id="street"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  placeholder="Nome da rua"
                  maxLength={200}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="number">Número *</Label>
                <Input
                  id="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="123"
                  maxLength={20}
                />
              </div>

              <div className="space-y-2 md:col-span-4">
                <Label htmlFor="complement">Complemento</Label>
                <Input
                  id="complement"
                  value={complement}
                  onChange={(e) => setComplement(e.target.value)}
                  placeholder="Apartamento, bloco, etc."
                  maxLength={100}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="neighborhood">Bairro *</Label>
                <Input
                  id="neighborhood"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  placeholder="Nome do bairro"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2 md:col-span-3">
                <Label htmlFor="city">Cidade *</Label>
                <Input
                  id="city"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  placeholder="Nome da cidade"
                  maxLength={100}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="state">UF *</Label>
                <Input
                  id="state"
                  value={state}
                  onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
                  placeholder="SP"
                  maxLength={2}
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* Error and Success Messages */}
        {error && (
          <div className="flex items-center gap-2 text-sm text-destructive">
            <AlertCircle className="h-4 w-4" />
            {error}
          </div>
        )}

        {success && (
          <div className="flex items-center gap-2 text-sm text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            Perfil atualizado com sucesso!
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={saving}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Salvando...
            </>
          ) : (
            "Salvar Alterações"
          )}
        </Button>
      </form>

      {/* Account Info */}
      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle>Informações da Conta</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 text-sm">
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Tipo de conta</span>
            <span className="font-medium capitalize">
              {user?.userType === "creator" ? "Criador" : "Consumidor"}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Email verificado</span>
            <span className="font-medium flex items-center gap-2">
              {user?.emailVerified ? (
                <>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  Sim
                </>
              ) : (
                <>
                  <AlertCircle className="h-4 w-4 text-yellow-600" />
                  Não
                </>
              )}
            </span>
          </div>
          {isCreator && (
            <>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Stripe conectado</span>
                <span className="font-medium flex items-center gap-2">
                  {user?.stripeConnected ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Sim
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Não
                    </>
                  )}
                </span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Dados completos</span>
                <span className="font-medium flex items-center gap-2">
                  {hasCompleteCreatorData ? (
                    <>
                      <CheckCircle2 className="h-4 w-4 text-green-600" />
                      Sim
                    </>
                  ) : (
                    <>
                      <AlertCircle className="h-4 w-4 text-yellow-600" />
                      Pendente
                    </>
                  )}
                </span>
              </div>
            </>
          )}
          <div className="flex justify-between py-2 border-b border-border">
            <span className="text-muted-foreground">Data de nascimento</span>
            <span className="font-medium">
              {user?.birthDate
                ? new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(user.birthDate))
                : "-"}
            </span>
          </div>
          <div className="flex justify-between py-2">
            <span className="text-muted-foreground">Membro desde</span>
            <span className="font-medium">
              {user?.createdAt
                ? new Intl.DateTimeFormat("pt-BR", {
                    day: "2-digit",
                    month: "long",
                    year: "numeric",
                  }).format(new Date(user.createdAt))
                : "-"}
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Image Cropper Dialog */}
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
    </div>
  );
}
