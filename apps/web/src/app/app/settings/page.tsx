"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { api } from "@/services/api";
import { useAuthStore } from "@/stores/auth.store";
import { changePasswordSchema } from "@pack-do-pezin/shared";
import { AlertCircle, CheckCircle2, KeyRound, Loader2, Settings } from "lucide-react";
import { useState } from "react";

function SettingsSkeleton() {
  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <Skeleton className="h-10 w-48" />
      <Skeleton className="h-64 rounded-2xl" />
    </div>
  );
}

export default function SettingsPage() {
  const { isLoading } = useAuthStore();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleChangePassword(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    const parsed = changePasswordSchema.safeParse({
      currentPassword,
      newPassword,
      confirmNewPassword,
    });

    if (!parsed.success) {
      setError(parsed.error.errors[0]?.message || "Dados inválidos");
      return;
    }

    setSaving(true);

    try {
      await api.post("/auth/change-password", {
        currentPassword,
        newPassword,
        confirmNewPassword,
      });
      setSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmNewPassword("");
      setTimeout(() => setSuccess(false), 5000);
    } catch (err: any) {
      setError(err.response?.data?.message || "Erro ao alterar senha");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) return <SettingsSkeleton />;

  return (
    <div className="flex-1 p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          Configurações
        </h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua conta.
        </p>
      </div>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5" />
            Alterar Senha
          </CardTitle>
          <CardDescription>
            Mantenha sua conta segura atualizando sua senha regularmente.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleChangePassword} className="space-y-6 max-w-md">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Senha atual</Label>
              <Input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Digite sua senha atual"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">Nova senha</Label>
              <Input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Digite a nova senha"
              />
              <p className="text-xs text-muted-foreground">
                Mínimo 8 caracteres, com letra maiúscula, minúscula e número.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmNewPassword">Confirmar nova senha</Label>
              <Input
                id="confirmNewPassword"
                type="password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                placeholder="Confirme a nova senha"
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-sm text-destructive">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="flex items-center gap-2 text-sm text-green-600">
                <CheckCircle2 className="h-4 w-4" />
                Senha alterada com sucesso!
              </div>
            )}

            <Button
              type="submit"
              disabled={saving}
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              {saving ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Alterando...
                </>
              ) : (
                "Alterar Senha"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-border bg-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Outras Configurações
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>
            Mais opções de configuração estarão disponíveis em breve, incluindo:
          </p>
          <ul className="list-disc list-inside mt-4 space-y-2">
            <li>Preferências de notificação</li>
            <li>Configurações de privacidade</li>
            <li>Tema da interface</li>
            <li>Exportação de dados</li>
          </ul>
        </CardContent>
      </Card>

      <Card className="shadow-sm border-destructive/50 bg-destructive/5">
        <CardHeader>
          <CardTitle className="text-destructive">Zona de Perigo</CardTitle>
          <CardDescription>
            Ações irreversíveis para sua conta.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" disabled>
            Excluir Conta (Em breve)
          </Button>
          <p className="text-xs text-muted-foreground mt-2">
            A exclusão da conta será permanente e todos os seus dados serão removidos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
