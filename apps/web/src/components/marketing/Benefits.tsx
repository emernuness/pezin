"use client";

import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

const benefits = [
  {
    title: "Comece sem investir nada",
    subtitle: "Cadastro gratuito",
    description:
      "Criar conta e cadastrar packs é 100% gratuito. Você só paga quando vende.",
  },
  {
    title: "Stripe, o padrão mundial",
    subtitle: "Pagamentos seguros",
    description:
      "Pagamentos processados pelo Stripe, usado por milhões de empresas no mundo.",
  },
  {
    title: "Saldo liberado em dias",
    subtitle: "Receba rápido",
    description:
      "Acompanhe seus ganhos e solicite saque quando quiser.",
  },
  {
    title: "Seus preços, suas regras",
    subtitle: "Controle total",
    description:
      "Defina valores, edite packs, gerencie tudo do seu jeito.",
  },
  {
    title: "Impressione seus fãs",
    subtitle: "Interface profissional",
    description: "Vitrine elegante e página de compra que converte.",
  },
  {
    title: "Seu conteúdo protegido",
    subtitle: "Privacidade",
    description:
      "Links tokenizados, acesso controlado, segurança em primeiro lugar.",
  },
];

export function Benefits() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(".benefit-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("Criar minha conta grátis", "benefits", "/");
  };

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] py-20 md:py-28">
      <Container>
        <SectionHeader
          title="Por que criadores escolhem o Pack do Pezin"
          subtitle="Tudo o que você precisa para monetizar seu conteúdo em um só lugar."
        />

        <div
          ref={gridRef}
          className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
        >
          {benefits.map((benefit) => (
            <div
              key={benefit.title}
              className="benefit-card group rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 transition-all hover:-translate-y-1 hover:border-[#D4FF00]/30"
            >
              <p className="mb-1 text-sm font-medium text-[#D4FF00]">
                {benefit.subtitle}
              </p>
              <h3 className="mb-3 text-xl font-semibold text-white">
                {benefit.title}
              </h3>
              <p className="text-sm text-[#A1A1A1]">{benefit.description}</p>
            </div>
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
            onClick={handleCTAClick}
          >
            <Link href="/signup">Criar minha conta grátis</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}