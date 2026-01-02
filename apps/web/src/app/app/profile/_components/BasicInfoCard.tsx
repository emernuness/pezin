"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AlertCircle, CheckCircle2, User } from "lucide-react";

interface BasicInfoCardProps {
  email: string;
  emailVerified: boolean;
  displayName: string;
  bio: string;
  slug: string;
  isCreator: boolean;
  onDisplayNameChange: (value: string) => void;
  onBioChange: (value: string) => void;
  onSlugChange: (value: string) => void;
}

/**
 * Card for editing basic profile information.
 * Includes email (read-only), display name, slug (creators only), and bio.
 */
export function BasicInfoCard({
  email,
  emailVerified,
  displayName,
  bio,
  slug,
  isCreator,
  onDisplayNameChange,
  onBioChange,
  onSlugChange,
}: BasicInfoCardProps) {
  return (
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
              value={email}
              disabled
              className="bg-muted flex-1"
            />
            {emailVerified ? (
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
            onChange={(e) => onDisplayNameChange(e.target.value)}
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
                onChange={(e) => onSlugChange(e.target.value.toLowerCase().replace(/[^a-z0-9_-]/g, ""))}
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
            onChange={(e) => onBioChange(e.target.value)}
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
  );
}
