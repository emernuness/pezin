"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, MapPin } from "lucide-react";
import { formatCEP } from "@/utils/formatters";

interface AddressCardProps {
  zipCode: string;
  street: string;
  number: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  onZipCodeChange: (value: string) => void;
  onStreetChange: (value: string) => void;
  onNumberChange: (value: string) => void;
  onComplementChange: (value: string) => void;
  onNeighborhoodChange: (value: string) => void;
  onCityChange: (value: string) => void;
  onStateChange: (value: string) => void;
}

/**
 * Card for editing address (creators only).
 * Includes CEP auto-fill via ViaCEP API.
 */
export function AddressCard({
  zipCode,
  street,
  number,
  complement,
  neighborhood,
  city,
  state,
  onZipCodeChange,
  onStreetChange,
  onNumberChange,
  onComplementChange,
  onNeighborhoodChange,
  onCityChange,
  onStateChange,
}: AddressCardProps) {
  const [loadingCep, setLoadingCep] = useState(false);

  async function handleCepBlur() {
    const cleanedCep = zipCode.replace(/\D/g, "");
    if (cleanedCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanedCep}/json/`);
      const data = await response.json();

      if (!data.erro) {
        onStreetChange(data.logradouro || "");
        onNeighborhoodChange(data.bairro || "");
        onCityChange(data.localidade || "");
        onStateChange(data.uf || "");
      }
    } catch {
      // Silently fail - user can fill manually
    } finally {
      setLoadingCep(false);
    }
  }

  return (
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
              onChange={(e) => onZipCodeChange(formatCEP(e.target.value))}
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
            onChange={(e) => onStreetChange(e.target.value)}
            placeholder="Nome da rua"
            maxLength={200}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="number">Número *</Label>
          <Input
            id="number"
            value={number}
            onChange={(e) => onNumberChange(e.target.value)}
            placeholder="123"
            maxLength={20}
          />
        </div>

        <div className="space-y-2 md:col-span-4">
          <Label htmlFor="complement">Complemento</Label>
          <Input
            id="complement"
            value={complement}
            onChange={(e) => onComplementChange(e.target.value)}
            placeholder="Apartamento, bloco, etc."
            maxLength={100}
          />
        </div>

        <div className="space-y-2 md:col-span-2">
          <Label htmlFor="neighborhood">Bairro *</Label>
          <Input
            id="neighborhood"
            value={neighborhood}
            onChange={(e) => onNeighborhoodChange(e.target.value)}
            placeholder="Nome do bairro"
            maxLength={100}
          />
        </div>

        <div className="space-y-2 md:col-span-3">
          <Label htmlFor="city">Cidade *</Label>
          <Input
            id="city"
            value={city}
            onChange={(e) => onCityChange(e.target.value)}
            placeholder="Nome da cidade"
            maxLength={100}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="state">UF *</Label>
          <Input
            id="state"
            value={state}
            onChange={(e) => onStateChange(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="SP"
            maxLength={2}
          />
        </div>
      </CardContent>
    </Card>
  );
}
