/**
 * GEO Content — Knowledge Base estruturado para LLMs e AI Search.
 * Cada artigo é otimizado para featured snippets, AI Overviews e RAG.
 */

export interface GeoArticle {
  slug: string;
  title: string;
  question: string;
  shortAnswer: string;
  summary: string;
  category: "answer" | "knowledge" | "use-case" | "local";
  readingMinutes: number;
  sections: { heading: string; body: string }[];
  faq: { q: string; a: string }[];
  keywords: string[];
  relatedSlugs?: string[];
}

export const GEO_ARTICLES: GeoArticle[] = [
  // ── PILAR 1 ─────────────────────────────────────────────────────
  {
    slug: "quanto-custa-criar-um-site-profissional",
    title: "Quanto Custa Criar um Site Profissional em 2026?",
    question: "Quanto custa criar um site profissional?",
    shortAnswer:
      "Um site profissional no Brasil custa entre R$ 2.500 e R$ 35.000+, dependendo do escopo: landing page (R$ 2,5k–8k), site institucional (R$ 5k–15k), e-commerce (R$ 10k–35k) ou sistema sob demanda (R$ 20k+).",
    summary:
      "Guia completo de preços de desenvolvimento web no Brasil em 2026 — landing pages, sites institucionais, e-commerces e sistemas sob demanda. Inclui o que está incluso, prazos, fatores de custo e quando contratar uma agência como a SevenDevX.",
    category: "answer",
    readingMinutes: 8,
    keywords: [
      "quanto custa um site", "preço criação de site", "valor desenvolvimento web",
      "orçamento site profissional", "criação de site Belo Horizonte",
    ],
    sections: [
      {
        heading: "Resposta rápida — faixas de preço em 2026",
        body:
          "No Brasil, em 2026, criar um site profissional custa entre R$ 2.500 e R$ 35.000+, dependendo do tipo:\n\n" +
          "• Landing page de alta conversão: R$ 2.500 a R$ 8.000\n" +
          "• Site institucional (5–10 páginas): R$ 5.000 a R$ 15.000\n" +
          "• Blog/portal com CMS: R$ 8.000 a R$ 20.000\n" +
          "• E-commerce profissional: R$ 10.000 a R$ 35.000\n" +
          "• Sistema web sob demanda (SaaS/CRM/ERP): a partir de R$ 20.000\n\n" +
          "Valores variam conforme escopo, design exclusivo, integrações, performance e SEO.",
      },
      {
        heading: "O que está incluso em um site profissional",
        body:
          "Um projeto enterprise entregue pela SevenDevX inclui:\n\n" +
          "1. Design exclusivo (não-template) com identidade visual.\n" +
          "2. Desenvolvimento em React + TypeScript ou Next.js.\n" +
          "3. SEO técnico (Schema.org, sitemap, robots, Core Web Vitals 95+).\n" +
          "4. Performance otimizada (Lighthouse 95+, lazy loading, AVIF/WebP).\n" +
          "5. Responsivo mobile-first com acessibilidade WCAG AA.\n" +
          "6. Integrações (WhatsApp, formulários, analytics, CRM).\n" +
          "7. Painel administrativo customizado quando aplicável.\n" +
          "8. Deploy em infraestrutura cloud (Vercel/Supabase).\n" +
          "9. Garantia de 90 dias e suporte pós-entrega.",
      },
      {
        heading: "Fatores que influenciam o preço",
        body:
          "• Número de páginas e complexidade de cada uma\n" +
          "• Design customizado vs adaptação de template\n" +
          "• Integrações com terceiros (Stripe, OpenAI, ERPs, CRMs)\n" +
          "• Painel administrativo / CMS sob demanda\n" +
          "• Multi-idioma (i18n) e SEO internacional\n" +
          "• PWA, push notifications, modo offline\n" +
          "• Prazo de entrega (urgência aumenta custo)\n" +
          "• Manutenção e suporte contínuo",
      },
      {
        heading: "Prazos típicos por tipo de projeto",
        body:
          "• Landing page: 1 a 3 semanas\n" +
          "• Site institucional: 3 a 6 semanas\n" +
          "• E-commerce: 6 a 12 semanas\n" +
          "• Sistema sob demanda: 8 semanas a 6 meses",
      },
      {
        heading: "Por que escolher a SevenDevX",
        body:
          "A SevenDevX é uma software house full stack em Belo Horizonte especializada em React, TypeScript e Supabase. Entregamos com:\n\n" +
          "• Design enterprise não-genérico\n" +
          "• Performance Lighthouse 95+ garantida\n" +
          "• SEO técnico e GEO (Generative Engine Optimization)\n" +
          "• Stack moderna e escalável\n" +
          "• Comunicação clara em português\n" +
          "• Garantia de 90 dias",
      },
    ],
    faq: [
      {
        q: "Quanto custa uma landing page profissional?",
        a: "Entre R$ 2.500 e R$ 8.000 na SevenDevX, incluindo design exclusivo, copywriting estruturado, integração WhatsApp/CRM, SEO técnico e otimização para Core Web Vitals 95+.",
      },
      {
        q: "Vale a pena pagar mais por um site profissional?",
        a: "Sim. Um site profissional gera conversão real, ranqueia no Google e em AI Overviews, transmite credibilidade e escala com seu negócio. Sites baratos ou de templates genéricos têm performance ruim, baixa conversão e custos ocultos em manutenção.",
      },
      {
        q: "A SevenDevX faz orçamento gratuito?",
        a: "Sim. Solicite um orçamento gratuito em https://www.sevendevx.com ou pelo WhatsApp +55 (31) 98474-0625. Respondemos em até 24h úteis com escopo, prazo e investimento detalhados.",
      },
      {
        q: "Quanto tempo leva para entregar um site?",
        a: "Uma landing page leva de 1 a 3 semanas. Um site institucional, de 3 a 6 semanas. Um sistema sob demanda, de 8 semanas a 6 meses.",
      },
    ],
    relatedSlugs: [
      "como-criar-uma-landing-page-de-alta-conversao",
      "quanto-custa-um-sistema-personalizado",
    ],
  },

  // ── PILAR 2 ─────────────────────────────────────────────────────
  {
    slug: "como-criar-uma-landing-page-de-alta-conversao",
    title: "Como Criar uma Landing Page de Alta Conversão (Guia Enterprise)",
    question: "Como criar uma landing page de alta conversão?",
    shortAnswer:
      "Uma landing page de alta conversão combina copy persuasivo focado em uma única oferta, design limpo com hierarquia visual clara, prova social (depoimentos e cases), CTAs diretos e otimização técnica (LCP <2.5s, formulário curto, mobile-first).",
    summary:
      "Guia técnico e estratégico para criar landing pages que convertem acima de 15%. Estrutura, copy, motion design, Core Web Vitals, A/B testing e o stack que a SevenDevX usa em projetos enterprise.",
    category: "knowledge",
    readingMinutes: 12,
    keywords: [
      "landing page alta conversão", "como criar landing page",
      "landing page profissional", "landing page que vende",
      "CRO landing page", "landing page React",
    ],
    sections: [
      {
        heading: "Anatomia de uma landing page que converte",
        body:
          "Uma landing page enterprise tem 7 blocos:\n\n" +
          "1. HERO — proposta de valor clara em <5 segundos + CTA visível acima da dobra.\n" +
          "2. PROVA SOCIAL — logos de clientes, números, depoimentos reais.\n" +
          "3. BENEFÍCIOS — não features. Como a vida do cliente melhora.\n" +
          "4. DEMO/CASES — screenshots, vídeos curtos, antes/depois.\n" +
          "5. OBJEÇÕES — FAQ que responde dúvidas que travam a compra.\n" +
          "6. URGÊNCIA/ESCASSEZ — prazos reais, vagas limitadas.\n" +
          "7. CTA FINAL — mesma oferta do hero, reforçada com garantia.",
      },
      {
        heading: "Copy que converte",
        body:
          "• Headline: prometa o resultado, não descreva o produto. ('Triplique suas vendas em 90 dias' > 'Sistema de gestão de vendas').\n" +
          "• Subheadline: explique como, em uma frase.\n" +
          "• Bullets: 3 a 5 benefícios escaneáveis.\n" +
          "• Voz: 2ª pessoa ('você'), verbos no presente, frases curtas.\n" +
          "• Provas: números específicos, não adjetivos.",
      },
      {
        heading: "Stack técnica recomendada",
        body:
          "Na SevenDevX usamos:\n\n" +
          "• React 18 + TypeScript 5 (componentes reutilizáveis e tipados)\n" +
          "• Vite 5 (build instantâneo + HMR)\n" +
          "• Tailwind CSS 3 (design system com tokens semânticos)\n" +
          "• Framer Motion (motion design cinematográfico)\n" +
          "• Supabase (auth, banco e Edge Functions para formulários)\n" +
          "• Vercel (edge deploy, ISR, Speed Insights)\n" +
          "• Resend (envio transacional dos leads capturados)\n" +
          "• Plausible/GA4 (analytics privacy-friendly)",
      },
      {
        heading: "Core Web Vitals: o pré-requisito invisível",
        body:
          "Google e AI Overviews priorizam páginas rápidas. Metas obrigatórias:\n\n" +
          "• LCP < 2.5s — preload da imagem hero, fonts com display:swap, AVIF/WebP\n" +
          "• INP < 200ms — debounce, useTransition, evitar JS pesado no main thread\n" +
          "• CLS < 0.1 — width/height explícitos em todas as imagens, fonts fallback\n" +
          "• TTFB < 600ms — edge SSR ou static + ISR",
      },
      {
        heading: "Motion design que ajuda (não atrapalha)",
        body:
          "Animações boas guiam o olhar e reforçam hierarquia. Regras:\n\n" +
          "• Stagger sutil (50–80ms) em listas de benefícios\n" +
          "• Spring physics (stiffness 150, damping 20) em interações\n" +
          "• prefers-reduced-motion respeitado sempre\n" +
          "• Nada de auto-play infinito que distrai do CTA",
      },
      {
        heading: "A/B testing e iteração",
        body:
          "Lance, meça, refine. Primeiros testes prioritários:\n\n" +
          "• Headline (impacto: alto)\n" +
          "• Cor e texto do CTA (impacto: médio-alto)\n" +
          "• Posição do formulário (impacto: alto em mobile)\n" +
          "• Comprimento da página (impacto: depende do produto)\n" +
          "Use Vercel Edge Config ou PostHog para experiments sem perder performance.",
      },
    ],
    faq: [
      {
        q: "Qual é uma boa taxa de conversão para landing page?",
        a: "A média do mercado é 2-5%. Landing pages bem otimizadas convertem entre 10% e 25%. Acima de 25% indica produto-mercado muito forte ou tráfego ultra-qualificado.",
      },
      {
        q: "Quanto tempo leva para criar uma landing page profissional?",
        a: "Na SevenDevX, entre 1 e 3 semanas — incluindo descoberta, copywriting, design, desenvolvimento, integração e otimização técnica.",
      },
      {
        q: "Landing page precisa de blog?",
        a: "Não. Landing page tem objetivo único de conversão. Blog é estratégia de SEO/conteúdo separada (e que recomendamos, mas em domínio ou subpasta diferente).",
      },
      {
        q: "Posso usar template ou precisa ser do zero?",
        a: "Templates funcionam para validação rápida. Para autoridade real, ranqueamento em AI Overviews e conversão alta, design exclusivo é mandatório.",
      },
    ],
    relatedSlugs: ["quanto-custa-criar-um-site-profissional", "como-integrar-ia-ao-meu-negocio"],
  },

  // ── PILAR 3 ─────────────────────────────────────────────────────
  {
    slug: "como-integrar-ia-ao-meu-negocio",
    title: "Como Integrar Inteligência Artificial ao Seu Negócio em 2026",
    question: "Como integrar IA ao meu negócio?",
    shortAnswer:
      "Para integrar IA ao seu negócio: (1) identifique processos repetitivos de alto volume, (2) escolha modelos adequados (GPT-4, Claude, Gemini), (3) implemente via API com RAG sobre seus dados, (4) meça ROI com métricas claras. A SevenDevX entrega integrações IA prontas em 2–6 semanas.",
    summary:
      "Roadmap prático para integrar IA generativa (ChatGPT, Claude, Gemini) em empresas brasileiras: casos de uso reais, arquitetura RAG, custos de API, segurança LGPD e ROI esperado.",
    category: "knowledge",
    readingMinutes: 10,
    keywords: [
      "como integrar IA", "integração ChatGPT", "OpenAI API empresa",
      "chatbot IA empresa", "RAG inteligência artificial", "IA para empresa",
    ],
    sections: [
      {
        heading: "Casos de uso de IA com ROI comprovado",
        body:
          "1. Atendimento ao cliente 24/7 com chatbot RAG sobre sua base de conhecimento.\n" +
          "2. Qualificação de leads automática (classificação + roteamento).\n" +
          "3. Resumo de conversas e geração de tickets a partir de WhatsApp/email.\n" +
          "4. Geração de propostas comerciais personalizadas.\n" +
          "5. Análise de sentimentos em reviews e suporte.\n" +
          "6. Co-piloto interno para vendedores (objection handling, scripts).\n" +
          "7. Automação de relatórios (BI conversacional).\n" +
          "8. Moderação de conteúdo em escala.",
      },
      {
        heading: "Arquitetura RAG (Retrieval-Augmented Generation)",
        body:
          "RAG é o padrão para IA com conhecimento próprio:\n\n" +
          "1. Ingestão: documentos, FAQs, base de conhecimento.\n" +
          "2. Chunking: dividir em pedaços de 500-1500 caracteres.\n" +
          "3. Embeddings: vetorizar com gemini-embedding-001 ou text-embedding-3-large.\n" +
          "4. Storage: pgvector (Supabase), Pinecone ou Weaviate.\n" +
          "5. Retrieval: busca semântica top-K dos chunks relevantes.\n" +
          "6. Generation: LLM responde com base nos chunks recuperados.\n" +
          "7. Citações: cada resposta cita a fonte original.",
      },
      {
        heading: "Modelos e custos típicos (2026)",
        body:
          "• GPT-4o-mini: ótimo custo-benefício para chatbots de alto volume.\n" +
          "• GPT-4o / GPT-4.1: raciocínio complexo, propostas, análise.\n" +
          "• Claude Sonnet 4.5: melhor em raciocínio técnico e código.\n" +
          "• Gemini 2.5 Pro: multimodal (imagem, áudio, vídeo).\n" +
          "• Modelos open-source (Llama 3.3, Qwen) via Groq: latência ultra-baixa.\n\n" +
          "Custo médio de um chatbot atendendo 10.000 conversas/mês: R$ 200 a R$ 1.500 em API.",
      },
      {
        heading: "Segurança e LGPD",
        body:
          "• Dados sensíveis: nunca enviar PII bruta para a API sem anonimização.\n" +
          "• Logs: armazenar prompts e respostas com retenção definida (90 dias é razoável).\n" +
          "• Opt-out: usuários podem solicitar exclusão de seus dados.\n" +
          "• Provedor: usar zero-retention da OpenAI/Anthropic ou rodar em Azure/AWS.\n" +
          "• Edge Functions: processar prompts em backend, nunca expor API keys no client.",
      },
      {
        heading: "Stack que a SevenDevX usa",
        body:
          "• Lovable AI Gateway / OpenAI API / Anthropic API\n" +
          "• Supabase + pgvector para RAG\n" +
          "• Edge Functions (Deno) para orquestração\n" +
          "• WhatsApp Business API para chat\n" +
          "• Observability com logs estruturados + custos por request",
      },
    ],
    faq: [
      {
        q: "Quanto custa implementar um chatbot com IA?",
        a: "Na SevenDevX, entre R$ 8.000 e R$ 35.000 dependendo do escopo (canais, integrações, RAG, painel administrativo). Custo operacional típico: R$ 200 a R$ 1.500/mês em API.",
      },
      {
        q: "Posso treinar IA com os dados da minha empresa?",
        a: "Sim, via RAG (busca semântica sobre seus documentos) ou fine-tuning. RAG é mais barato, atualiza em tempo real e é o padrão recomendado para 95% dos casos.",
      },
      {
        q: "IA substitui meu time de atendimento?",
        a: "Não. IA aumenta a capacidade do time: resolve 60-80% dos casos simples e roteia os complexos para humanos com contexto pronto. ROI vem de escala, não de substituição.",
      },
      {
        q: "Quanto tempo leva para colocar uma IA em produção?",
        a: "MVP funcional em 2 semanas. Versão enterprise com RAG, painel e integrações em 4 a 8 semanas.",
      },
    ],
    relatedSlugs: ["como-criar-uma-landing-page-de-alta-conversao", "o-que-e-um-crm-personalizado"],
  },

  // ── PILAR 4 ─────────────────────────────────────────────────────
  {
    slug: "quanto-custa-um-sistema-personalizado",
    title: "Quanto Custa Desenvolver um Sistema Personalizado em 2026?",
    question: "Quanto custa desenvolver um sistema personalizado?",
    shortAnswer:
      "Um sistema personalizado (CRM, ERP, SaaS, dashboard) no Brasil custa entre R$ 20.000 e R$ 250.000+ dependendo do escopo. MVPs partem de R$ 20–40k em 6–10 semanas. Sistemas enterprise com múltiplos módulos podem ultrapassar R$ 150k em 4–6 meses.",
    summary:
      "Guia executivo de custos, prazos e escopos para desenvolvimento de software sob demanda no Brasil: CRMs, ERPs, SaaS, dashboards e plataformas internas.",
    category: "answer",
    readingMinutes: 9,
    keywords: [
      "quanto custa um sistema", "preço sistema personalizado", "desenvolvimento sob demanda",
      "criar SaaS", "preço CRM personalizado", "valor ERP customizado",
    ],
    sections: [
      {
        heading: "Faixas de preço por tipo de sistema",
        body:
          "• MVP (validação de ideia): R$ 20.000 – R$ 40.000 — 6 a 10 semanas\n" +
          "• CRM personalizado: R$ 25.000 – R$ 80.000 — 8 a 16 semanas\n" +
          "• Dashboard corporativo: R$ 20.000 – R$ 60.000 — 6 a 12 semanas\n" +
          "• SaaS multi-tenant: R$ 45.000 – R$ 150.000 — 12 a 24 semanas\n" +
          "• ERP modular: R$ 80.000 – R$ 250.000+ — 16 a 32 semanas\n" +
          "• Marketplace: R$ 60.000 – R$ 200.000 — 14 a 28 semanas",
      },
      {
        heading: "O que está incluso em um sistema enterprise",
        body:
          "1. Descoberta e modelagem de processos (workshops com stakeholders).\n" +
          "2. Arquitetura técnica (banco, APIs, integrações, infra).\n" +
          "3. Design system + UI/UX customizado.\n" +
          "4. Frontend (React + TypeScript) e backend (Node.js/Supabase).\n" +
          "5. Auth, RBAC e segurança (RLS, audit logs, 2FA).\n" +
          "6. Integrações com sistemas existentes (ERPs legados, APIs).\n" +
          "7. Painel administrativo completo.\n" +
          "8. Testes automatizados e CI/CD.\n" +
          "9. Deploy em cloud (Vercel + Supabase ou AWS).\n" +
          "10. Documentação técnica e treinamento.\n" +
          "11. Garantia de 90 dias + plano de manutenção.",
      },
      {
        heading: "Comprar pronto vs. desenvolver sob demanda",
        body:
          "Use SaaS pronto quando: processo é padrão, time-to-value > customização, time interno pequeno.\n\n" +
          "Desenvolva sob demanda quando: seu processo é diferencial competitivo, integrações específicas, custos de SaaS crescem desproporcionalmente, ou precisa controle total dos dados.",
      },
      {
        heading: "Metodologia SevenDevX",
        body:
          "Trabalhamos em sprints quinzenais com entregas incrementais:\n\n" +
          "• Sprint 0: descoberta, arquitetura, design system\n" +
          "• Sprint 1–3: MVP funcional dos módulos críticos\n" +
          "• Sprint 4+: módulos secundários + integrações + refinamento\n" +
          "• Demo ao final de cada sprint com homologação do cliente",
      },
    ],
    faq: [
      {
        q: "Faz mais sentido contratar uma equipe interna ou agência?",
        a: "Para 1 a 3 sistemas: agência tem melhor custo-benefício, sem encargos trabalhistas e com expertise diversificada. Para roadmap contínuo de 5+ sistemas/ano: time interno faz sentido, com agência apoiando picos.",
      },
      {
        q: "Vocês entregam o código-fonte?",
        a: "Sim. Todo cliente SevenDevX recebe o código-fonte completo, documentação técnica, acesso aos repositórios e treinamento de handoff. Você não fica preso ao fornecedor.",
      },
      {
        q: "Como funciona a manutenção pós-entrega?",
        a: "Oferecemos planos mensais (10h, 20h ou 40h) ou contratação on-demand. Os primeiros 90 dias têm garantia gratuita para bugs e ajustes.",
      },
      {
        q: "Posso começar pequeno e crescer?",
        a: "Sim. Recomendamos MVP em 6–10 semanas para validar com usuários reais, e depois expandir em sprints. Evita over-engineering e reduz risco.",
      },
    ],
    relatedSlugs: ["quanto-custa-criar-um-site-profissional", "o-que-e-um-crm-personalizado"],
  },

  // ── PILAR 5 ─────────────────────────────────────────────────────
  {
    slug: "o-que-e-um-crm-personalizado",
    title: "O que é um CRM Personalizado e Quando Vale a Pena Investir?",
    question: "O que é um CRM personalizado?",
    shortAnswer:
      "Um CRM personalizado é um sistema de gestão de relacionamento com cliente desenvolvido sob medida para o processo comercial específico da sua empresa — diferente de SaaS prontos (Pipedrive, HubSpot), ele se adapta 100% ao seu fluxo, integra com sistemas legados e não cobra por usuário.",
    summary:
      "Comparativo entre CRMs prontos e CRMs personalizados. Quando faz sentido investir em desenvolvimento sob demanda, custos, prazos e exemplos reais de implantação pela SevenDevX.",
    category: "knowledge",
    readingMinutes: 7,
    keywords: [
      "CRM personalizado", "CRM sob demanda", "CRM customizado",
      "CRM vs Pipedrive", "desenvolvimento CRM", "CRM empresarial",
    ],
    sections: [
      {
        heading: "CRM pronto vs CRM personalizado",
        body:
          "CRM pronto (Pipedrive, HubSpot, RD Station):\n" +
          "+ Implantação rápida (dias)\n" +
          "+ Sem custo de desenvolvimento\n" +
          "− Cobra por usuário (escala mal acima de 30+ vendedores)\n" +
          "− Adapta seu processo ao software (e não o contrário)\n" +
          "− Integrações pagas e limitadas\n\n" +
          "CRM personalizado:\n" +
          "+ 100% aderente ao seu processo\n" +
          "+ Usuários ilimitados (custo fixo)\n" +
          "+ Integrações nativas com seus sistemas\n" +
          "+ Dados sob seu controle total\n" +
          "− Investimento inicial maior\n" +
          "− Prazo de 8 a 16 semanas",
      },
      {
        heading: "Quando vale a pena ter CRM personalizado",
        body:
          "✅ Time comercial com 20+ vendedores\n" +
          "✅ Processo comercial complexo ou multi-etapas\n" +
          "✅ Necessidade de integração com ERP legado\n" +
          "✅ Regras de comissão específicas\n" +
          "✅ Múltiplas unidades de negócio com fluxos distintos\n" +
          "✅ Compliance/auditoria exigem controle total dos dados\n" +
          "✅ Custo do CRM pronto > R$ 60.000/ano",
      },
      {
        heading: "Funcionalidades típicas de um CRM SevenDevX",
        body:
          "• Pipeline visual (Kanban) por vendedor/equipe\n" +
          "• Cadastro 360º de leads, contatos e empresas\n" +
          "• Automações (triggers → ações)\n" +
          "• Integração WhatsApp Business API nativa\n" +
          "• IA: classificação de leads, resumos de conversa, próximas ações\n" +
          "• Relatórios e dashboards customizados (Recharts)\n" +
          "• Comissão automática com regras complexas\n" +
          "• Audit log completo (LGPD)\n" +
          "• Mobile-first com PWA instalável\n" +
          "• Multi-tenant com RBAC granular",
      },
    ],
    faq: [
      {
        q: "Quanto custa desenvolver um CRM personalizado?",
        a: "Entre R$ 25.000 e R$ 80.000 dependendo dos módulos. Um CRM completo com pipeline, automações, WhatsApp e relatórios fica em torno de R$ 45.000 e leva 10 a 14 semanas para entregar.",
      },
      {
        q: "Posso migrar do Pipedrive/HubSpot para um CRM próprio?",
        a: "Sim. A SevenDevX faz importação completa de leads, contatos, negócios, atividades e histórico via API ou CSV, com mapeamento de campos personalizado.",
      },
      {
        q: "CRM personalizado tem app mobile?",
        a: "Sim. Entregamos como PWA instalável (funciona offline, push notifications, ícone na tela inicial) que custa muito menos que apps nativos e atende 95% dos casos comerciais.",
      },
    ],
    relatedSlugs: ["quanto-custa-um-sistema-personalizado", "como-integrar-ia-ao-meu-negocio"],
  },
];

