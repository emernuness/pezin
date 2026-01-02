"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/perguntas-frequentes", label: "FAQ" },
  { href: "/contato", label: "Contato" },
];

export function MarketingHeader() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={cn(
        "sticky top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "border-b border-[#2A2A2A] bg-[#0A0A0A]/95 backdrop-blur supports-[backdrop-filter]:bg-[#0A0A0A]/80"
          : "bg-transparent"
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center">
          <Image
            src="/img/logo-white.png"
            alt="Pack do Pezin"
            width={140}
            height={32}
            priority
            className="h-10 w-auto"
          />
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-[#D4FF00]",
                pathname === link.href ? "text-[#D4FF00]" : "text-white"
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="text-white hover:bg-white/10 hover:text-[#D4FF00]"
          >
            <Link href="/app/login">Entrar</Link>
          </Button>
          <Button
            size="sm"
            asChild
            className="bg-[#D4FF00] text-[#0A0A0A] hover:bg-[#BFFF00]"
          >
            <Link href="/app/signup">Criar Conta</Link>
          </Button>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center text-white md:hidden"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          aria-label={isMobileMenuOpen ? "Fechar menu" : "Abrir menu"}
          aria-expanded={isMobileMenuOpen}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isMobileMenuOpen ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 6h16M4 12h16M4 18h16"
              />
            )}
          </svg>
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="border-t border-[#2A2A2A] bg-[#0A0A0A] md:hidden">
          <nav className="flex flex-col px-4 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "py-3 text-base font-medium transition-colors",
                  pathname === link.href ? "text-[#D4FF00]" : "text-white"
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
            <div className="mt-4 flex flex-col gap-3 border-t border-[#2A2A2A] pt-4">
              <Button
                variant="ghost"
                asChild
                className="justify-center text-white hover:bg-white/10"
              >
                <Link href="/app/login">Entrar</Link>
              </Button>
              <Button
                asChild
                className="justify-center bg-[#D4FF00] text-[#0A0A0A] hover:bg-[#BFFF00]"
              >
                <Link href="/app/signup">Criar Conta</Link>
              </Button>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
