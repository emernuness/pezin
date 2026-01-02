import {
  Benefits,
  CTASection,
  Features,
  Hero,
  HowItWorks,
  Security,
  Testimonials,
} from "@/components/marketing";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Pack do Pezin — Venda seus Packs de Conteúdo | Cadastro Gratuito",
  description:
    "Monetize seu conteúdo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs. Comece a vender em minutos.",
  keywords:
    "vender packs, monetizar conteúdo, plataforma criadores, venda de fotos, venda de vídeos",
  alternates: {
    canonical: "https://packdopezin.com.br/",
  },
  openGraph: {
    title: "Pack do Pezin — Venda seus Packs de Conteúdo | Cadastro Gratuito",
    description:
      "Monetize seu conteúdo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs.",
    url: "https://packdopezin.com.br/",
  },
  twitter: {
    title: "Pack do Pezin — Venda seus Packs de Conteúdo | Cadastro Gratuito",
    description:
      "Monetize seu conteúdo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs.",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <HowItWorks />
      <Benefits />
      <Features />
      <Security />
      <Testimonials />
      <CTASection
        title="Pronto para começar a vender?"
        subtitle="Cadastro gratuito, sem cartão de crédito, sem compromisso. Crie sua conta em menos de 2 minutos."
        primaryCTA={{ text: "Criar conta grátis", href: "/app/signup" }}
        secondaryCTA={{
          text: "Ainda tem dúvidas? Veja o FAQ",
          href: "/perguntas-frequentes",
        }}
      />
    </>
  );
}