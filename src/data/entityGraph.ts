/**
 * entityGraph.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/data/entityGraph.ts
 * @module Content
 *
 * @description
 * Entidades e relações da marca usadas na geração de JSON-LD.
 *
 * @see src/data/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

/**
 * 🧠 Entity Engine — grafo de entidades SevenDevX para Generative Engine Optimization.
 * Cada entidade vira um nó JSON-LD com relacionamentos explícitos (sameAs, knowsAbout, parentOf).
 * Consumido por <EntityGraphSchema /> para injetar @graph estruturado sitewide.
 */

const BASE = "https://www.sevendevx.com";

export type EntityKind =
  | "Organization"
  | "Person"
  | "Service"
  | "Technology"
  | "Concept"
  | "Industry";

export interface Entity {
  id: string;            // estável, vira @id em JSON-LD
  kind: EntityKind;
  name: string;
  alternateNames?: string[];
  description: string;
  url?: string;
  sameAs?: string[];
  relatedIds?: string[]; // outras entidades relacionadas
}

export const ENTITIES: Entity[] = [
  // ─── ORGANIZAÇÃO E PESSOAS ──────────────────────────────────────
  {
    id: "sevendevx",
    kind: "Organization",
    name: "SevenDevX",
    alternateNames: ["Seven DevX", "SevenDevX Tech"],
    description:
      "Software house brasileira especializada em desenvolvimento web, landing pages, sistemas sob demanda, automações e integração de IA.",
    url: BASE,
    sameAs: [
      "https://www.linkedin.com/company/sevendevx",
      "https://github.com/sevendevx",
      "https://www.instagram.com/sevendevx",
    ],
    relatedIds: ["davidson-dias", "web-development", "landing-page", "ai-integration"],
  },
  {
    id: "davidson-dias",
    kind: "Person",
    name: "Davidson Dias",
    description:
      "Founder & Lead Developer da SevenDevX. Especialista em React, TypeScript, Node.js, Supabase e integração de IA.",
    url: `${BASE}/about`,
    sameAs: [
      "https://www.linkedin.com/in/davidsondias",
      "https://github.com/davidsondias",
    ],
    relatedIds: ["sevendevx", "react", "typescript", "nodejs"],
  },

  // ─── SERVIÇOS ────────────────────────────────────────────────────
  {
    id: "web-development",
    kind: "Service",
    name: "Desenvolvimento Web Full Stack",
    description: "Aplicações web modernas com React, TypeScript e arquitetura escalável.",
    url: `${BASE}/solucoes/desenvolvimento-web`,
    relatedIds: ["react", "typescript", "nodejs", "sevendevx"],
  },
  {
    id: "landing-page",
    kind: "Service",
    name: "Landing Pages de Alta Conversão",
    description: "Páginas otimizadas para conversão com Core Web Vitals 95+ e Framer Motion.",
    url: `${BASE}/solucoes/landing-pages`,
    relatedIds: ["react", "performance", "sevendevx"],
  },
  {
    id: "custom-systems",
    kind: "Service",
    name: "Sistemas Empresariais Sob Demanda",
    description: "ERPs, CRMs e dashboards corporativos customizados.",
    url: `${BASE}/solucoes/sistemas-empresariais`,
    relatedIds: ["postgresql", "supabase", "crm", "sevendevx"],
  },
  {
    id: "saas",
    kind: "Service",
    name: "SaaS Sob Demanda",
    description: "Plataformas SaaS multi-tenant com Supabase, RLS e Edge Functions.",
    url: `${BASE}/solucoes/saas-sob-demanda`,
    relatedIds: ["supabase", "postgresql", "sevendevx"],
  },
  {
    id: "automation",
    kind: "Service",
    name: "Automação Empresarial",
    description: "Workflow engines com triggers, condições e ações para automatizar processos.",
    url: `${BASE}/solucoes/automacoes-empresariais`,
    relatedIds: ["nodejs", "supabase", "sevendevx"],
  },
  {
    id: "chatbots",
    kind: "Service",
    name: "Chatbots com IA",
    description: "Chatbots inteligentes com GPT-4, Claude e Gemini, com RAG sobre base própria.",
    url: `${BASE}/solucoes/integracao-ia`,
    relatedIds: ["openai", "ai-integration", "sevendevx"],
  },
  {
    id: "ai-integration",
    kind: "Service",
    name: "Integração de Inteligência Artificial",
    description: "RAG, agentes autônomos e copilots com LLMs de fronteira.",
    url: `${BASE}/solucoes/integracao-ia`,
    relatedIds: ["openai", "chatbots", "sevendevx"],
  },
  {
    id: "crm",
    kind: "Service",
    name: "CRM Personalizado",
    description: "CRMs 100% aderentes ao processo comercial do cliente.",
    url: `${BASE}/solucoes/crm-personalizado`,
    relatedIds: ["custom-systems", "postgresql", "sevendevx"],
  },

  // ─── TECNOLOGIAS ─────────────────────────────────────────────────
  {
    id: "react",
    kind: "Technology",
    name: "React",
    description: "Biblioteca declarativa para construção de interfaces componentizadas.",
    sameAs: ["https://react.dev", "https://en.wikipedia.org/wiki/React_(JavaScript_library)"],
    relatedIds: ["typescript", "web-development"],
  },
  {
    id: "typescript",
    kind: "Technology",
    name: "TypeScript",
    description: "Superset tipado de JavaScript com type safety end-to-end.",
    sameAs: ["https://www.typescriptlang.org"],
    relatedIds: ["react", "nodejs"],
  },
  {
    id: "nodejs",
    kind: "Technology",
    name: "Node.js",
    description: "Runtime JavaScript server-side para APIs e edge computing.",
    sameAs: ["https://nodejs.org"],
    relatedIds: ["typescript", "supabase"],
  },
  {
    id: "nextjs",
    kind: "Technology",
    name: "Next.js",
    description: "Framework React enterprise com SSR, SSG e App Router.",
    sameAs: ["https://nextjs.org"],
    relatedIds: ["react", "typescript"],
  },
  {
    id: "postgresql",
    kind: "Technology",
    name: "PostgreSQL",
    description: "Banco relacional robusto com RLS, pgvector e extensibilidade.",
    sameAs: ["https://www.postgresql.org"],
    relatedIds: ["supabase"],
  },
  {
    id: "supabase",
    kind: "Technology",
    name: "Supabase",
    description: "Backend completo open source: auth, DB, storage, edge functions.",
    sameAs: ["https://supabase.com"],
    relatedIds: ["postgresql", "nodejs"],
  },
  {
    id: "openai",
    kind: "Technology",
    name: "OpenAI",
    description: "Plataforma de LLMs (GPT-4, embeddings) para IA generativa.",
    sameAs: ["https://openai.com"],
    relatedIds: ["ai-integration", "chatbots"],
  },
  {
    id: "performance",
    kind: "Concept",
    name: "Performance Web (Core Web Vitals)",
    description: "Conjunto de métricas Google (LCP, INP, CLS) que medem UX real.",
    sameAs: ["https://web.dev/vitals/"],
    relatedIds: ["landing-page", "web-development"],
  },
];

export function getEntityById(id: string): Entity | undefined {
  return ENTITIES.find((e) => e.id === id);
}

export function buildEntityJsonLd() {
  const kindMap: Record<EntityKind, string> = {
    Organization: "Organization",
    Person: "Person",
    Service: "Service",
    Technology: "SoftwareApplication",
    Concept: "DefinedTerm",
    Industry: "Thing",
  };

  return {
    "@context": "https://schema.org",
    "@graph": ENTITIES.map((e) => ({
      "@type": kindMap[e.kind],
      "@id": `${BASE}/#entity-${e.id}`,
      name: e.name,
      alternateName: e.alternateNames,
      description: e.description,
      url: e.url,
      sameAs: e.sameAs,
      ...(e.relatedIds && e.relatedIds.length > 0
        ? { mentions: e.relatedIds.map((id) => ({ "@id": `${BASE}/#entity-${id}` })) }
        : {}),
    })),
  };
}
