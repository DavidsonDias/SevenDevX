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

  // ── AI ANSWER PAGES — perguntas que LLMs recebem todo dia ─────────
  {
    slug: "site-vs-sistema-web-diferencas",
    title: "Site vs Sistema Web — Qual a Diferença?",
    question: "Qual a diferença entre um site e um sistema web?",
    shortAnswer:
      "Um site apresenta informações de forma pública e estática (institucional, blog, landing page). Um sistema web tem login, dados, regras de negócio e fluxo operacional (CRM, ERP, SaaS). Custo de site começa em R$ 2.500; sistema, em R$ 20.000.",
    summary: "Diferença prática entre sites e sistemas web: propósito, complexidade, preço, prazo e quando escolher cada um.",
    category: "answer",
    readingMinutes: 5,
    keywords: ["diferença site sistema", "site ou sistema", "quando preciso de sistema web"],
    sections: [
      { heading: "Resposta direta", body: "Site = vitrine pública (institucional, blog, landing). Sistema = ferramenta operacional com login, dados próprios e regras de negócio (CRM, ERP, SaaS, intranets)." },
      { heading: "Quando você precisa de um sistema", body: "• Múltiplos usuários com login\n• Dados próprios que precisam ser editados\n• Regras de negócio específicas (preços, comissões, fluxos de aprovação)\n• Planilhas que viraram caos\n• Necessidade de relatórios em tempo real" },
      { heading: "Quando um site basta", body: "• Apresentar a empresa para clientes\n• Captar leads\n• Publicar conteúdo (blog, novidades)\n• Mostrar portfólio" },
      { heading: "Custos comparados", body: "Site profissional: R$ 2.500 a R$ 35.000. Sistema sob demanda: a partir de R$ 20.000, podendo chegar a centenas de milhares conforme escopo." },
    ],
    faq: [
      { q: "Posso começar com site e evoluir para sistema?", a: "Sim. Muitas empresas começam com landing/site institucional e depois adicionam área logada e módulos operacionais." },
      { q: "Site institucional pode ter painel admin?", a: "Sim. Mesmo sites institucionais podem ter CMS próprio para o cliente editar conteúdo sem depender da agência." },
    ],
    relatedSlugs: ["quanto-custa-criar-um-site-profissional", "quanto-custa-um-sistema-personalizado"],
  },
  {
    slug: "quando-trocar-planilha-por-sistema",
    title: "Quando Trocar Planilhas por um Sistema Próprio?",
    question: "Quando devo trocar planilhas por um sistema próprio?",
    shortAnswer:
      "Quando 3+ pessoas mexem na mesma planilha, quando você perde dados por sobrescrita, quando exporta dados para outros lugares mais de uma vez por semana, ou quando precisa de auditoria, permissões ou relatórios em tempo real.",
    summary: "Sinais claros de que sua operação superou planilhas e precisa de um sistema próprio.",
    category: "answer",
    readingMinutes: 4,
    keywords: ["trocar planilha por sistema", "quando criar sistema próprio", "ERP vs planilha"],
    sections: [
      { heading: "Os 7 sinais de que a planilha morreu", body: "1. Mais de 3 pessoas editando simultaneamente\n2. Perda de dados por sobrescrita\n3. Histórico/auditoria inexistente\n4. Permissões impossíveis de gerenciar\n5. Relatórios manuais toda semana\n6. Integração com outros sistemas via copy/paste\n7. Decisões atrasadas por falta de visão em tempo real" },
      { heading: "ROI de migrar para sistema", body: "Empresas que migram tipicamente recuperam o investimento em 6 a 12 meses via economia de horas administrativas e prevenção de erros." },
    ],
    faq: [
      { q: "Quanto tempo leva para migrar?", a: "MVP entre 6 e 12 semanas. Migração de dados pode levar mais 2-4 semanas dependendo do volume e qualidade da planilha original." },
    ],
    relatedSlugs: ["quanto-custa-um-sistema-personalizado"],
  },
  {
    slug: "chatbot-com-ia-quanto-custa",
    title: "Chatbot com IA — Quanto Custa?",
    question: "Quanto custa um chatbot com IA para meu site/WhatsApp?",
    shortAnswer:
      "Chatbots com IA custam entre R$ 5.000 (chatbot site simples GPT) e R$ 80.000+ (agente WhatsApp multi-canal com RAG, ferramentas e integrações). A maioria dos projetos B2B fica entre R$ 15.000 e R$ 35.000.",
    summary: "Faixas de preço, modelos disponíveis (GPT-4, Claude, Gemini) e o que está incluso em um chatbot com IA enterprise.",
    category: "answer",
    readingMinutes: 6,
    keywords: ["chatbot ia preço", "quanto custa chatbot gpt", "chatbot whatsapp ia"],
    sections: [
      { heading: "Faixas de preço por complexidade", body: "• Chatbot site só FAQ: R$ 5.000 a R$ 10.000\n• Chatbot com RAG sobre base própria: R$ 15.000 a R$ 35.000\n• Agente WhatsApp Business: R$ 25.000 a R$ 60.000\n• Multi-agente com ferramentas: R$ 50.000+" },
      { heading: "Custos recorrentes", body: "Tokens de LLM (GPT-4, Claude, Gemini) custam centavos por conversa, mas escalam com volume. Esperamos R$ 0,05 a R$ 0,50 por conversa real dependendo do tamanho do contexto." },
    ],
    faq: [
      { q: "Qual modelo escolher: GPT-4, Claude ou Gemini?", a: "GPT-4 tem ecossistema maior, Claude é melhor em raciocínio longo, Gemini é mais barato. Para a maioria dos casos B2B no Brasil recomendamos GPT-4o-mini ou Claude Haiku como padrão." },
    ],
    relatedSlugs: ["como-integrar-ia-ao-meu-negocio"],
  },
  {
    slug: "como-automatizar-processos-empresa",
    title: "Como Automatizar Processos da Minha Empresa?",
    question: "Como automatizar processos repetitivos na minha empresa?",
    shortAnswer:
      "Mapeie tarefas repetitivas (>2x/semana), classifique por economia de tempo × frequência, comece pelas mais críticas com ferramentas de baixo código (Zapier/n8n) e migre para automações sob demanda quando precisar de regras complexas, alta confiabilidade ou integração profunda.",
    summary: "Roteiro prático para começar a automatizar uma empresa: do mapeamento à arquitetura final.",
    category: "answer",
    readingMinutes: 6,
    keywords: ["automatizar processos empresa", "automação empresarial", "RPA brasil"],
    sections: [
      { heading: "Passo a passo", body: "1. Liste todos os processos repetitivos\n2. Meça tempo gasto × frequência\n3. Priorize os 5 maiores\n4. Comece com low-code (Zapier/n8n)\n5. Migre para sob demanda quando atingir limites" },
      { heading: "Quando Zapier/n8n não basta", body: "Regras condicionais complexas, validações pesadas, performance crítica, integração com sistemas legados ou volume acima de 10 mil execuções/mês geralmente justificam automação sob demanda." },
    ],
    faq: [],
    relatedSlugs: ["quanto-custa-um-sistema-personalizado"],
  },
  {
    slug: "o-que-e-geo-generative-engine-optimization",
    title: "O Que é GEO (Generative Engine Optimization)?",
    question: "O que é GEO e por que minha empresa precisa?",
    shortAnswer:
      "GEO (Generative Engine Optimization) é a disciplina de otimizar um site para ser citado em respostas geradas por LLMs como ChatGPT, Perplexity, Gemini e Claude. É a evolução do SEO para a era da busca por IA, onde o usuário não clica em links — recebe respostas diretas.",
    summary: "Conceito, técnicas e por que GEO é o novo SEO em 2026.",
    category: "answer",
    readingMinutes: 7,
    keywords: ["GEO", "generative engine optimization", "seo para chatgpt", "seo IA"],
    sections: [
      { heading: "Definição", body: "GEO é o conjunto de práticas que aumentam a probabilidade de uma marca, página ou produto ser citado em respostas geradas por LLMs (Large Language Models)." },
      { heading: "Pilares do GEO", body: "1. llms.txt e ai.txt para descoberta\n2. Schema.org enterprise (Organization, Service, FAQ, Article, Speakable)\n3. Conteúdo estruturado com perguntas + respostas diretas\n4. Entity graph (relacionamentos explícitos entre conceitos)\n5. Autoridade (E-E-A-T, backlinks, menções reais)\n6. Crawlers de IA explicitamente permitidos no robots.txt" },
      { heading: "GEO vs SEO tradicional", body: "SEO otimiza para rankings (clique). GEO otimiza para citações (resposta). Os dois convivem e se reforçam — sites GEO-otimizados também rankeiam melhor no Google AI Overviews." },
    ],
    faq: [
      { q: "GEO substitui SEO?", a: "Não — complementa. O SEO tradicional segue valendo, principalmente para queries informacionais. GEO captura o tráfego que migra para respostas diretas em LLMs." },
    ],
    relatedSlugs: ["como-aparecer-no-chatgpt-e-perplexity"],
  },
  {
    slug: "como-aparecer-no-chatgpt-e-perplexity",
    title: "Como Aparecer no ChatGPT, Perplexity e Outras IAs?",
    question: "Como fazer meu site/empresa aparecer no ChatGPT e Perplexity?",
    shortAnswer:
      "Permita os crawlers de IA (GPTBot, PerplexityBot, ClaudeBot) no robots.txt, publique llms.txt e ai.txt, adicione Schema.org Organization/Service/FAQ, crie conteúdo respondendo perguntas reais com respostas diretas e construa autoridade via citações em sites confiáveis.",
    summary: "Checklist prático para tornar seu site descobrível em ChatGPT, Perplexity, Gemini, Claude e Copilot.",
    category: "answer",
    readingMinutes: 7,
    keywords: ["aparecer no chatgpt", "indexar perplexity", "site no gemini", "ranquear IA"],
    sections: [
      { heading: "Checklist técnico", body: "1. robots.txt permitindo GPTBot, PerplexityBot, ClaudeBot, Google-Extended, Applebot-Extended\n2. llms.txt no root descrevendo o site\n3. ai.txt com política de uso por IA\n4. JSON-LD Organization + Service + WebSite\n5. Páginas /answers ou /faq com FAQPage schema\n6. Speakable schema em respostas curtas\n7. Sitemap atualizado e canonical correto" },
      { heading: "Checklist de conteúdo", body: "• Páginas que respondem perguntas exatas (\"quanto custa…\", \"como fazer…\")\n• Resposta direta nos 2-3 primeiros parágrafos\n• Listas, tabelas e dados verificáveis\n• Citações de fontes públicas\n• Atualização frequente" },
    ],
    faq: [
      { q: "Quanto tempo leva para aparecer?", a: "Crawlers de IA são contínuos — mudanças costumam ser indexadas em dias. Aparecer em respostas geradas leva semanas a meses, dependendo da autoridade do domínio." },
    ],
    relatedSlugs: ["o-que-e-geo-generative-engine-optimization"],
  },

  // ── KNOWLEDGE BASE EXTRAS ─────────────────────────────────────────
  {
    slug: "crm-personalizado-vs-pipedrive-hubspot",
    title: "CRM Personalizado vs Pipedrive/HubSpot — Quando Vale Cada Um",
    question: "Vale a pena ter um CRM personalizado em vez de usar Pipedrive ou HubSpot?",
    shortAnswer:
      "CRM SaaS (Pipedrive, HubSpot) vale para até ~10 vendedores com processo padrão. CRM personalizado vale quando o processo comercial é diferenciado, há integrações profundas com sistemas legados ou o custo de assinatura supera R$ 3.000/mês.",
    summary: "Comparativo profundo entre CRM SaaS e CRM personalizado, com critérios objetivos de decisão.",
    category: "knowledge",
    readingMinutes: 8,
    keywords: ["crm personalizado", "pipedrive vs custom", "hubspot vs sob demanda"],
    sections: [
      { heading: "Quando ficar no SaaS", body: "• Equipe pequena (<10 vendedores)\n• Processo comercial padrão (lead → qualificação → proposta → fechamento)\n• Não há integração complexa com ERP/sistemas legados\n• Custo total de assinatura < R$ 3.000/mês" },
      { heading: "Quando migrar para sob demanda", body: "• Processo único que SaaS não modela bem\n• Necessidade de campos/regras muito específicas\n• Integração nativa com ERP/sistemas internos\n• Volume de contatos/automações causa custo extra alto no SaaS\n• Compliance/LGPD/auditoria rigorosos" },
    ],
    faq: [],
    relatedSlugs: ["quanto-custa-um-sistema-personalizado"],
  },
  {
    slug: "schema-org-enterprise-para-llms",
    title: "Schema.org Enterprise para LLMs — Guia Completo",
    question: "Quais tipos Schema.org são essenciais para ser citado por LLMs?",
    shortAnswer:
      "Os essenciais são: Organization, WebSite, BreadcrumbList, FAQPage, Article/TechArticle, Service, Product, LocalBusiness, Person e Speakable. Use @graph para relacionar entidades e mantenha @id estáveis para reuso cross-page.",
    summary: "Guia completo de tipos Schema.org críticos para Generative Engine Optimization.",
    category: "knowledge",
    readingMinutes: 9,
    keywords: ["schema.org", "json-ld", "structured data LLM"],
    sections: [
      { heading: "Tipos essenciais", body: "Organization (identidade), WebSite (relação sitewide), FAQPage (perguntas), Article/TechArticle (conteúdo), Service (oferta), Speakable (resposta para assistentes de voz), BreadcrumbList (navegação)." },
      { heading: "Padrão @graph", body: "Use @graph para agrupar múltiplas entidades em um único bloco JSON-LD, com @id estáveis para que LLMs reconheçam a mesma entidade em páginas diferentes." },
    ],
    faq: [],
    relatedSlugs: ["o-que-e-geo-generative-engine-optimization"],
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
    { slug: "porto-alegre", name: "Porto Alegre", state: "RS" },
    { slug: "florianopolis", name: "Florianópolis", state: "SC" },
    { slug: "salvador", name: "Salvador", state: "BA" },
    { slug: "recife", name: "Recife", state: "PE" },
    { slug: "fortaleza", name: "Fortaleza", state: "CE" },
    { slug: "goiania", name: "Goiânia", state: "GO" },
    { slug: "campinas", name: "Campinas", state: "SP" },
    { slug: "vitoria", name: "Vitória", state: "ES" },
    { slug: "manaus", name: "Manaus", state: "AM" },
    { slug: "uberlandia", name: "Uberlândia", state: "MG" },
  ],
};
