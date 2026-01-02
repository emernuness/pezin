import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/sobre", label: "Sobre" },
  { href: "/perguntas-frequentes", label: "FAQ" },
  { href: "/contato", label: "Contato" },
];

const legalLinks = [
  { href: "#", label: "Termos de Uso" },
  { href: "#", label: "Política de Privacidade" },
  { href: "#", label: "Política de Conteúdo" },
];

export function MarketingFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="border-t border-[#2A2A2A] bg-[#0A0A0A]">
      <div className="mx-auto max-w-[1200px] px-4 py-12 md:px-6 md:py-16">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="md:col-span-2">
            <Link href="/" className="inline-block">
              <Image
                src="/img/logo-white.png"
                alt="Pack do Pezin"
                width={140}
                height={32}
                className="h-20 w-auto"
              />
            </Link>
            <p className="mt-4 max-w-sm text-sm text-[#A1A1A1]">
              A plataforma feita para criadores que querem monetizar com
              simplicidade, segurança e profissionalismo.
            </p>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Navegação</h3>
            <ul className="space-y-3">
              {navLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A1A1A1] transition-colors hover:text-[#D4FF00]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-sm font-semibold text-white">Legal</h3>
            <ul className="space-y-3">
              {legalLinks.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-sm text-[#A1A1A1] transition-colors hover:text-[#D4FF00]"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
            <div className="mt-6">
              <h3 className="mb-2 text-sm font-semibold text-white">Contato</h3>
              <a
                href="mailto:contato@packdopezin.com"
                className="text-sm text-[#A1A1A1] transition-colors hover:text-[#D4FF00]"
              >
                contato@packdopezin.com
              </a>
            </div>
          </div>
        </div>

        <div className="mt-12 border-t border-[#2A2A2A] pt-8">
          <p className="text-center text-sm text-[#A1A1A1]">
            {currentYear} Pack do Pezin. Todos os direitos reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
