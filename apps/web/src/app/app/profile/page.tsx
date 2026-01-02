"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { updateCreatorProfileSchema } from "@pack-do-pezin/shared";
import { AlertCircle, CheckCircle2, Loader2 } from "lucide-react";
import { formatCPF, formatPhone, formatCEP } from "@/utils/formatters";

import {
  AccountInfoCard,
  AddressCard,
  BasicInfoCard,
  EmailVerificationAlert,
  PersonalDataCard,
  ProfileImageUploader,
  ProfileSkeleton,
} from "./_components";

/**
 * Profile page for managing user information.
 * Creators have additional fields for personal data and address.
 */
export default function ProfilePage() {
  const { user, isLoading, setUser } = useAuthStore();

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

  // Form state
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isCreator = user?.userType === "creator";
  const hasCompleteCreatorData = isCreator && user?.fullName && user?.cpf && user?.phone && user?.address?.zipCode;

  // Initialize form with user data
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
        <EmailVerificationAlert
          email={user.email}
          onError={setError}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Avatar and Basic Info */}
        <div className="grid gap-6 lg:grid-cols-3">
          <ProfileImageUploader
            currentImage={user?.profileImage}
            displayName={user?.displayName}
            onImageUpdate={(imageUrl) => {
              if (user) {
                setUser({ ...user, profileImage: imageUrl });
              }
            }}
          />

          <BasicInfoCard
            email={user?.email || ""}
            emailVerified={user?.emailVerified || false}
            displayName={displayName}
            bio={bio}
            slug={slug}
            isCreator={isCreator}
            onDisplayNameChange={setDisplayName}
            onBioChange={setBio}
            onSlugChange={setSlug}
          />
        </div>

        {/* Personal Data - Creators Only */}
        {isCreator && (
          <PersonalDataCard
            fullName={fullName}
            cpf={cpf}
            phone={phone}
            onFullNameChange={setFullName}
            onCpfChange={setCpf}
            onPhoneChange={setPhone}
          />
        )}

        {/* Address - Creators Only */}
        {isCreator && (
          <AddressCard
            zipCode={zipCode}
            street={street}
            number={number}
            complement={complement}
            neighborhood={neighborhood}
            city={city}
            state={state}
            onZipCodeChange={setZipCode}
            onStreetChange={setStreet}
            onNumberChange={setNumber}
            onComplementChange={setComplement}
            onNeighborhoodChange={setNeighborhood}
            onCityChange={setCity}
            onStateChange={setState}
          />
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
      <AccountInfoCard
        userType={user?.userType || "consumer"}
        emailVerified={user?.emailVerified || false}
        stripeConnected={user?.stripeConnected}
        hasCompleteData={!!hasCompleteCreatorData}
        birthDate={user?.birthDate}
        createdAt={user?.createdAt}
      />
    </div>
  );
}
