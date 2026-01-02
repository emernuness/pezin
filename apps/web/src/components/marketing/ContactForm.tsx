"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { trackContactError, trackContactSubmit } from "@/lib/analytics";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  subject: string;
  message: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  subject?: string;
  message?: string;
}

const subjects = [
  { value: "duvida", label: "Dúvida" },
  { value: "suporte", label: "Suporte Técnico" },
  { value: "sugestao", label: "Sugestão" },
  { value: "outro", label: "Outro" },
];

export function ContactForm() {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    subject: "",
    message: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">(
    "idle"
  );

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    if (!formData.name.trim()) {
      newErrors.name = "Nome é obrigatório";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Email é obrigatório";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email inválido";
    }

    if (!formData.subject) {
      newErrors.subject = "Selecione um assunto";
    }

    if (!formData.message.trim()) {
      newErrors.message = "Mensagem é obrigatória";
    } else if (formData.message.trim().length < 20) {
      newErrors.message = "Mensagem deve ter pelo menos 20 caracteres";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      trackContactError("validation_failed");
      return;
    }

    setIsSubmitting(true);

    try {
      // TODO: Implement API call when backend is ready
      // await fetch('/api/contact', { method: 'POST', body: JSON.stringify(formData) });

      // Simulating API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setSubmitStatus("success");
      trackContactSubmit(formData.subject);
      setFormData({ name: "", email: "", subject: "", message: "" });
    } catch {
      setSubmitStatus("error");
      trackContactError("api_error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (submitStatus === "success") {
    return (
      <div className="rounded-2xl border border-[#D4FF00]/30 bg-[#141414] p-8 text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#D4FF00]/10">
          <svg
            className="h-8 w-8 text-[#D4FF00]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-white">
          Mensagem enviada com sucesso
        </h3>
        <p className="mt-2 text-[#A1A1A1]">
          Responderemos em até 24 horas úteis.
        </p>
        <Button
          className="mt-6 bg-[#D4FF00] text-[#0A0A0A] hover:bg-[#BFFF00]"
          onClick={() => setSubmitStatus("idle")}
        >
          Enviar outra mensagem
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 md:p-8"
    >
      {submitStatus === "error" && (
        <div className="mb-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-center">
          <p className="text-red-400">
            Ocorreu um erro. Tente novamente ou envie email para
            contato@packdopezin.com
          </p>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <Label htmlFor="name" className="text-white">
            Nome
          </Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleChange("name", e.target.value)}
            className={cn(
              "mt-2 border-[#2A2A2A] bg-[#0A0A0A] text-white placeholder:text-[#A1A1A1]",
              errors.name && "border-red-500"
            )}
            placeholder="Seu nome"
          />
          {errors.name && (
            <p className="mt-1 text-sm text-red-400">{errors.name}</p>
          )}
        </div>

        <div>
          <Label htmlFor="email" className="text-white">
            Email
          </Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleChange("email", e.target.value)}
            className={cn(
              "mt-2 border-[#2A2A2A] bg-[#0A0A0A] text-white placeholder:text-[#A1A1A1]",
              errors.email && "border-red-500"
            )}
            placeholder="seu@email.com"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-400">{errors.email}</p>
          )}
        </div>

        <div>
          <Label htmlFor="subject" className="text-white">
            Assunto
          </Label>
          <Select
            value={formData.subject}
            onValueChange={(value) => handleChange("subject", value)}
          >
            <SelectTrigger
              id="subject"
              className={cn(
                "mt-2 border-[#2A2A2A] bg-[#0A0A0A] text-white",
                errors.subject && "border-red-500",
                !formData.subject && "text-[#A1A1A1]"
              )}
            >
              <SelectValue placeholder="Selecione um assunto" />
            </SelectTrigger>
            <SelectContent className="border-[#2A2A2A] bg-[#141414]">
              {subjects.map((subject) => (
                <SelectItem
                  key={subject.value}
                  value={subject.value}
                  className="text-white focus:bg-[#2A2A2A] focus:text-white"
                >
                  {subject.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.subject && (
            <p className="mt-1 text-sm text-red-400">{errors.subject}</p>
          )}
        </div>

        <div>
          <Label htmlFor="message" className="text-white">
            Mensagem
          </Label>
          <textarea
            id="message"
            value={formData.message}
            onChange={(e) => handleChange("message", e.target.value)}
            rows={5}
            className={cn(
              "mt-2 w-full rounded-md border border-[#2A2A2A] bg-[#0A0A0A] px-3 py-2 text-white placeholder:text-[#A1A1A1] focus:border-[#D4FF00] focus:outline-none focus:ring-1 focus:ring-[#D4FF00]",
              errors.message && "border-red-500"
            )}
            placeholder="Descreva sua dúvida ou mensagem..."
          />
          {errors.message && (
            <p className="mt-1 text-sm text-red-400">{errors.message}</p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          disabled={isSubmitting}
          className="w-full bg-[#D4FF00] text-[#0A0A0A] hover:bg-[#BFFF00] disabled:opacity-50"
        >
          {isSubmitting ? "Enviando..." : "Enviar mensagem"}
        </Button>
      </div>
    </form>
  );
}