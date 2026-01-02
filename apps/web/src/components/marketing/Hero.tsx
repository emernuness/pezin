"use client";

import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import { getAnimationDuration, gsap } from "@/lib/gsap";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { Container } from "./Container";

export function Hero() {
  const headlineRef = useRef<HTMLHeadingElement>(null);
  const subheadlineRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        headlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration, ease: "power2.out" }
      );
      gsap.fromTo(
        subheadlineRef.current,
        { opacity: 0, y: 30 },
        { opacity: 1, y: 0, duration, delay: 0.2, ease: "power2.out" }
      );
      gsap.fromTo(
        ctaRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration, delay: 0.4, ease: "power2.out" }
      );
      gsap.fromTo(
        imageRef.current,
        { opacity: 0, x: 30 },
        { opacity: 1, x: 0, duration: duration * 1.2, delay: 0.3, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  const handlePrimaryClick = () => {
    trackCTAClick("Criar conta grátis", "hero", "/");
  };

  const handleSecondaryClick = () => {
    trackCTAClick("Saiba como funciona", "hero", "/");
  };

  return (
    <section className="relative overflow-hidden bg-[#0A0A0A] py-16 md:py-24 lg:py-32">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse at 80% 20%, rgba(212, 255, 0, 0.08) 0%, transparent 50%)",
        }}
      />
      <Container className="relative z-10">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <h1
              ref={headlineRef}
              className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl lg:text-[56px]"
            >
              Venda seus packs de conteúdo. Sem complicação.
            </h1>
            <p
              ref={subheadlineRef}
              className="mt-6 text-lg text-[#A1A1A1] md:text-xl"
            >
              A plataforma feita para criadores que querem monetizar com
              simplicidade, segurança e profissionalismo. Cadastro gratuito —
              comece a vender em minutos.
            </p>
            <div ref={ctaRef} className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                asChild
                className="bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00]"
                onClick={handlePrimaryClick}
              >
                <Link href="/app/signup">Criar conta grátis</Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                asChild
                className="border-[#D4FF00] bg-transparent text-[#D4FF00] hover:bg-[#D4FF00]/10"
                onClick={handleSecondaryClick}
              >
                <Link href="#como-funciona">Saiba como funciona</Link>
              </Button>
            </div>
          </div>
          <div ref={imageRef} className="relative">
            <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-[#2A2A2A] bg-[#141414]">
              <Image
                src="/img/placeholder-dashboard.jpg"
                alt="Painel do criador mostrando vendas e saldo"
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}