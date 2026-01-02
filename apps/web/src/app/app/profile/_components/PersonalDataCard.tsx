"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { FileText } from "lucide-react";
import { formatCPF, formatPhone } from "@/utils/formatters";

interface PersonalDataCardProps {
  fullName: string;
  cpf: string;
  phone: string;
  onFullNameChange: (value: string) => void;
  onCpfChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

/**
 * Card for editing personal data (creators only).
 * Includes full name, CPF, and phone number fields.
 */
export function PersonalDataCard({
  fullName,
  cpf,
  phone,
  onFullNameChange,
  onCpfChange,
  onPhoneChange,
}: PersonalDataCardProps) {
  return (
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
            onChange={(e) => onFullNameChange(e.target.value)}
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
            onChange={(e) => onCpfChange(formatCPF(e.target.value))}
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
            onChange={(e) => onPhoneChange(formatPhone(e.target.value))}
            placeholder="(11) 99999-9999"
            maxLength={15}
          />
        </div>
      </CardContent>
    </Card>
  );
}
