const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "Pack do Pezin",
  url: "https://packdopezin.com.br",
  logo: "https://packdopezin.com.br/img/logo.png",
  description: "Plataforma de monetizacao para criadores de conteudo",
  contactPoint: {
    "@type": "ContactPoint",
    email: "contato@packdopezin.com.br",
    contactType: "customer service",
  },
};

const websiteSchema = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Pack do Pezin",
  url: "https://packdopezin.com.br",
  inLanguage: "pt-BR",
};

export function SchemaOrg() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
      />
    </>
  );
}
