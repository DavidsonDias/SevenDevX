import { Helmet } from "react-helmet";

/**
 * 🧠 GeoKnowledgeGraph
 * Injeta JSON-LD Enterprise sitewide para Generative Engine Optimization (GEO).
 *
 * Tipos cobertos:
 * - Organization + ProfessionalService + SoftwareCompany (entidade SevenDevX)
 * - WebSite com SearchAction
 * - ItemList de Serviços (Knowledge Graph relacional)
 * - LocalBusiness com GeoCoordinates e ServiceArea
 *
 * Objetivo: aumentar descoberta em ChatGPT, Gemini, Claude, Perplexity,
 * Copilot, Google AI Overviews, Bing AI, Meta AI e sistemas RAG.
 */

const BASE = "https://www.sevendevx.com";
const LOGO = `${BASE}/logo-512.png`;

const SAME_AS = [
  "https://www.linkedin.com/company/sevendevx",
  "https://github.com/sevendevx",
  "https://www.instagram.com/sevendevx",
  "https://twitter.com/sevendevx",
  "https://www.youtube.com/@SevenDevXX",
];

const TECHNOLOGIES = [
  "React", "TypeScript", "Vite", "Node.js", "Deno", "PostgreSQL",
  "Supabase", "Tailwind CSS", "Framer Motion", "OpenAI", "Stripe",
  "Vercel", "WhatsApp Business API", "Figma", "Slack", "Discord", "Resend",
];

const SERVICE_CATALOG = [
  {
    name: "Desenvolvimento Web Full Stack",
    description: "Aplicações web modernas com React, TypeScript e arquitetura escalável.",
    serviceType: "Web Development",
  },
  {
    name: "Landing Pages de Alta Conversão",
    description: "Páginas otimizadas para conversão com Framer Motion e Core Web Vitals 95+.",
    serviceType: "Landing Page Design",
  },
  {
    name: "Sistemas Empresariais Sob Demanda",
    description: "ERPs, CRMs e dashboards corporativos customizados.",
    serviceType: "Custom Software Development",
  },
  {
    name: "SaaS Multi-tenant",
    description: "Plataformas SaaS com Supabase, RLS e Edge Functions.",
    serviceType: "SaaS Development",
  },
  {
    name: "Automações Empresariais",
    description: "Workflow engines com triggers, condições e ações.",
    serviceType: "Business Process Automation",
  },
  {
    name: "Integração de Inteligência Artificial",
    description: "Chatbots com GPT-4, Claude e Gemini, RAG e agentes autônomos.",
    serviceType: "AI Integration",
  },
  {
    name: "Integrações Enterprise",
    description: "WhatsApp, Stripe, Slack, Discord, GitHub, Vercel, Figma, Resend.",
    serviceType: "System Integration",
  },
];

