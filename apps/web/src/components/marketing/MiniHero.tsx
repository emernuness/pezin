"use client";

import { getAnimationDuration, gsap } from "@/lib/gsap";
import Image from "next/image";
import { useEffect, useRef } from "react";
import { Container } from "./Container";

interface MiniHeroProps {
  title: string;
  description?: string;
}

export function MiniHero({ title, description }: MiniHeroProps) {
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const duration = getAnimationDuration();
    const ctx = gsap.context(() => {
      gsap.fromTo(
        contentRef.current,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration, ease: "power2.out" }
      );
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="relative h-[120px] overflow-hidden md:h-[150px]">
      {/* Background Image */}
      <Image
        src="/img/bg-hero.png"
        alt=""
        fill
        className="object-cover"
        sizes="100vw"
      />

      {/* Overlay with blur and black 60% */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      />

      <Container className="relative z-10 flex h-full items-center">
        <div ref={contentRef} className="w-full text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white md:text-5xl">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm text-[#E0E0E0] md:text-base">
              {description}
            </p>
          )}
        </div>
      </Container>
    </section>
  );
}
