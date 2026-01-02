import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { SchemaOrg } from "@/components/marketing/SchemaOrg";
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
  title: "Pack do Pezin — Venda seus Packs de Conteudo | Cadastro Gratuito",
  description:
    "Monetize seu conteudo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs. Comece a vender em minutos.",
  keywords:
    "vender packs, monetizar conteudo, plataforma criadores, venda de fotos, venda de videos",
  metadataBase: new URL("https://packdopezin.com.br"),
  alternates: {
    canonical: "https://packdopezin.com.br/",
  },
  openGraph: {
    title: "Pack do Pezin — Venda seus Packs de Conteudo | Cadastro Gratuito",
    description:
      "Monetize seu conteudo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs.",
    url: "https://packdopezin.com.br/",
    type: "website",
    siteName: "Pack do Pezin",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pack do Pezin - Venda seus Packs de Conteudo",
      },
    ],
  },
  twitter: {
    title: "Pack do Pezin — Venda seus Packs de Conteudo | Cadastro Gratuito",
    description:
      "Monetize seu conteudo com o Pack do Pezin. Cadastro gratuito, pagamentos seguros via Stripe, controle total sobre seus packs.",
    card: "summary_large_image",
    images: ["/twitter-image.jpg"],
  },
};

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A]">
      <SchemaOrg />
      <MarketingHeader />
      <main className="flex-1">
        <Hero />
        <HowItWorks />
        <Benefits />
        <Features />
        <Security />
        <Testimonials />
        <CTASection
          title="Pronto para comecar a vender?"
          subtitle="Cadastro gratuito, sem cartao de credito, sem compromisso. Crie sua conta em menos de 2 minutos."
          primaryCTA={{ text: "Criar Conta Gratis", href: "/app/signup" }}
          secondaryCTA={{
            text: "Ainda tem duvidas? Veja o FAQ",
            href: "/perguntas-frequentes",
          }}
        />
      </main>
      <MarketingFooter />
    </div>
  );
}
