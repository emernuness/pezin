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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/stores/auth.store";
import { ShoppingBag, Sparkles } from "lucide-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const login = useAuthStore((state) => state.login);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [intent, setIntent] = useState<"buy" | "sell">("buy");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const loggedUser = await login(email, password);

      // Check for returnUrl, otherwise redirect based on user type + intent
      const returnUrl = searchParams.get("returnUrl");
      if (returnUrl) {
        router.push(decodeURIComponent(returnUrl));
      } else if (loggedUser?.userType === "creator") {
        // Criadores sempre vão pro dashboard
        router.push("/dashboard");
      } else if (intent === "sell") {
        // Consumidor com intent de vender - vai pro dashboard e verá bloqueio
        router.push("/dashboard");
      } else {
        // Consumidor com intent de comprar - vai pra home
        router.push("/");
      }
    } catch (err) {
      const message =
        (err as { response?: { data?: { message?: string } } }).response?.data
          ?.message || "Erro ao fazer login. Tente novamente.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const getDescription = () => {
    return intent === "sell"
      ? "Acesse sua conta de criador"
      : "Acesse sua conta para comprar packs";
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader className="text-center">
        <CardTitle className="text-2xl font-bold">Entrar</CardTitle>
        <CardDescription>{getDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Radio Cards - Intent */}
          <div className="space-y-2">
            <Label>O que você quer fazer?</Label>
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setIntent("buy")}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  intent === "buy"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
              >
                <ShoppingBag
                  className={cn(
                    "h-8 w-8 mb-2",
                    intent === "buy" ? "text-primary" : "text-muted-foreground",
                  )}
                />
                <span className="font-semibold text-foreground">
                  Quero Comprar
                </span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  Acessar packs
                </span>
              </button>

              <button
                type="button"
                onClick={() => setIntent("sell")}
                className={cn(
                  "flex flex-col items-center p-4 rounded-lg border-2 transition-all focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  intent === "sell"
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50",
                )}
              >
                <Sparkles
                  className={cn(
                    "h-8 w-8 mb-2",
                    intent === "sell"
                      ? "text-primary"
                      : "text-muted-foreground",
                  )}
                />
                <span className="font-semibold text-foreground">
                  Quero Vender
                </span>
                <span className="text-xs text-muted-foreground text-center mt-1">
                  Acessar dashboard
                </span>
              </button>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="seu@email.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Senha</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />
          </div>

          {error && (
            <div className="p-3 text-sm text-destructive bg-destructive/10 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? "Entrando..." : "Entrar"}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="justify-center">
        <div className="text-sm text-muted-foreground">
          Não tem uma conta?{" "}
          <Link
            href="/signup"
            className="text-primary hover:underline font-medium"
          >
            Cadastre-se
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center p-4 bg-muted">
      <Suspense fallback={<div className="text-center">Carregando...</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
