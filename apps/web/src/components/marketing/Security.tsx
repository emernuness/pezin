"use client";

import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

const securityPoints = [
  {
    title: "Links tokenizados",
    description: "Cada compra gera um link único. Só quem pagou acessa.",
  },
  {
    title: "Pagamentos via Stripe",
    description: "Processamento seguro com criptografia de ponta a ponta.",
  },
  {
    title: "Controle de acesso",
    description: "Você decide o que publicar e quando despublicar.",
  },
  {
    title: "Sem exposição de dados pessoais",
    description: "Consumidores veem apenas seu nome artístico.",
  },
  {
    title: "Hospedagem segura",
    description: "Infraestrutura profissional com CDN Cloudflare.",
  },
];

export function Security() {
  const sectionRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {
      const items = listRef.current?.querySelectorAll(".security-item");
      if (!items) return;

      gsap.fromTo(
        items,
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration,
          stagger: 0.1,
          ease: "power2.out",
          scrollTrigger: {
            trigger: listRef.current,
            start: "top 80%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("Criar conta segura", "security", "/");
  };

  return (
    <section ref={sectionRef} className="bg-[#0A0A0A] py-20 md:py-28">
      <Container>
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <SectionHeader
              title="Seu conteúdo protegido. Seus dados seguros."
              subtitle="Privacidade e segurança são prioridade desde o primeiro dia."
              align="left"
              className="mb-8"
            />

            <ul ref={listRef} className="space-y-4">
              {securityPoints.map((point) => (
                <li
                  key={point.title}
                  className="security-item flex items-start gap-4 rounded-xl border border-[#2A2A2A] bg-[#141414] p-4"
                >
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#D4FF00]">
                    <svg
                      className="h-4 w-4 text-[#0A0A0A]"
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
                  <div>
                    <h3 className="font-semibold text-white">{point.title}</h3>
                    <p className="mt-1 text-sm text-[#A1A1A1]">
                      {point.description}
                    </p>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-8">
              <Button
                size="lg"
                asChild
                className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
                onClick={handleCTAClick}
              >
                <Link href="/signup">Criar conta segura</Link>
              </Button>
            </div>
          </div>

          <div className="relative aspect-square max-w-md lg:ml-auto">
            <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414]">
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="text-center">
                  <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-[#D4FF00]/10">
                    <svg
                      className="h-10 w-10 text-[#D4FF00]"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                      />
                    </svg>
                  </div>
                  <p className="text-sm text-[#A1A1A1]">Placeholder de imagem</p>
                  <p className="text-xs text-[#A1A1A1]">600x400px</p>
                  <p className="mt-2 text-xs text-[#D4FF00]">
                    Ilustração de segurança
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}