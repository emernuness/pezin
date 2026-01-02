import { MarketingFooter } from "@/components/marketing/MarketingFooter";
import { MarketingHeader } from "@/components/marketing/MarketingHeader";
import { SchemaOrg } from "@/components/marketing/SchemaOrg";
import type { Metadata } from "next";

export const metadata: Metadata = {
  metadataBase: new URL("https://packdopezin.com.br"),
  openGraph: {
    type: "website",
    siteName: "Pack do Pezin",
    locale: "pt_BR",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Pack do Pezin - Venda seus Packs de Conteudo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    images: ["/twitter-image.jpg"],
  },
  alternates: {
    languages: {
      "pt-BR": "https://packdopezin.com.br",
    },
  },
};

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col bg-[#0A0A0A]">
      <SchemaOrg />
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}
