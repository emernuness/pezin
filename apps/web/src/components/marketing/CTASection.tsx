"use client";

import { Button } from "@/components/ui/button";
import { trackCTAClick } from "@/lib/analytics";
import Link from "next/link";
import { Container } from "./Container";

interface CTASectionProps {
  title: string;
  subtitle: string;
  primaryCTA: {
    text: string;
    href: string;
  };
  secondaryCTA?: {
    text: string;
    href: string;
  };
}

export function CTASection({
  title,
  subtitle,
  primaryCTA,
  secondaryCTA,
}: CTASectionProps) {
  const handlePrimaryClick = () => {
    trackCTAClick(primaryCTA.text, "cta_section", window.location.pathname);
  };

  const handleSecondaryClick = () => {
    if (secondaryCTA) {
      trackCTAClick(secondaryCTA.text, "cta_section", window.location.pathname);
    }
  };

  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-[#141414] via-[#0A0A0A] to-[#141414] py-20 md:py-28">
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 50% 50%, rgba(212, 255, 0, 0.15) 0%, transparent 60%)",
        }}
      />
      <Container className="relative z-10 text-center">
        <h2 className="text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-[40px]">
          {title}
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-base text-[#A1A1A1] md:text-lg">
          {subtitle}
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            asChild
            className="w-full bg-[#D4FF00] px-8 text-[#0A0A0A] transition-transform hover:scale-[1.02] hover:bg-[#BFFF00] sm:w-auto"
            onClick={handlePrimaryClick}
          >
            <Link href={primaryCTA.href}>{primaryCTA.text}</Link>
          </Button>
          {secondaryCTA && (
            <Button
              size="lg"
              variant="outline"
              asChild
              className="w-full border-[#D4FF00] bg-transparent text-[#D4FF00] hover:bg-[#D4FF00]/0 hover:text-white sm:w-auto"
              onClick={handleSecondaryClick}
            >
              <Link href={secondaryCTA.href}>{secondaryCTA.text}</Link>
            </Button>
          )}
        </div>
      </Container>
    </section>
  );
}
