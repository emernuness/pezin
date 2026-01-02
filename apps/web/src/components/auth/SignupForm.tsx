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
import { signUpSchema } from "@pack-do-pezin/shared";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Eye,
  EyeOff,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

type UserType = "creator" | "consumer";

interface FormData {
  userType: UserType;
  email: string;
  password: string;
  confirmPassword: string;
  birthDate: string;
  displayName: string;
  acceptTerms: boolean;
}

const TOTAL_STEPS = 4;

export function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<FormData>({
    userType: "consumer",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    displayName: "",
    acceptTerms: false,
  });

  const updateField = <K extends keyof FormData>(
    field: K,
    value: FormData[K]
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    setFieldErrors((prev) => ({ ...prev, [field]: "" }));
    setError("");
  };

  const validateStep = (): boolean => {
    const errors: Record<string, string> = {};

    if (currentStep === 2) {
      if (!formData.email) {
        errors.email = "Email obrigatório";
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        errors.email = "Email inválido";
      }

      if (!formData.password) {
        errors.password = "Senha obrigatória";
      } else if (formData.password.length < 8) {
        errors.password = "Mínimo 8 caracteres";
      } else if (!/[A-Z]/.test(formData.password)) {
        errors.password = "Deve conter letra maiúscula";
      } else if (!/[a-z]/.test(formData.password)) {
        errors.password = "Deve conter letra minúscula";
      } else if (!/[0-9]/.test(formData.password)) {
        errors.password = "Deve conter número";
      }

      if (!formData.confirmPassword) {
        errors.confirmPassword = "Confirme sua senha";
      } else if (formData.password !== formData.confirmPassword) {
        errors.confirmPassword = "As senhas não conferem";
      }
    }

    if (currentStep === 3) {
      if (!formData.birthDate) {
        errors.birthDate = "Data de nascimento obrigatória";
      } else {
        const age = Math.floor(
          (Date.now() - new Date(formData.birthDate).getTime()) / 31557600000
        );
        if (age < 18) {
          errors.birthDate = "Você deve ter 18 anos ou mais";
        }
      }

      if (formData.userType === "creator") {
        if (!formData.displayName) {
          errors.displayName = "Nome artístico obrigatório";
        } else if (formData.displayName.length < 3) {
          errors.displayName = "Mínimo 3 caracteres";
        } else if (formData.displayName.length > 50) {
          errors.displayName = "Máximo 50 caracteres";
        }
      }
    }

    if (currentStep === 4) {
      if (!formData.acceptTerms) {
        errors.acceptTerms = "Você deve aceitar os termos";
      }
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = () => {
    if (validateStep()) {
      setCurrentStep((prev) => Math.min(prev + 1, TOTAL_STEPS));
    }
  };

  const handleBack = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    setError("");
    setFieldErrors({});
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;

    setError("");
    setLoading(true);

    try {
      const result = signUpSchema.safeParse(formData);
      if (!result.success) {
        const firstError = result.error.errors[0];
        setError(firstError.message);
        setLoading(false);
        return;
      }

      await api.post("/auth/signup", formData);
      router.push("/app/login?registered=true");
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

  const getStepTitle = () => {
    switch (currentStep) {
      case 1:
        return "O que você quer fazer?";
      case 2:
        return "Dados da conta";
      case 3:
        return formData.userType === "creator"
          ? "Seu perfil"
          : "Verificação de idade";
      case 4:
        return "Quase lá!";
      default:
        return "";
    }
  };

  const getStepDescription = () => {
    switch (currentStep) {
      case 1:
        return "Escolha como você quer usar a plataforma";
      case 2:
        return "Crie suas credenciais de acesso";
      case 3:
        return formData.userType === "creator"
          ? "Configure seu perfil de criador"
          : "Confirme que você é maior de idade";
      case 4:
        return "Revise e aceite os termos";
      default:
        return "";
    }
  };

  return (
    <Card className="border shadow-lg">
      <CardHeader className="text-center">
        {/* Step Indicator */}
        <div className="mb-4 flex items-center justify-center gap-2">
          {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
            <div
              key={i}
              className={cn(
                "h-2 w-8 rounded-full transition-colors",
                i + 1 <= currentStep ? "bg-primary" : "bg-muted"
              )}
            />
          ))}
        </div>
        <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Step 1: User Type Selection */}
        {currentStep === 1 && (
          <div className="grid grid-cols-2 gap-4">
            <button
              type="button"
              onClick={() => updateField("userType", "consumer")}
              className={cn(
                "flex flex-col items-center rounded-xl border-2 p-6 transition-all",
                formData.userType === "consumer"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <ShoppingBag
                className={cn(
                  "mb-3 h-10 w-10",
                  formData.userType === "consumer"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              <span className="font-semibold">Quero Comprar</span>
              <span className="mt-1 text-center text-xs text-muted-foreground">
                Acesse packs exclusivos
              </span>
            </button>

            <button
              type="button"
              onClick={() => updateField("userType", "creator")}
              className={cn(
                "flex flex-col items-center rounded-xl border-2 p-6 transition-all",
                formData.userType === "creator"
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              )}
            >
              <Sparkles
                className={cn(
                  "mb-3 h-10 w-10",
                  formData.userType === "creator"
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              />
              <span className="font-semibold">Quero Vender</span>
              <span className="mt-1 text-center text-xs text-muted-foreground">
                Monetize seu conteúdo
              </span>
            </button>
          </div>
        )}

        {/* Step 2: Email & Password */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => updateField("email", e.target.value)}
                placeholder="seu@email.com"
                autoComplete="email"
                className={cn(fieldErrors.email && "border-destructive")}
              />
              {fieldErrors.email && (
                <p className="text-sm text-destructive">{fieldErrors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={formData.password}
                  onChange={(e) => updateField("password", e.target.value)}
                  placeholder="Min. 8 caracteres"
                  autoComplete="new-password"
                  className={cn(
                    "pr-10",
                    fieldErrors.password && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.password ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.password}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Letras maiúsculas, minúsculas e números
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar senha</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={formData.confirmPassword}
                  onChange={(e) =>
                    updateField("confirmPassword", e.target.value)
                  }
                  placeholder="Digite a senha novamente"
                  autoComplete="new-password"
                  className={cn(
                    "pr-10",
                    fieldErrors.confirmPassword && "border-destructive"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {fieldErrors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {fieldErrors.confirmPassword}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Birth Date & Display Name (for creators) */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="birthDate">Data de nascimento</Label>
              <Input
                id="birthDate"
                type="date"
                value={formData.birthDate}
                onChange={(e) => updateField("birthDate", e.target.value)}
                className={cn(fieldErrors.birthDate && "border-destructive")}
              />
              {fieldErrors.birthDate ? (
                <p className="text-sm text-destructive">
                  {fieldErrors.birthDate}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Você deve ter 18 anos ou mais
                </p>
              )}
            </div>

            {formData.userType === "creator" && (
              <div className="space-y-2">
                <Label htmlFor="displayName">Nome artístico</Label>
                <Input
                  id="displayName"
                  type="text"
                  value={formData.displayName}
                  onChange={(e) => updateField("displayName", e.target.value)}
                  placeholder="Como você quer ser chamado(a)"
                  className={cn(
                    fieldErrors.displayName && "border-destructive"
                  )}
                />
                {fieldErrors.displayName ? (
                  <p className="text-sm text-destructive">
                    {fieldErrors.displayName}
                  </p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Este nome será exibido para seus compradores
                  </p>
                )}
              </div>
            )}
          </div>
        )}

        {/* Step 4: Terms & Submit */}
        {currentStep === 4 && (
          <div className="space-y-6">
            {/* Summary */}
            <div className="space-y-3 rounded-xl border bg-muted/50 p-4">
              <h4 className="font-medium">Resumo do cadastro</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tipo de conta</span>
                  <span>
                    {formData.userType === "creator" ? "Criador" : "Comprador"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Email</span>
                  <span>{formData.email}</span>
                </div>
                {formData.userType === "creator" && formData.displayName && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Nome artístico</span>
                    <span>{formData.displayName}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="acceptTerms"
                checked={formData.acceptTerms}
                onCheckedChange={(checked) =>
                  updateField("acceptTerms", checked === true)
                }
                className="mt-0.5"
              />
              <Label
                htmlFor="acceptTerms"
                className="cursor-pointer text-sm font-normal leading-relaxed"
              >
                Declaro que tenho 18+ anos, aceito os{" "}
                <Link
                  href="/termos"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Termos de Uso
                </Link>{" "}
                e a{" "}
                <Link
                  href="/privacidade"
                  className="text-primary hover:underline"
                  target="_blank"
                >
                  Política de Privacidade
                </Link>
              </Label>
            </div>
            {fieldErrors.acceptTerms && (
              <p className="text-sm text-destructive">
                {fieldErrors.acceptTerms}
              </p>
            )}
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
            className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive"
            role="alert"
          >
            {error}
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="flex gap-3">
          {currentStep > 1 && (
            <Button
              type="button"
              variant="outline"
              onClick={handleBack}
              disabled={loading}
              className="flex-1"
            >
              <ArrowLeft className="mr-2 h-4 w-4" />
              Voltar
            </Button>
          )}

          {currentStep < TOTAL_STEPS ? (
            <Button type="button" onClick={handleNext} className="flex-1">
              Continuar
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={loading || !formData.acceptTerms}
              className="flex-1"
            >
              {loading ? (
                "Criando conta..."
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Criar conta
                </>
              )}
            </Button>
          )}
        </div>
      </CardContent>

      <CardFooter className="justify-center">
        <div className="text-sm text-muted-foreground">
          Já tem uma conta?{" "}
          <Link
            href="/app/login"
            className="font-medium text-foreground hover:underline"
          >
            Faça login
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
