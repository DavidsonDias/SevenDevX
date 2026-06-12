/**
 * 📁 Case Studies — fonte autoritativa de cases reais SevenDevX.
 * Usado por /cases e /cases/:slug com schema CaseStudy + CreativeWork.
 */

export interface CaseStudy {
  slug: string;
  title: string;
  client: string;
  industry: string;
  summary: string;
  problem: string;
  solution: string;
  outcome: string;
  metrics: { label: string; value: string }[];
  technologies: string[];
  services: string[];
  duration: string;
  liveUrl?: string;
  imageHint: string;
  publishedAt: string;
}

export const CASE_STUDIES: CaseStudy[] = [
  {
    slug: "psicoone-plataforma-psicologia-clinica",
    title: "PsicoOne — plataforma SaaS de prontuário psicológico digital",
    client: "PsicoOne",
    industry: "Saúde Mental / SaaS",
    summary:
      "Plataforma multi-tenant para psicólogos clínicos gerenciarem pacientes, sessões, prontuários, evolução, financeiro e prescrições.",
    problem:
      "Psicólogos autônomos e clínicas usam planilhas, papel ou ferramentas genéricas (Google Drive, Trello) que não atendem LGPD, sigilo profissional e exigências do CFP. Não há fluxo unificado de prontuário evolutivo, agendamento e cobrança.",
    solution:
      "Desenvolvemos uma plataforma SaaS multi-tenant em React + TypeScript + Supabase com RLS rigoroso por tenant, criptografia em repouso, agenda integrada com Google Calendar, prontuário SOAP versionado, dashboard financeiro e exportação LGPD. UI premium com Framer Motion e dark mode.",
    outcome:
      "Lançamento em 12 semanas com onboarding self-service, pipeline de assinaturas Stripe e zero incidentes de segurança em produção. Adotada por psicólogos em múltiplos estados.",
    metrics: [
      { label: "Tempo até MVP", value: "12 semanas" },
      { label: "Conformidade", value: "LGPD + CFP" },
      { label: "Lighthouse", value: "97/100" },
      { label: "Uptime", value: "99.95%" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "PostgreSQL", "Stripe", "Tailwind CSS", "Framer Motion"],
    services: ["SaaS Sob Demanda", "Desenvolvimento Web", "Integração de Pagamentos"],
    duration: "12 semanas",
    liveUrl: "https://psicoone.com.br",
    imageHint: "PsicoOne",
    publishedAt: "2026-02-15",
  },
  {
    slug: "george-fiuza-site-institucional-advocacia",
    title: "George Fiuza Advocacia — site institucional premium",
    client: "George Fiuza Advocacia",
    industry: "Jurídico",
    summary:
      "Site institucional sofisticado para escritório de advocacia empresarial com áreas de atuação, equipe, blog jurídico e captação qualificada.",
    problem:
      "Escritório com forte presença regional dependia de indicação. Não tinha autoridade digital, nem canal de captação online compatível com o porte da banca.",
    solution:
      "Site institucional em React + TypeScript com design editorial sério, motion design discreto, blog jurídico com Schema.org Article, formulários LGPD-compliant, integração WhatsApp Business e SEO técnico completo.",
    outcome:
      "Tráfego orgânico crescente, leads qualificados via formulário e WhatsApp, e percepção de autoridade alinhada ao posicionamento da banca.",
    metrics: [
      { label: "Lighthouse", value: "98/100" },
      { label: "Tempo de carga", value: "<1s" },
      { label: "SEO score", value: "100/100" },
    ],
    technologies: ["React", "TypeScript", "Tailwind CSS", "Framer Motion", "Supabase"],
    services: ["Site Institucional", "SEO Técnico", "Integração WhatsApp"],
    duration: "4 semanas",
    imageHint: "GeorgeFiuza",
    publishedAt: "2026-01-20",
  },
  {
    slug: "foodopsx-gestao-restaurantes",
    title: "FoodOpsX — sistema de gestão operacional para restaurantes",
    client: "FoodOpsX",
    industry: "Food Service",
    summary:
      "Sistema completo de gestão para restaurantes: cardápio digital, comandas, cozinha, estoque, fornecedores e BI operacional.",
    problem:
      "Restaurantes de médio porte usavam 4+ softwares desconexos (PDV, estoque, delivery, financeiro). Perda de margem por desperdício, retrabalho e relatórios inexistentes.",
    solution:
      "Sistema unificado em React + Supabase + Edge Functions. Cardápio digital com QR code, KDS para cozinha em tempo real, gestão de estoque com alertas, integração com iFood/Rappi e dashboard de margem por prato.",
    outcome:
      "Redução de 23% no desperdício, fechamento de caixa 4x mais rápido e visibilidade de margem por prato/horário.",
    metrics: [
      { label: "Desperdício -", value: "23%" },
      { label: "Fechamento caixa", value: "4x mais rápido" },
      { label: "Módulos unificados", value: "7 em 1" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "PostgreSQL", "Edge Functions", "PWA"],
    services: ["Sistema Empresarial", "PWA", "Integração APIs"],
    duration: "16 semanas",
    imageHint: "FoodOpsX",
    publishedAt: "2025-12-10",
  },
  {
    slug: "acaios-franquia-acai-multi-unidade",
    title: "AçaíOS — gestão multi-unidade para franquia de açaí",
    client: "AçaíOS",
    industry: "Franquia / Food",
    summary:
      "Plataforma centralizada para franquia de açaí com gestão de unidades, padronização de cardápio, ranking de lojas e BI consolidado.",
    problem:
      "Franqueador sem visibilidade real das unidades, padronização inconsistente e dificuldade de comparar performance entre lojas.",
    solution:
      "App multi-tenant com hierarquia franqueador → franqueado → loja, dashboards consolidados, alertas de queda de venda, biblioteca de receitas/preços centralizada e gamificação entre unidades.",
    outcome:
      "Padronização total das unidades, ranking competitivo aumentou ticket médio em 14% e tempo de decisão do franqueador caiu para minutos.",
    metrics: [
      { label: "Ticket médio +", value: "14%" },
      { label: "Unidades conectadas", value: "100%" },
      { label: "Setup nova loja", value: "<1 dia" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "PostgreSQL", "Recharts"],
    services: ["SaaS Multi-tenant", "BI", "Mobile PWA"],
    duration: "20 semanas",
    imageHint: "AcaiOS",
    publishedAt: "2025-11-05",
  },
  {
    slug: "homeos-automacao-residencial",
    title: "HomeOS — dashboard de automação residencial",
    client: "HomeOS",
    industry: "IoT / Smart Home",
    summary:
      "Painel web unificado para controle de dispositivos smart home (luzes, climatização, segurança) com integrações nativas.",
    problem:
      "Usuários com 5+ apps separados para controlar dispositivos de marcas diferentes. UX fragmentada e sem cenários cross-device.",
    solution:
      "PWA com integrações Tuya, Sonoff, Philips Hue e câmeras RTSP. Editor de cenários, automações por horário/sensor, controle por voz e dashboard em tempo real via WebSocket.",
    outcome:
      "App único substituindo 6 nativos, cenários complexos viabilizados e adoção dentro de smart homes residenciais.",
    metrics: [
      { label: "Apps substituídos", value: "6" },
      { label: "Latência comando", value: "<200ms" },
      { label: "Dispositivos suportados", value: "40+" },
    ],
    technologies: ["React", "TypeScript", "WebSockets", "Supabase", "PWA"],
    services: ["PWA", "Integrações IoT", "Real-time"],
    duration: "14 semanas",
    imageHint: "HomeOS",
    publishedAt: "2025-09-22",
  },
  {
    slug: "githubpro-viewer-perfis-github",
    title: "GitHub Pro Viewer — analisador visual de perfis GitHub",
    client: "Produto interno",
    industry: "DevTools",
    summary:
      "Ferramenta web para visualização avançada de perfis GitHub: stats, linguagens, contribuições, heatmap e comparação entre devs.",
    problem:
      "GitHub nativo oferece visualizações limitadas. Recruiters e devs queriam uma análise visual rica e shareável de perfis.",
    solution:
      "App Next.js consumindo GitHub API com gráficos D3.js, exportação para PDF, comparação multi-perfil e SEO por perfil público.",
    outcome:
      "Produto orgânico com tráfego SEO crescente e usuários voltando para comparar perfis e exportar relatórios.",
    metrics: [
      { label: "Lighthouse", value: "99/100" },
      { label: "API requests/s", value: "100+" },
    ],
    technologies: ["Next.js", "TypeScript", "D3.js", "GitHub API"],
    services: ["Desenvolvimento Web", "Data Viz"],
    duration: "6 semanas",
    imageHint: "GithubProViewer",
    publishedAt: "2025-08-12",
  },
];

export function getCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
