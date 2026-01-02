"use client";

import { getAnimationDuration, gsap, ScrollTrigger } from "@/lib/gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "./Container";
import { SectionHeader } from "./SectionHeader";

const testimonials = [
  {
    id: 1,
    quote:
      "Minhas vendas aumentaram muito desde que migrei. A plataforma é super fácil de usar.",
    name: "Ana S.",
    role: "Criadora de conteúdo",
  },
  {
    id: 2,
    quote:
      "O sistema de pagamento me dá muito mais segurança. Recebo direitinho.",
    name: "Carlos M.",
    role: "Criador de conteúdo",
  },
  {
    id: 3,
    quote: "A interface é linda e meus fãs adoraram a facilidade para comprar.",
    name: "Júlia R.",
    role: "Criadora de conteúdo",
  },
];

export function Testimonials() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    if (duration === 0) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current?.querySelectorAll(".testimonial-card");
      if (!cards) return;

      gsap.fromTo(
        cards,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration,
          stagger: 0.15,
          ease: "power2.out",
          scrollTrigger: {
            trigger: gridRef.current,
            start: "top 80%",
            once: true,
          },
        },
      );
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="bg-[#141414] py-20 md:py-28">
      <Container>
        <SectionHeader
          title="O que criadores dizem sobre o Pack do Pezin"
          subtitle="Histórias reais de quem já está vendendo."
        />

        <div ref={gridRef} className="grid gap-6 md:grid-cols-3">
          {testimonials.map((testimonial) => (
            <div
              key={testimonial.id}
              className="testimonial-card rounded-2xl border border-[#2A2A2A] bg-[#0A0A0A] p-6"
            >
              <div className="mb-4 text-4xl text-[#D4FF00]">"</div>
              <p className="mb-6 text-[#A1A1A1]">{testimonial.quote}</p>
              <div className="flex items-center gap-3">
                <div className="relative h-12 w-12 overflow-hidden rounded-full bg-[#2A2A2A]">
                  <Image
                    src={`/img/placeholder-avatar-${testimonial.id}.jpg`}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                    sizes="48px"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-[#2A2A2A]">
                    <span className="text-xs text-[#A1A1A1]">Foto</span>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-white">{testimonial.name}</p>
                  <p className="text-sm text-[#A1A1A1]">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
