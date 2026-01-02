"use client";

import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

const steps = [
  {
    number: 1,
    title: "Crie sua conta",
    description: "Cadastro rápido e gratuito. Sem cartão de crédito.",
  },
  {
    number: 2,
    title: "Cadastre seus conteúdos",
    description: "Faça upload de suas fotos e vídeos em packs organizados.",
  },
  {
    number: 3,
    title: "Defina o valor",
    description: "Você escolhe quanto cobrar. De R$ 9,90 a R$ 500,00.",
  },
  {
    number: 4,
    title: "Compartilhe o link com seus fãs",
    description: "Divulgue nas suas redes e comece a vender.",
  },
];

export function HowItWorks() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {
      const stepElements = stepsRef.current?.querySelectorAll(".step-card");
      if (!stepElements) return;

      gsap.fromTo(
        stepElements,
        { opacity: 0, y: 40 },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: stepsRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("Começar agora - É grátis", "how_it_works", "/");
  };

  return (
    <section
      ref={sectionRef}
      id="como-funciona"
      className="bg-[#141414] py-20 md:py-28"
    >
      <Container>
        <SectionHeader
          title="Veja como é fácil vender seus packs"
          subtitle="Em poucos minutos você está pronto para receber suas primeiras vendas."
        />

        <div ref={stepsRef} className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step) => (
            <div
              key={step.number}
              className="step-card rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] p-6 transition-transform hover:-translate-y-1"
            >
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-[#D4FF00] text-xl font-bold text-[#0A0A0A]">
                {step.number}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-white">
                {step.title}
              </h3>
              <p className="text-sm text-[#A1A1A1]">{step.description}</p>
            </div>
          ))}
        </div>

        <p className="mt-12 text-center text-lg text-[#A1A1A1]">
          O valor cai em sua Carteira Pezin.
        </p>

        <div className="mt-8 text-center">
          <Button
            size="lg"
            asChild
            className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
            onClick={handleCTAClick}
          >
            <Link href="/app/signup">Começar agora — É grátis</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}