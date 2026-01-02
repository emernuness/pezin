import { Breadcrumb } from "@/components/marketing/Breadcrumb";
import { Container } from "@/components/marketing";
import { ContactForm } from "@/components/marketing/ContactForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contato — Pack do Pezin",
  description:
    "Entre em contato com o Pack do Pezin. Dúvidas, sugestões ou suporte técnico. Respondemos em até 24 horas.",
  alternates: {
    canonical: "https://packdopezin.com.br/contato",
  },
  openGraph: {
    title: "Contato — Pack do Pezin",
    description:
      "Entre em contato com o Pack do Pezin. Dúvidas, sugestões ou suporte técnico.",
    url: "https://packdopezin.com.br/contato",
  },
  twitter: {
    title: "Contato — Pack do Pezin",
    description:
      "Entre em contato com o Pack do Pezin. Dúvidas, sugestões ou suporte técnico.",
  },
};

const breadcrumbItems = [
  { name: "Home", url: "https://packdopezin.com.br" },
  { name: "Contato", url: "https://packdopezin.com.br/contato" },
];

export default function ContatoPage() {
  return (
    <>
      <Breadcrumb items={breadcrumbItems} />
      <section className="bg-[#0A0A0A] py-20 md:py-28">
        <Container className="text-center">
          <h1 className="text-4xl font-bold leading-tight tracking-tight text-white md:text-5xl">
            Fale Conosco
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-[#A1A1A1]">
            Dúvidas, sugestões ou problemas? Estamos aqui para ajudar.
          </p>
        </Container>
      </section>

      <section className="bg-[#0A0A0A] pb-20 md:pb-28">
        <Container>
          <div className="mx-auto grid max-w-4xl gap-8 lg:grid-cols-5">
            <div className="lg:col-span-3">
              <ContactForm />
            </div>

            <div className="space-y-6 lg:col-span-2">
              <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Email
                </h3>
                <a
                  href="mailto:contato@packdopezin.com"
                  className="text-[#D4FF00] transition-colors hover:text-[#BFFF00]"
                >
                  contato@packdopezin.com
                </a>
              </div>

              <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Horário de Atendimento
                </h3>
                <p className="text-[#A1A1A1]">Segunda a Sexta</p>
                <p className="text-[#A1A1A1]">9h às 18h (horário de Brasília)</p>
              </div>

              <div className="rounded-2xl border border-[#2A2A2A] bg-[#141414] p-6">
                <h3 className="mb-4 text-lg font-semibold text-white">
                  Tempo de Resposta
                </h3>
                <p className="text-[#A1A1A1]">
                  Respondemos em até 24 horas úteis.
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}