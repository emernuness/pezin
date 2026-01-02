import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { Container, CTASection } from "@/components/marketing";
import { FAQAccordion } from "@/components/marketing/FAQAccordion";
import { MiniHero } from "@/components/marketing/MiniHero";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Perguntas Frequentes — Pack do Pezin",
  description:
    "Tire suas dúvidas sobre o Pack do Pezin. Como vender, taxas, pagamentos, segurança e mais. Tudo o que você precisa saber em um só lugar.",
  alternates: {
    canonical: "https://packdopezin.com.br/perguntas-frequentes",
  },
  openGraph: {
    title: "Perguntas Frequentes — Pack do Pezin",
    description:
      "Tire suas dúvidas sobre o Pack do Pezin. Como vender, taxas, pagamentos, segurança e mais.",
    url: "https://packdopezin.com.br/perguntas-frequentes",
  },
  twitter: {
    title: "Perguntas Frequentes — Pack do Pezin",
    description:
      "Tire suas dúvidas sobre o Pack do Pezin. Como vender, taxas, pagamentos, segurança e mais.",
  },
};

const faqCategories = [
  {
    title: "Começando",
    items: [
      {
        id: "what-is",
        question: "O que é o Pack do Pezin?",
        answer:
          "O Pack do Pezin é uma plataforma de monetização para criadores de conteúdo adulto. Você cria packs de fotos e vídeos, define seu preço e vende diretamente para seus fãs através de um link único.",
      },
      {
        id: "cost-to-create",
        question: "Quanto custa para criar uma conta?",
        answer:
          "Criar conta é 100% gratuito. Você não paga nada para se cadastrar, criar seu perfil ou cadastrar seus packs. Simples assim.",
      },
      {
        id: "need-cnpj",
        question: "Preciso ter CNPJ ou empresa?",
        answer:
          "Não. Você pode vender como pessoa física. Basta ser maior de 18 anos e completar a verificação de idade.",
      },
    ],
  },
  {
    title: "Vendendo",
    items: [
      {
        id: "how-to-start",
        question: "Como eu começo a vender?",
        answer:
          "É simples: (1) Crie sua conta gratuita, (2) Cadastre seu pack com fotos/vídeos, (3) Defina o preço, (4) Compartilhe o link com seus fãs. Pronto, você está vendendo.",
      },
      {
        id: "price-range",
        question: "Qual o preço mínimo e máximo de um pack?",
        answer: "Você pode definir valores a partir de R$ 19,90 por pack. Não há limite máximo de preço.",
      },
      {
        id: "files-per-pack",
        question: "Quantos arquivos posso colocar em um pack?",
        answer:
          "Cada pack pode ter de 3 a 50 arquivos (fotos ou vídeos). O tamanho máximo por arquivo é 100MB e o total do pack não pode ultrapassar 500MB.",
      },
      {
        id: "file-formats",
        question: "Quais formatos de arquivo são aceitos?",
        answer: "Imagens: JPG, PNG e WebP. Vídeos: MP4 e MOV.",
      },
    ],
  },
  {
    title: "Pagamentos e Taxas",
    items: [
      {
        id: "platform-fees",
        question: "Quais são as taxas da plataforma?",
        answer:
          "A plataforma cobra uma taxa de 10% sobre o valor do pack. Essa taxa é descontada automaticamente de cada venda. Não há taxas para criar conta, cadastrar packs ou manter sua conta ativa.",
      },
      {
        id: "how-receive",
        question: "Como recebo meus pagamentos?",
        answer:
          "Os pagamentos são processados de forma segura. Você conecta sua conta bancária ao Pack do Pezin e recebe os valores diretamente.",
      },
      {
        id: "time-to-available",
        question: "Quanto tempo demora para o dinheiro ficar disponível?",
        answer:
          "Por segurança anti-fraude, o valor de cada venda fica pendente por 14 dias. Após esse período, o saldo fica disponível para saque.",
      },
      {
        id: "min-withdrawal",
        question: "Qual o valor mínimo para saque?",
        answer: "O valor mínimo para solicitar saque é R$ 50,00.",
      },
    ],
  },
  {
    title: "Carteira Pezin",
    items: [
      {
        id: "what-is-wallet",
        question: "O que é a Carteira Pezin?",
        answer:
          "É onde você acompanha todos os seus ganhos. Você vê o saldo pendente (vendas recentes aguardando liberação) e o saldo disponível (pronto para saque).",
      },
      {
        id: "pending-balance",
        question: "Como funciona o saldo pendente?",
        answer:
          "Quando você realiza uma venda, o valor vai para o saldo pendente. Após 14 dias (período de segurança), ele é transferido automaticamente para o saldo disponível.",
      },
    ],
  },
  {
    title: "Conteúdo",
    items: [
      {
        id: "content-type",
        question: "Que tipo de conteúdo posso vender?",
        answer:
          "Você pode vender packs de fotos e vídeos de conteúdo adulto, desde que sejam de sua autoria, você seja maior de 18 anos e o conteúdo respeite nossas políticas. Conteúdo ilegal, envolvendo menores ou violência não é permitido. Consulte nossa Política de Conteúdo para detalhes.",
      },
      {
        id: "preview-nudity",
        question: "As imagens de preview podem ter nudez?",
        answer:
          "Não. As imagens de preview (aquelas que aparecem na vitrine antes da compra) não podem conter nudez explícita. O conteúdo explícito fica dentro do pack, acessível apenas após a compra.",
      },
    ],
  },
  {
    title: "Segurança",
    items: [
      {
        id: "personal-data",
        question: "Meus dados pessoais ficam expostos?",
        answer:
          "Não. Os compradores veem apenas seu nome artístico. Seus dados pessoais são protegidos e usados apenas para processamento de pagamentos.",
      },
      {
        id: "content-protection",
        question: "Como funciona a proteção do conteúdo?",
        answer:
          "Cada compra gera um link único e tokenizado. Apenas quem pagou consegue acessar o conteúdo. Você também pode despublicar packs a qualquer momento.",
      },
      {
        id: "payment-security",
        question: "O pagamento é seguro?",
        answer:
          "Sim. Todos os pagamentos são processados por uma instituição de pagamentos líder mundial, com criptografia de ponta a ponta.",
      },
    ],
  },
  {
    title: "Suporte",
    items: [
      {
        id: "contact-support",
        question: "Como entro em contato com o suporte?",
        answer:
          "Você pode nos contatar através da página de Contato ou pelo email contato@packdopezin.com. Respondemos em até 24 horas úteis.",
      },
      {
        id: "technical-problem",
        question: "Encontrei um problema técnico. O que faço?",
        answer:
          "Acesse a página de Contato e descreva o problema com o máximo de detalhes possível. Nossa equipe técnica analisará e responderá o mais rápido possível.",
      },
    ],
  },
  {
    title: "Cancelamento e Reembolso",
    items: [
      {
        id: "refund-policy",
        question: "Como funciona a política de reembolso?",
        answer:
          "Devido à natureza do produto digital (acesso imediato ao conteúdo), não realizamos reembolsos, exceto em casos de problemas técnicos comprovados ou conteúdo não correspondente à descrição, analisados caso a caso.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqCategories.flatMap((category) =>
    category.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  ),
};

const breadcrumbItems = [
  { name: "Home", url: "https://packdopezin.com.br" },
  {
    name: "Perguntas Frequentes",
    url: "https://packdopezin.com.br/perguntas-frequentes",
  },
];

export default function FAQPage() {
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <MiniHero
        title="Perguntas Frequentes"
        description="Tudo o que você precisa saber sobre o Pack do Pezin em um só lugar."
      />

      <section className="bg-[#0A0A0A] py-20 md:py-28">
        <Container className="max-w-3xl">
          <FAQAccordion categories={faqCategories} />
        </Container>
      </section>

      <CTASection
        title="Ainda tem dúvidas?"
        subtitle="Entre em contato conosco ou comece agora mesmo — é grátis."
        primaryCTA={{ text: "Criar conta grátis", href: "/app/signup" }}
        secondaryCTA={{ text: "Falar com suporte", href: "/contato" }}
      />
    </>
  );
}
