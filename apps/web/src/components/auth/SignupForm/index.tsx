"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { api } from "@/services/api";
import { signUpSchema } from "@pack-do-pezin/shared";
import { ArrowLeft, ArrowRight, Check } from "lucide-react";
import Link from "next/link";

import { StepIndicator } from "./StepIndicator";
import { StepUserType } from "./StepUserType";
import { StepCredentials } from "./StepCredentials";
import { StepBirthDate } from "./StepBirthDate";
import { StepTerms } from "./StepTerms";
import { type SignupFormData, TOTAL_STEPS } from "./types";

/**
 * Multi-step signup form.
 * Supports both creator and consumer account types.
 */
export function SignupForm() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState<SignupFormData>({
    userType: "consumer",
    email: "",
    password: "",
    confirmPassword: "",
    birthDate: "",
    displayName: "",
    acceptTerms: false,
  });

  const updateField = <K extends keyof SignupFormData>(
    field: K,
    value: SignupFormData[K]
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

  const stepProps = { formData, updateField, fieldErrors };

  return (
    <Card className="border shadow-lg">
      <CardHeader className="text-center">
        <StepIndicator currentStep={currentStep} />
        <CardTitle className="text-2xl font-bold">{getStepTitle()}</CardTitle>
        <CardDescription>{getStepDescription()}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {currentStep === 1 && <StepUserType {...stepProps} />}
        {currentStep === 2 && <StepCredentials {...stepProps} />}
        {currentStep === 3 && <StepBirthDate {...stepProps} />}
        {currentStep === 4 && <StepTerms {...stepProps} />}

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
