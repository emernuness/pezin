"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

const features = [
  {
    id: "dashboard",
    title: "Painel de controle",
    description:
      "Visualize vendas, saldo disponível e pendente em tempo real.",
    placeholder: "Print do painel",
  },
  {
    id: "packs",
    title: "Gerenciador de packs",
    description:
      "Crie, edite, publique e despublique seus packs com facilidade.",
    placeholder: "Print da lista de packs",
  },
  {
    id: "wallet",
    title: "Carteira Pezin",
    description: "Acompanhe seus ganhos e solicite saques quando quiser.",
    placeholder: "Print da carteira",
  },
  {
    id: "reports",
    title: "Relatórios de vendas",
    description: "Veja quais packs vendem mais, quando e quanto você faturou.",
    placeholder: "Print de relatórios",
  },
  {
    id: "profile",
    title: "Sua vitrine",
    description:
      "Página profissional com todos os seus packs para compartilhar.",
    placeholder: "Print do perfil público",
  },
];

export function Features() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeFeature, setActiveFeature] = useState(features[0].id);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".features-content",
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration,
          ease: "power2.out",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const handleCTAClick = () => {
    trackCTAClick("Quero conhecer", "features", "/");
  };

  const activeFeatureData = features.find((f) => f.id === activeFeature);

  return (
    <section ref={sectionRef} className="bg-[#141414] py-20 md:py-28">
      <Container>
        <SectionHeader
          title="Conheça sua área de criador"
          subtitle="Ferramentas pensadas para você focar no que importa: criar e vender."
        />

        <div className="features-content grid gap-8 lg:grid-cols-5">
          <div className="space-y-2 lg:col-span-2">
            {features.map((feature) => (
              <button
                key={feature.id}
                type="button"
                onClick={() => setActiveFeature(feature.id)}
                className={cn(
                  "w-full rounded-xl p-4 text-left transition-all",
                  activeFeature === feature.id
                    ? "border border-[#D4FF00]/30 bg-[#0A0A0A]"
                    : "hover:bg-[#0A0A0A]/50"
                )}
              >
                <h3
                  className={cn(
                    "font-semibold transition-colors",
                    activeFeature === feature.id
                      ? "text-[#D4FF00]"
                      : "text-white"
                  )}
                >
                  {feature.title}
                </h3>
                <p className="mt-1 text-sm text-[#A1A1A1]">
                  {feature.description}
                </p>
              </button>
            ))}
          </div>

          <div className="lg:col-span-3">
            <div className="relative aspect-[16/10] overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A]">
              <Image
                src={`/img/placeholder-${activeFeature}.jpg`}
                alt={activeFeatureData?.placeholder || "Feature preview"}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 60vw"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-[#0A0A0A]/80">
                <div className="text-center">
                  <p className="text-sm text-[#A1A1A1]">Placeholder de imagem</p>
                  <p className="text-xs text-[#A1A1A1]">800x500px</p>
                  <p className="mt-2 text-xs text-[#D4FF00]">
                    {activeFeatureData?.placeholder}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <Button
            size="lg"
            asChild
            className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
            onClick={handleCTAClick}
          >
            <Link href="/signup">Quero conhecer</Link>
          </Button>
        </div>
      </Container>
    </section>
  );
}