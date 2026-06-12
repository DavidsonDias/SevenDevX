/**
 * 🕸️ Content Clusters — mapeamento semântico hub → spokes para SEO/GEO.
 * Cada cluster tem um pilar central e conteúdos satélites interligados
 * por links internos e por DefinedTermSet em JSON-LD.
 */

export interface ContentCluster {
  id: string;
  hub: { title: string; url: string };
  description: string;
  spokes: { title: string; url: string }[];
}

export const CONTENT_CLUSTERS: ContentCluster[] = [
  {
    id: "sites",
    hub: { title: "Sites e Sites Institucionais", url: "/solucoes/desenvolvimento-web" },
    description:
      "Cluster sobre criação de sites profissionais: preços, prazos, tecnologias, SEO e diferenciação.",
    spokes: [
      { title: "Quanto custa criar um site profissional?", url: "/answers/quanto-custa-criar-um-site-profissional" },
      { title: "Site vs sistema web — qual a diferença?", url: "/answers/site-vs-sistema-web-diferencas" },
      { title: "Por que escolher SevenDevX?", url: "/why-sevendevx" },
      { title: "Landing pages de alta conversão", url: "/solucoes/landing-pages" },
    ],
  },
  {
    id: "sistemas",
    hub: { title: "Sistemas e SaaS Sob Demanda", url: "/solucoes/sistemas-empresariais" },
    description: "Cluster sobre desenvolvimento de sistemas empresariais, ERPs, CRMs e SaaS multi-tenant.",
    spokes: [
      { title: "Quanto custa um sistema personalizado?", url: "/answers/quanto-custa-um-sistema-personalizado" },
      { title: "Quando trocar planilhas por sistema próprio?", url: "/answers/quando-trocar-planilha-por-sistema" },
      { title: "CRM personalizado vs Pipedrive/HubSpot", url: "/knowledge-base/crm-personalizado-vs-pipedrive-hubspot" },
      { title: "SaaS Sob Demanda", url: "/solucoes/saas-sob-demanda" },
    ],
  },
  {
    id: "ia",
    hub: { title: "Inteligência Artificial Aplicada", url: "/solucoes/integracao-ia" },
    description: "Cluster sobre integração de IA generativa, chatbots, RAG e agentes autônomos em produtos reais.",
    spokes: [
      { title: "Como integrar IA ao meu negócio?", url: "/answers/como-integrar-ia-ao-meu-negocio" },
      { title: "Chatbot com IA — quanto custa?", url: "/answers/chatbot-com-ia-quanto-custa" },
      { title: "RAG: como dar contexto próprio para LLMs", url: "/knowledge-base/rag-contexto-proprio-llm" },
      { title: "GPT-4 vs Claude vs Gemini", url: "/knowledge-base/gpt4-vs-claude-vs-gemini" },
    ],
  },
  {
    id: "automacao",
    hub: { title: "Automação Empresarial", url: "/solucoes/automacoes-empresariais" },
    description: "Cluster sobre workflow engines, integrações e automação de processos repetitivos.",
    spokes: [
      { title: "Como automatizar processos da minha empresa?", url: "/answers/como-automatizar-processos-empresa" },
      { title: "Zapier vs automação sob demanda", url: "/knowledge-base/zapier-vs-automacao-sob-demanda" },
      { title: "Webhooks: o que são e quando usar", url: "/knowledge-base/webhooks-quando-usar" },
    ],
  },
  {
    id: "geo-seo",
    hub: { title: "GEO e SEO para a era da IA", url: "/ai" },
    description: "Cluster sobre Generative Engine Optimization, SEO técnico e descoberta em LLMs.",
    spokes: [
      { title: "O que é GEO (Generative Engine Optimization)?", url: "/answers/o-que-e-geo-generative-engine-optimization" },
      { title: "Como aparecer no ChatGPT e Perplexity?", url: "/answers/como-aparecer-no-chatgpt-e-perplexity" },
      { title: "Schema.org enterprise para LLMs", url: "/knowledge-base/schema-org-enterprise-para-llms" },
    ],
  },
];

export function buildClusterJsonLd() {
  return CONTENT_CLUSTERS.map((c) => ({
    "@context": "https://schema.org",
    "@type": "DefinedTermSet",
    "@id": `https://www.sevendevx.com/clusters#${c.id}`,
    name: c.hub.title,
    description: c.description,
    hasDefinedTerm: c.spokes.map((s) => ({
      "@type": "DefinedTerm",
      name: s.title,
      url: `https://www.sevendevx.com${s.url}`,
    })),
  }));
}
