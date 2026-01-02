"use client";

import { Button } from "@/components/ui/button";
import { Container, CTASection, SectionHeader } from "@/components/marketing";
import { MiniHero } from "@/components/marketing/MiniHero";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";

const values = [
  {
    title: "Simplicidade",
    description:
      "Tecnologia deve facilitar, não complicar. Cada clique foi pensado.",
  },
  {
    title: "Transparência",
    description:
      "Sem taxas ocultas, sem surpresas. Você sabe exatamente o que esperar.",
  },
  {
    title: "Respeito",
    description: "Seu conteúdo, suas regras. Você está no comando.",
  },
  {
    title: "Segurança",
    description: "Privacidade e proteção são inegociáveis.",
  },
];

const forCreators = [
  "Vender packs de fotos e vídeos sem complicação",
  "Ter controle total sobre preços e conteúdo",
  "Receber pagamentos de forma segura e rápida",
  "Uma plataforma profissional que valoriza seu trabalho",
];

const notForCreators = [
  "Pagar taxas só para criar conta",
  "Lidar com sistemas complexos e confusos",
  "Esperar meses para receber",
  "Ter seu conteúdo exposto sem controle",
];

export function SobreContent() {
  const missionRef = useRef<HTMLElement>(null);
  const forWhoRef = useRef<HTMLElement>(null);
  const valuesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {

      gsap.fromTo(
        ".for-who-lists",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration,
          scrollTrigger: {
            trigger: forWhoRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );

      const valueCards = valuesRef.current?.querySelectorAll(".value-card");
      if (valueCards) {
        gsap.fromTo(
          valueCards,
          { opacity: 0, y: 30 },
          {
            opacity: 1,
            y: 0,
            duration,
            stagger: 0.1,
            scrollTrigger: {
              trigger: valuesRef.current,
              start: "top 80%",
              once: true,
            },
          }
        );
      }
    });

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("Criar minha conta grátis", "sobre_for_who", "/sobre");
  };

  return (
    <>
      <MiniHero
        title="Sobre a plataforma"
        description="Criado para criadores que querem monetizar com simplicidade e profissionalismo."
      />

      <section ref={forWhoRef} className="bg-[#0A0A0A] py-20 md:py-28">
        <Container>
          <SectionHeader title="Para quem é o Pack do Pezin" />

          <div className="for-who-lists grid gap-8 md:grid-cols-2">
            <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-[#D4FF00]">
                Para criadores que querem:
              </h3>
              <ul className="space-y-4">
                {forCreators.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#D4FF00]">
                      <svg
                        className="h-3 w-3 text-[#0A0A0A]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </div>
                    <span className="text-[#A1A1A1]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6 md:p-8">
              <h3 className="mb-6 text-xl font-semibold text-white">
                Para criadores que NÃO querem:
              </h3>
              <ul className="space-y-4">
                {notForCreators.map((item) => (
                  <li key={item} className="flex items-start gap-3">
                    <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2A2A2A]">
                      <svg
                        className="h-3 w-3 text-[#A1A1A1]"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={3}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </div>
                    <span className="text-[#A1A1A1]">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Button
              size="lg"
              asChild
              className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
              onClick={handleCTAClick}
            >
              <Link href="/app/signup">Criar minha conta grátis</Link>
            </Button>
          </div>
        </Container>
      </section>

      <section ref={valuesRef} className="bg-[#141414] py-20 md:py-28">
        <Container>
          <SectionHeader title="O que oferecemos" />

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {values.map((value) => (
              <div
                key={value.title}
                className="value-card rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] p-6"
              >
                <h3 className="mb-3 text-lg font-semibold text-[#D4FF00]">
                  {value.title}
                </h3>
                <p className="text-sm text-[#A1A1A1]">{value.description}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <CTASection
        title="Faça parte do Pack do Pezin"
        subtitle="Cadastro gratuito. Comece a vender em minutos."
        primaryCTA={{ text: "Criar conta grátis", href: "/app/signup" }}
      />
    </>
  );
}
