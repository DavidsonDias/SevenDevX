/**
 * caseStudies.ts — SevenDevX
 * ─────────────────────────────────────────────────────────────────────
 * @file src/data/caseStudies.ts
 * @module Content
 *
 * @description
 * Estudos de caso publicados nas páginas GEO.
 *
 * @see src/data/README.md
 * ─────────────────────────────────────────────────────────────────────
 */

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
  {
    slug: "cleansweep-gestao-servicos-limpeza",
    title: "CleanSweep — plataforma de gestão para empresas de limpeza",
    client: "CleanSweep",
    industry: "Facilities / Serviços",
    summary:
      "Sistema para empresas de limpeza profissional gerenciarem clientes, contratos, equipes, escalas, checklists e faturamento recorrente.",
    problem:
      "Operações de limpeza dependem de planilhas e WhatsApp para escala de equipe, controle de presença e checklists por cliente. Resultado: retrabalho, falhas de SLA e dificuldade de cobrar contratos recorrentes.",
    solution:
      "Plataforma web + PWA mobile para supervisores em campo. Escalas drag-and-drop, check-in com geolocalização, checklists por contrato com fotos e geração automática de faturas mensais com integração ASAAS.",
    outcome:
      "SLA mensurável por contrato, redução de 31% nas reclamações de cliente e faturamento recorrente automatizado.",
    metrics: [
      { label: "Reclamações -", value: "31%" },
      { label: "Faturamento auto", value: "100%" },
      { label: "Supervisores em campo", value: "PWA" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "PWA", "Geolocation API"],
    services: ["Sistema Empresarial", "PWA", "Integração de Pagamentos"],
    duration: "14 semanas",
    imageHint: "CleanSweep",
    publishedAt: "2026-03-08",
  },
  {
    slug: "logix-rastreamento-frota-logistica",
    title: "Logix — rastreamento e despacho para transportadoras",
    client: "Logix Transportes",
    industry: "Logística",
    summary:
      "Painel de despacho com rastreamento em tempo real, otimização de rotas, controle de combustível e portal do embarcador.",
    problem:
      "Transportadora regional perdia entregas por falta de visibilidade de motoristas, não tinha dados consolidados de consumo e o cliente embarcador cobrava transparência que não existia.",
    solution:
      "Plataforma com mapa Leaflet em tempo real via WebSocket, app PWA para motoristas com check-in/coleta/entrega, motor de otimização de rotas e portal do embarcador com tracking link público.",
    outcome:
      "Redução de 18% no consumo de combustível por rota otimizada e onboarding de 3 novos embarcadores graças ao portal de rastreio.",
    metrics: [
      { label: "Combustível -", value: "18%" },
      { label: "Novos embarcadores", value: "+3" },
      { label: "Tracking público", value: "Sim" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "WebSockets", "Leaflet", "PWA"],
    services: ["Sistema Empresarial", "Real-time", "Mobile PWA"],
    duration: "18 semanas",
    imageHint: "Logix",
    publishedAt: "2026-04-12",
  },
  {
    slug: "edutrack-gestao-escola-particular",
    title: "EduTrack — gestão acadêmica para escolas particulares",
    client: "EduTrack",
    industry: "Educação",
    summary:
      "Sistema acadêmico completo com matrículas, boletim digital, comunicação com responsáveis, financeiro e portal do aluno.",
    problem:
      "Escola de médio porte usava sistema legado em desktop, sem app para pais, sem boletim digital e com cobrança manual gerando inadimplência.",
    solution:
      "Plataforma SaaS com matrícula online, boletim digital com pareceres, app do responsável (PWA), mural de avisos, financeiro com boleto/PIX e relatórios pedagógicos.",
    outcome:
      "Inadimplência reduzida em 27%, comunicação com pais centralizada e onboarding de matrículas 5x mais rápido.",
    metrics: [
      { label: "Inadimplência -", value: "27%" },
      { label: "Matrícula", value: "5x mais rápida" },
      { label: "Responsáveis no app", value: "92%" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "PWA", "PIX"],
    services: ["SaaS", "PWA", "Integração de Pagamentos"],
    duration: "16 semanas",
    imageHint: "EduTrack",
    publishedAt: "2026-05-20",
  },
  {
    slug: "medflow-prontuario-clinica-multiprofissional",
    title: "MedFlow — prontuário eletrônico para clínica multiprofissional",
    client: "MedFlow",
    industry: "Saúde",
    summary:
      "Prontuário eletrônico multi-especialidade com agenda compartilhada, prescrição digital, teleconsulta e faturamento de convênios.",
    problem:
      "Clínica com 12 profissionais de especialidades distintas (médicos, fisio, nutri) sem prontuário unificado, agenda fragmentada e faturamento de convênio manual.",
    solution:
      "Prontuário multi-profissional com templates por especialidade, agenda compartilhada com bloqueios, teleconsulta via WebRTC, prescrição digital com Memed e TISS para convênios.",
    outcome:
      "Faturamento de convênio automatizado, redução de 40% no tempo administrativo e teleconsulta adotada por 60% dos pacientes.",
    metrics: [
      { label: "Tempo admin -", value: "40%" },
      { label: "Teleconsulta", value: "60% pacientes" },
      { label: "TISS", value: "Automatizado" },
    ],
    technologies: ["React", "TypeScript", "Supabase", "WebRTC", "TISS", "Memed API"],
    services: ["SaaS", "Integração APIs", "Real-time"],
    duration: "20 semanas",
    imageHint: "MedFlow",
    publishedAt: "2026-06-01",
  },
];

export function getCaseStudyBySlug(slug: string) {
  return CASE_STUDIES.find((c) => c.slug === slug);
}