const ORGANIZATION = {
  "@context": "https://schema.org",
  "@type": ["Organization", "ProfessionalService", "LocalBusiness"],
  "@id": `${BASE}/#organization`,
  name: "SevenDevX",
  alternateName: ["Seven DevX", "SevenDevX Tech"],
  legalName: "SevenDevX",
  url: BASE,
  logo: {
    "@type": "ImageObject",
    url: LOGO,
    width: 512,
    height: 512,
  },
  image: LOGO,
  description:
    "Empresa de desenvolvimento web, landing pages, sistemas sob demanda, automações e integração de IA. Sede em Belo Horizonte, MG — atende todo o Brasil.",
  slogan: "Desenvolvimento web com inovação, design e performance.",
  foundingDate: "2024-01-10",
  founder: {
    "@type": "Person",
    name: "Davidson Dias",
    jobTitle: "Founder & Lead Developer",
  },
  email: "contato@sevendevx.com",
  telephone: "+55-31-98474-0625",
  priceRange: "$$",
  address: {
    "@type": "PostalAddress",
    addressLocality: "Belo Horizonte",
    addressRegion: "MG",
    postalCode: "31515-040",
    addressCountry: "BR",
  },
  geo: {
    "@type": "GeoCoordinates",
    latitude: -19.8157,
    longitude: -43.9542,
  },
  areaServed: [
    { "@type": "Country", name: "Brasil" },
    { "@type": "AdministrativeArea", name: "Minas Gerais" },
    { "@type": "City", name: "Belo Horizonte" },
  ],
  serviceArea: {
    "@type": "GeoCircle",
    geoMidpoint: {
      "@type": "GeoCoordinates",
      latitude: -19.8157,
      longitude: -43.9542,
    },
    geoRadius: "20000000",
  },
  contactPoint: [
    {
      "@type": "ContactPoint",
      contactType: "customer service",
      email: "contato@sevendevx.com",
      telephone: "+55-31-98474-0625",
      areaServed: "BR",
      availableLanguage: ["pt-BR", "en", "es"],
    },
    {
      "@type": "ContactPoint",
      contactType: "sales",
      email: "contato@sevendevx.com",
      areaServed: "Worldwide",
      availableLanguage: ["pt-BR", "en"],
    },
  ],
  knowsAbout: [
    "Desenvolvimento Web",
    "React",
    "TypeScript",
    "Node.js",
    "Supabase",
    "PostgreSQL",
    "Landing Pages",
    "SaaS",
    "CRM",
    "ERP",
    "Automação Empresarial",
    "Inteligência Artificial",
    "Chatbots com IA",
    "Integração OpenAI",
    "WhatsApp Business API",
    "Stripe",
    "Edge Functions",
    "PWA",
    "Performance Web",
    "Core Web Vitals",
    "Design Systems",
    "UX/UI Design",
  ],
  knowsLanguage: ["pt-BR", "en", "es"],
  hasOfferCatalog: {
    "@type": "OfferCatalog",
    name: "Serviços SevenDevX",
    itemListElement: SERVICE_CATALOG.map((s, i) => ({
      "@type": "Offer",
      position: i + 1,
      itemOffered: {
        "@type": "Service",
        name: s.name,
        description: s.description,
        serviceType: s.serviceType,
        provider: { "@id": `${BASE}/#organization` },
        areaServed: { "@type": "Country", name: "Brasil" },
      },
    })),
  },
  makesOffer: SERVICE_CATALOG.map((s) => ({
    "@type": "Offer",
    itemOffered: {
      "@type": "Service",
      name: s.name,
      serviceType: s.serviceType,
    },
  })),
  brand: {
    "@type": "Brand",
    name: "SevenDevX",
    logo: LOGO,
  },
  sameAs: SAME_AS,
  potentialAction: {
    "@type": "ContactAction",
    target: `${BASE}/services`,
  },
};

const WEBSITE = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${BASE}/#website`,
  url: BASE,
  name: "SevenDevX",
  description:
    "Desenvolvimento web, landing pages, sistemas sob demanda, automações e integração de IA.",
  publisher: { "@id": `${BASE}/#organization` },
  inLanguage: "pt-BR",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${BASE}/blog?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

const TECH_KNOWLEDGE = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  "@id": `${BASE}/#tech-stack`,
  name: "Stack Tecnológica SevenDevX",
  description: "Tecnologias dominadas pela equipe SevenDevX em projetos enterprise.",
  itemListElement: TECHNOLOGIES.map((t, i) => ({
    "@type": "ListItem",
    position: i + 1,
    item: {
      "@type": "Thing",
      name: t,
    },
  })),
};

const PROFESSIONAL_SERVICE = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": `${BASE}/#service`,
  name: "SevenDevX — Desenvolvimento Web & Soluções Digitais",
  provider: { "@id": `${BASE}/#organization` },
  serviceType: [
    "Web Development",
    "Custom Software Development",
    "AI Integration",
    "Business Automation",
    "Landing Page Design",
    "SaaS Development",
  ],
  areaServed: { "@type": "Country", name: "Brasil" },
  hasOfferCatalog: { "@id": `${BASE}/#organization` },
};

export default function GeoKnowledgeGraph() {
  return (
    <Helmet>
      <script type="application/ld+json">{JSON.stringify(ORGANIZATION)}</script>
      <script type="application/ld+json">{JSON.stringify(WEBSITE)}</script>
      <script type="application/ld+json">{JSON.stringify(PROFESSIONAL_SERVICE)}</script>
      <script type="application/ld+json">{JSON.stringify(TECH_KNOWLEDGE)}</script>
    </Helmet>
  );
}
