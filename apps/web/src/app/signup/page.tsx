"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { api } from "@/services/api";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function SignupPage() {
  const router = useRouter();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    birthDate: "",
    userType: "consumer" as "creator" | "consumer",
    acceptTerms: false,
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/auth/signup", formData);
      router.push("/login");
    } catch (err) {
      const errorData = (
        err as {
          response?: {
            data?: { errors?: { message: string }[]; message?: string };
          };
        }
      ).response?.data;
      const errorMessage =
        errorData?.errors?.[0]?.message ||
        errorData?.message ||
        "Erro ao criar conta. Tente novamente.";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getDescription = () => {
    return formData.userType === "creator"
      ? "Crie sua conta e comece a monetizar seu conteúdo"
      : "Crie sua conta e acesse conteúdos exclusivos";
  };

  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Criar conta</CardTitle>
          <CardDescription>{getDescription()}</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Radio Cards - Tipo de conta */}
            <div className="space-y-2">
              <Label>O que você quer fazer?</Label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, userType: "consumer" })
                  }
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    formData.userType === "consumer"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <ShoppingBag
                    className={cn(
                      "h-8 w-8 mb-2",
                      formData.userType === "consumer"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="font-semibold text-foreground">
                    Quero Comprar
                  </span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    Acesse packs exclusivos
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setFormData({ ...formData, userType: "creator" })
                  }
                  className={cn(
                    "flex flex-col items-center p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                    formData.userType === "creator"
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/50",
                  )}
                >
                  <Sparkles
                    className={cn(
                      "h-8 w-8 mb-2",
                      formData.userType === "creator"
                        ? "text-foreground"
                        : "text-muted-foreground",
                    )}
                  />
                  <span className="font-semibold text-foreground">
                    Quero Vender
                  </span>
                  <span className="text-xs text-muted-foreground text-center mt-1">
                    Monetize seu conteúdo
                  </span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                required
                placeholder="seu@email.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
                required
                placeholder="Mín. 8 caracteres"
              />
              <p className="text-xs text-muted-foreground">
                Deve conter letras maiúsculas, minúsculas e números
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de Nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) =>
                  setFormData({ ...formData, birthDate: e.target.value })
                }
                required
              />
              <p className="text-xs text-muted-foreground">
                Você deve ter 18 anos ou mais
              </p>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, acceptTerms: checked === true })
                }
              />
              <Label
                htmlFor="acceptTerms"
                className="font-normal cursor-pointer text-sm leading-relaxed"
              >
                Declaro que tenho 18+ anos e aceito os termos de uso
              </Label>
            </div>

            {error && (
              <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
                {error}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? "Criando conta..." : "Criar conta"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center">
          <div className="text-sm text-muted-foreground">
            Já tem uma conta?{" "}
            <Link
              href="/login"
              className="text-foreground hover:underline hover:decoration-primary font-medium"
            >
              Faça login
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
