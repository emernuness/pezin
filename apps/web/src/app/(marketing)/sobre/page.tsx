import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { SobreContent } from "@/components/marketing/SobreContent";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sobre o Pack do Pezin — Plataforma para Criadores de Conteúdo",
  description:
    "Conheça o Pack do Pezin, a plataforma criada para criadores monetizarem seu conteúdo com simplicidade, segurança e profissionalismo. Cadastro 100% gratuito.",
  alternates: {
    canonical: "https://packdopezin.com.br/sobre",
  },
  openGraph: {
    title: "Sobre o Pack do Pezin — Plataforma para Criadores de Conteúdo",
    description:
      "Conheça o Pack do Pezin, a plataforma criada para criadores monetizarem seu conteúdo com simplicidade, segurança e profissionalismo.",
    url: "https://packdopezin.com.br/sobre",
  },
  twitter: {
    title: "Sobre o Pack do Pezin — Plataforma para Criadores de Conteúdo",
    description:
      "Conheça o Pack do Pezin, a plataforma criada para criadores monetizarem seu conteúdo com simplicidade, segurança e profissionalismo.",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://packdopezin.com.br" },
  { name: "Sobre", url: "https://packdopezin.com.br/sobre" },
];

export default function SobrePage() {
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <SobreContent />
    </>
  );
}