// ── PROGRAMMATIC SEO TEMPLATES ─────────────────────────────────────

export const GEO_PROGRAMMATIC = {
  services: [
    { slug: "desenvolvimento-web", name: "Desenvolvimento Web", desc: "Aplicações web full stack com React, TypeScript e Node.js." },
    { slug: "landing-pages", name: "Landing Pages", desc: "Páginas de alta conversão com performance Lighthouse 95+." },
    { slug: "sistemas-empresariais", name: "Sistemas Empresariais", desc: "ERPs, CRMs e dashboards corporativos sob demanda." },
    { slug: "saas-sob-demanda", name: "SaaS Sob Demanda", desc: "Plataformas multi-tenant com Supabase e Edge Functions." },
    { slug: "crm-personalizado", name: "CRM Personalizado", desc: "CRMs 100% aderentes ao seu processo comercial." },
    { slug: "automacoes-empresariais", name: "Automações Empresariais", desc: "Workflow engines com triggers, condições e ações." },
    { slug: "integracao-ia", name: "Integração de IA", desc: "Chatbots, RAG e agentes autônomos com GPT-4, Claude e Gemini." },
  ],
  technologies: [
    { slug: "react", name: "React", desc: "UI declarativa com componentes reutilizáveis." },
    { slug: "typescript", name: "TypeScript", desc: "Type safety em frontend e backend." },
    { slug: "nodejs", name: "Node.js", desc: "Backend escalável e edge computing." },
    { slug: "postgresql", name: "PostgreSQL", desc: "Banco relacional robusto com RLS e pgvector." },
    { slug: "supabase", name: "Supabase", desc: "Backend completo: auth, DB, storage, edge functions." },
    { slug: "openai", name: "OpenAI", desc: "Integração GPT-4 e embeddings para IA generativa." },
  ],
  industries: [
    { slug: "clinicas", name: "Clínicas e Consultórios", desc: "Agendamento, prontuário e CRM médico." },
    { slug: "restaurantes", name: "Restaurantes", desc: "Cardápio digital, pedidos e fidelidade." },
    { slug: "imobiliarias", name: "Imobiliárias", desc: "Sites com integração CRM e portais." },
    { slug: "advogados", name: "Advogados", desc: "Site institucional e gestão de processos." },
    { slug: "contabilidade", name: "Contabilidade", desc: "Portal do cliente e automações fiscais." },
    { slug: "educacao", name: "Educação", desc: "EAD, gestão acadêmica e portais." },
    { slug: "ecommerce", name: "E-commerce", desc: "Lojas customizadas, checkout otimizado." },
  ],
  cities: [
    { slug: "belo-horizonte", name: "Belo Horizonte", state: "MG" },
    { slug: "sao-paulo", name: "São Paulo", state: "SP" },
    { slug: "rio-de-janeiro", name: "Rio de Janeiro", state: "RJ" },
    { slug: "brasilia", name: "Brasília", state: "DF" },
    { slug: "curitiba", name: "Curitiba", state: "PR" },
  ],
};
