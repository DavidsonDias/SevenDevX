#!/usr/bin/env node
/**
 * 🩹 apply-headers.mjs — SevenDevX Documentation Tooling
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file scripts/apply-headers.mjs
 * @module Tooling/Docs
 *
 * @description
 * Aplica cabeçalhos Level 1/2 do SevenDevX Enterprise Code Documentation
 * Standard em arquivos de `src/` que ainda não possuem `@file`. As descrições
 * são curadas por caminho (mapa abaixo); arquivos não mapeados recebem um
 * cabeçalho mínimo derivado do diretório (módulo) e do tipo de artefato.
 *
 * @responsibilities
 *   - Nunca sobrescrever cabeçalho existente
 *   - Nunca alterar código: apenas prefixar o bloco de comentário
 *   - Preservar diretivas de topo (`#!`, `"use client"`, `/// <reference`)
 *
 * @usage node scripts/apply-headers.mjs
 *
 * @see docs/code-standards/FILE_HEADERS.md
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { basename, dirname } from "node:path";

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

/** Módulo por prefixo de diretório. */
const MODULE_BY_DIR = [
  ["src/pages/admin", "SevenOS/Admin"],
  ["src/pages/geo", "Public/GEO"],
  ["src/pages", "Public"],
  ["src/components/admin/finance", "SevenOS/Finance"],
  ["src/components/admin/integrations", "SevenOS/Integrations"],
  ["src/components/admin", "SevenOS/UI"],
  ["src/components/auth", "Auth"],
  ["src/components/layout", "UI/Layout"],
  ["src/components/security", "Security"],
  ["src/components/services", "Public/Services"],
  ["src/components", "UI"],
  ["src/modules/integrations", "Integrations"],
  ["src/modules/automations", "Automations"],
  ["src/modules/branding", "Branding"],
  ["src/modules/layout", "Layout"],
  ["src/modules/notifications", "Notifications"],
  ["src/modules/onboarding", "Onboarding"],
  ["src/modules/system-health", "SystemHealth"],
  ["src/modules/users", "Users"],
  ["src/modules/webhooks", "Webhooks"],
  ["src/core/branding", "Core/Branding"],
  ["src/hooks", "Hooks"],
  ["src/data", "Content"],
  ["src/lib", "Lib"],
  ["src/utils", "Utils"],
  ["src/i18n", "i18n"],
];

/** Rotas públicas/administrativas por arquivo de página. */
const ROUTES = {
  "src/pages/Index.tsx": "/",
  "src/pages/Home.tsx": "/ (composição)",
  "src/pages/About.tsx": "/about",
  "src/pages/Services.tsx": "/services",
  "src/pages/Projects.tsx": "/projects",
  "src/pages/ProjectDetail.tsx": "/projects/:slug",
  "src/pages/ProjectsHub.tsx": "/projects-hub",
  "src/pages/Store.tsx": "/store",
  "src/pages/Fornecedores.tsx": "/fornecedores",
  "src/pages/Blog.tsx": "/blog",
  "src/pages/BlogPost.tsx": "/blog/:slug",
  "src/pages/Auth.tsx": "/auth",
  "src/pages/Profile.tsx": "/profile",
  "src/pages/PrivacyPolicy.tsx": "/privacy-policy",
  "src/pages/NotFound.tsx": "*",
  "src/pages/OAuthCallback.tsx": "/oauth/callback",
  "src/pages/IntegrationsMarketplace.tsx": "/integracoes",
  "src/pages/AdminDashboard.tsx": "/admin",
  "src/pages/geo/AIHub.tsx": "/ai",
  "src/pages/geo/WhySevenDevX.tsx": "/why-sevendevx",
  "src/pages/geo/GeoArticle.tsx": "/answers, /knowledge-base",
  "src/pages/geo/SolutionPage.tsx": "/solucoes, /solucoes/:slug",
  "src/pages/geo/CaseStudies.tsx": "/cases, /cases/:slug",
  "src/pages/geo/ContentClusters.tsx": "/clusters",
  "src/pages/geo/LocalSeoPage.tsx": "/local/:city",
  "src/pages/geo/CriacaoSitesProfissionais.tsx": "/criacao-de-sites-profissionais",
  "src/pages/admin/AiOpsAdmin.tsx": "/admin/ai-ops",
  "src/pages/admin/AutomationRunsAdmin.tsx": "/admin/automations/runs",
  "src/pages/admin/AutomationsAdmin.tsx": "/admin/automations",
  "src/pages/admin/BackupAdmin.tsx": "/admin/backup",
  "src/pages/admin/BlogAdmin.tsx": "/admin/blog",
  "src/pages/admin/BrandStudioAdmin.tsx": "/admin/brand-studio",
  "src/pages/admin/CashflowAdmin.tsx": "/admin/cashflow",
  "src/pages/admin/CitationsAdmin.tsx": "/admin/citations",
  "src/pages/admin/ClientsAdmin.tsx": "/admin/clients",
  "src/pages/admin/ClientsFinanceAdmin.tsx": "/admin/finance/clients",
  "src/pages/admin/ContactCenterAdmin.tsx": "/admin/contact-center",
  "src/pages/admin/CronAdmin.tsx": "/admin/cron",
  "src/pages/admin/DlqAdmin.tsx": "/admin/webhooks/dlq",
  "src/pages/admin/EventsAdmin.tsx": "/admin/events",
  "src/pages/admin/FaqAdmin.tsx": "/admin/faq",
  "src/pages/admin/FinanceAdmin.tsx": "/admin/financeiro",
  "src/pages/admin/ForecastAdmin.tsx": "/admin/forecast",
  "src/pages/admin/GeoAnalyticsAdmin.tsx": "/admin/geo",
  "src/pages/admin/IncidentsAdmin.tsx": "/admin/incidents",
  "src/pages/admin/IntegrationsAdmin.tsx": "/admin/integrations",
  "src/pages/admin/LogoLabAdmin.tsx": "/admin/logo-lab",
  "src/pages/admin/LogoLibraryAdmin.tsx": "/admin/logo-library",
  "src/pages/admin/LogsAdmin.tsx": "/admin/logs",
  "src/pages/admin/MfaAdmin.tsx": "/admin/security/mfa",
  "src/pages/admin/NotificationPreferencesAdmin.tsx": "/admin/notifications/preferences",
  "src/pages/admin/NotificationsAdmin.tsx": "/admin/notifications",
  "src/pages/admin/OAuthAdmin.tsx": "/admin/oauth",
  "src/pages/admin/PipelineAdmin.tsx": "/admin/pipeline",
  "src/pages/admin/ProcessAdmin.tsx": "/admin/process",
  "src/pages/admin/ProjectDetailAdmin.tsx": "/admin/projects/:id",
  "src/pages/admin/ProjectsAdmin.tsx": "/admin/projects",
  "src/pages/admin/ProjectsDebug.tsx": "/admin/projects/debug",
  "src/pages/admin/ReconciliationAdmin.tsx": "/admin/finance/reconciliation",
  "src/pages/admin/ResponseTemplatesAdmin.tsx": "/admin/templates",
  "src/pages/admin/RestoreAdmin.tsx": "/admin/restore",
  "src/pages/admin/SearchConsoleAdmin.tsx": "/admin/search-console",
  "src/pages/admin/SecurityAdmin.tsx": "/admin/security",
  "src/pages/admin/ServicesAdmin.tsx": "/admin/services",
  "src/pages/admin/SessionsAdmin.tsx": "/admin/sessions",
  "src/pages/admin/SiteCreationAdmin.tsx": "/admin/site-creation",
  "src/pages/admin/SystemHealthAdmin.tsx": "/admin/system-health",
  "src/pages/admin/SystemSettingsAdmin.tsx": "/admin/settings",
  "src/pages/admin/TagsAdmin.tsx": "/admin/tags",
  "src/pages/admin/TechnologiesAdmin.tsx": "/admin/technologies",
  "src/pages/admin/UsersAdmin.tsx": "/admin/users",
  "src/pages/admin/WebhooksAdmin.tsx": "/admin/webhooks",
  "src/pages/admin/WhatsAppInboxAdmin.tsx": "/admin/whatsapp",
};

/** Descrições curadas (uma frase objetiva sobre o porquê do arquivo). */
const DESCRIPTIONS = {
  // ---- UI pública
  "AIChatbot.tsx": "Assistente conversacional público; conversa com o modelo via Edge Function, preservando histórico local e renderizando Markdown.",
  "AppInstallerButton.tsx": "Convite de instalação do PWA; só aparece quando o app ainda não está instalado e o navegador expõe o evento de instalação.",
  "BreadcrumbSchema.tsx": "Emite JSON-LD BreadcrumbList para a rota atual, reforçando a trilha de navegação para buscadores e LLMs.",
  "Contact.tsx": "Seção de contato do site público; encaminha a mensagem para `contacts` e dispara a notificação administrativa.",
  "ContactMultiStep.tsx": "Formulário de contato em etapas, projetado para reduzir atrito e qualificar o lead antes do envio.",
  "DiagnosticoModal.tsx": "Fluxo de diagnóstico gratuito usado pelos CTAs; grava o lead e as respostas antes de encaminhar ao WhatsApp.",
  "EntityGraphSchema.tsx": "Publica o grafo de entidades (JSON-LD) que sustenta a estratégia GEO da marca.",
  "ExitIntentPopup.tsx": "Captura de intenção de saída em desktop; exibido uma única vez por sessão para não prejudicar a experiência.",
  "FeaturedProjects.tsx": "Vitrine dos projetos em destaque na home, com transições compartilhadas para a página de detalhe.",
  "Footer.tsx": "Rodapé global: navegação em colunas, contatos e links institucionais.",
  "GeoKnowledgeGraph.tsx": "Bloco visual do grafo de conhecimento usado nas páginas GEO.",
  "GlassCard.tsx": "Superfície glassmorphic base do design system; centraliza blur, borda e elevação.",
  "Header.tsx": "Navegação pública principal, com underline animado e visibilidade condicional por sessão.",
  "Hero.tsx": "Hero da home; controla o vídeo de fundo com fallback para conexões lentas e prioriza o LCP.",
  "LanguageSwitcher.tsx": "Alternador de idioma conectado ao LanguageContext (pt/en/es).",
  "OfflineIndicator.tsx": "Sinaliza perda de conectividade e o estado da fila offline do service worker.",
  "OrcamentoButton.tsx": "Gatilho flutuante do fluxo de orçamento.",
  "OrcamentoModal.tsx": "Fluxo multi-etapas de orçamento; persiste o lead antes de qualquer redirecionamento externo.",
  "PWAUpdatePrompt.tsx": "Aviso de nova versão do app; a atualização é sempre confirmada pelo usuário.",
  "PageTransition.tsx": "Transição global entre rotas (fade + scale) com física de mola compartilhada.",
  "PortfolioCarousel3D.tsx": "Carrossel 3D do portfólio; efeitos de profundidade desativados em mobile por performance.",
  "PortfolioFilter.tsx": "Filtro de projetos por stack e categoria.",
  "ProjectCard3D.tsx": "Card de projeto com tilt 3D e transição compartilhada para o detalhe.",
  "ProjectModal.tsx": "Detalhe rápido de projeto em modal, com bloqueio de scroll compensado.",
  "ProjectsPreview.tsx": "Prévia de projetos na home.",
  "SEOHead.tsx": "Fonte única de metadados por página: title, description, canonical, Open Graph e JSON-LD.",
  "ScrollToTop.tsx": "Reposiciona o scroll no topo a cada navegação.",
  "SectionDivider.tsx": "Divisor decorativo entre seções.",
  "ServiceCard3D.tsx": "Card de serviço com tilt 3D, alimentado pelo CMS de serviços.",
  "ServicesPreview.tsx": "Prévia dos serviços na home, consumindo `services_cms`.",
  "SkeletonLoader.tsx": "Placeholders de carregamento padronizados.",
  "TagIcon.tsx": "Ícone de tag resolvido a partir do registro de tags.",
  "TechIcon.tsx": "Ícone de tecnologia com resolução local (assets do projeto).",
  "TechIconCDN.tsx": "Ícone de tecnologia servido por CDN oficial, com fallback para cor/inicial da marca.",
  "TechModal.tsx": "Detalhe de tecnologia em modal.",
  "TechPreview.tsx": "Prévia do stack na home.",
  "TechShowcase.tsx": "Marquee infinito de tecnologias em duas faixas contínuas.",
  "Testimonials.tsx": "Depoimentos em grade.",
  "TestimonialsCarousel3D.tsx": "Depoimentos em carrossel 3D.",
  "WhatsAppButton.tsx": "Atalho flutuante para o WhatsApp comercial.",
  // ---- UI admin
  "ActivityFeed.tsx": "Feed de auditoria em tempo real, alimentado por `audit_log` via Realtime.",
  "AdminComingSoon.tsx": "Placeholder padronizado para áreas ainda não liberadas.",
  "AdminMenu.tsx": "Navegação agrupada do SevenOS; a visibilidade é conveniência de UI, a autoridade é RLS.",
  "AdminPageShell.tsx": "Layout base das telas admin: header auto-hide, breadcrumb, ações e slots de módulos globais.",
  "AiInsightsBlock.tsx": "Bloco de insights gerados por IA no dashboard.",
  "AiProjectGeneratorModal.tsx": "Geração assistida de projeto a partir de um briefing.",
  "AttachmentManager.tsx": "Gerência de anexos no bucket privado; sempre por URL assinada.",
  "AuditDiffModal.tsx": "Comparação antes/depois de um registro auditado.",
  "BlogPostEditor.tsx": "Editor de posts em Markdown com preview e publicação.",
  "Breadcrumb.tsx": "Trilha de navegação do SevenOS.",
  "CitationMonitorSettings.tsx": "Configuração do monitor de citações em respostas de IA.",
  "ClientPicker.tsx": "Seletor de cliente reutilizado pelos formulários administrativos.",
  "ContractAiAnalysisModal.tsx": "Resumo e análise de risco de contratos por IA.",
  "ContractCard.tsx": "Cartão de contrato com estado e ações.",
  "ContractVersionHistory.tsx": "Histórico de versões de contrato com restauração.",
  "FilePreview.tsx": "Pré-visualização de arquivos privados por URL assinada.",
  "GlobalSearch.tsx": "Busca cross-entidade do SevenOS via RPC `search_global`.",
  "IconUploader.tsx": "Upload de ícones customizados para registros do CMS.",
  "KpiCards.tsx": "Indicadores principais do dashboard administrativo.",
  "LucideIconPicker.tsx": "Seletor visual de ícones Lucide usado pelos CMSs.",
  "PricingEngineModal.tsx": "Cálculo de precificação de propostas.",
  "ProjectPickerModal.tsx": "Seleção visual de projetos (com capa e stack) para curadoria de conteúdo.",
  "PushSubscribeButton.tsx": "Assinatura de notificações push do navegador.",
  "SiteCreationProjectsTab.tsx": "Aba de curadoria de projetos da landing de criação de sites, com ordenação drag-and-drop.",
  "SiteCreationTechTab.tsx": "Aba de curadoria de tecnologias da landing de criação de sites.",
  "SmartInsights.tsx": "Insights operacionais derivados de RPCs de pipeline e finanças.",
  "StageDocuments.tsx": "Documentos vinculados a um estágio de projeto.",
  "TagMultiSelect.tsx": "Seleção múltipla de tags do registro.",
  "TechMultiSelect.tsx": "Seleção múltipla de tecnologias do registro.",
  "TechPickerModal.tsx": "Seleção visual de tecnologias com logos oficiais e ordenação.",
  "ProjectFinanceBlock.tsx": "Bloco financeiro do projeto: orçamento, transações e margem.",
  "TimeTrackerWidget.tsx": "Registro de horas do projeto, base do cálculo de margem.",
  "ProjectIntegrationsBlock.tsx": "Integrações vinculadas ao projeto e seus estados de conexão.",
  // ---- Layout / segurança / serviços
  "Container.tsx": "Container responsivo padrão (larguras máximas do design system).",
  "Section.tsx": "Seção vertical padronizada com espaçamento fluido.",
  "Blocker.tsx": "Bloqueio de UI para estados sem permissão ou pré-requisito não atendido.",
  "FAQSection.tsx": "FAQ público alimentado por `faq_items`, com JSON-LD FAQPage.",
  "ProcessSection.tsx": "Linha do tempo do processo de trabalho.",
  // ---- Core branding
  "brandKit.ts": "Montagem do brand kit exportável (tokens, paleta e variações de logo).",
  "extractPalette.ts": "Extração de paleta dominante a partir de uma imagem de marca.",
  "knownBrands.ts": "Paletas conhecidas de marcas para evitar extração incorreta em logos monocromáticos.",
  "tokens.ts": "Conversão da paleta extraída em design tokens (CSS custom properties).",
  // ---- Data
  "caseStudies.ts": "Estudos de caso publicados nas páginas GEO.",
  "contentClusters.ts": "Clusters temáticos que organizam a estratégia de conteúdo.",
  "entityGraph.ts": "Entidades e relações da marca usadas na geração de JSON-LD.",
  "geoContent.ts": "Conteúdo das páginas GEO (respostas, soluções e cidades).",
  "projectImages.ts": "Mapa de imagens dos projetos, incluindo resolução do prefixo `local:`.",
  "projects.ts": "Portfólio estático (slug, descrição, stack e links).",
  // ---- Hooks
  "use-mobile.tsx": "Detecta breakpoint mobile para desativar efeitos pesados.",
  "use-toast.ts": "Fila de toasts da aplicação.",
  "useAiReferralTracker.ts": "Registra visitas originadas de assistentes de IA para a análise GEO.",
  "useAnalytics.ts": "Envio de eventos de produto para `analytics_events`.",
  "useAttachments.ts": "CRUD de anexos no bucket privado, sempre com URL assinada.",
  "useAuditLog.ts": "Consulta e exportação do log de auditoria.",
  "useAutoHideOnScroll.ts": "Oculta cabeçalhos ao rolar para baixo e restaura ao subir.",
  "useBrandPalette.ts": "Paleta de marca resolvida para um provider ou projeto.",
  "useContacts.ts": "Leads e mensagens de contato, com invalidação de cache após mutações.",
  "useContractVersions.ts": "Versionamento de contratos e restauração de versões.",
  "useDocuments.ts": "Documentos de projeto e estágios.",
  "useEcosystem.ts": "Estado agregado do ecossistema (saúde, integrações e automações).",
  "useExtractedColor.ts": "Cor dominante de uma imagem, usada em glow e realces.",
  "useFinance.ts": "Transações, orçamentos e margem por projeto.",
  "useIntegrationFavorites.ts": "Favoritos de integrações por usuário.",
  "useIntegrations.ts": "Providers de integração: configuração, testes e logs, com cache React Query.",
  "useLogoOverrides.ts": "Sobrescritas manuais de logo sobre o registro global.",
  "useMfa.ts": "Enrolamento e verificação de TOTP; segredos nunca são expostos ao cliente.",
  "useNotifications.ts": "Central de notificações com atualização em tempo real.",
  "useOnboarding.ts": "Progresso do checklist e do tour de onboarding.",
  "useProjects.ts": "Projetos, estágios e checklists.",
  "usePushSubscription.ts": "Assinatura Web Push e sincronização com `push_subscriptions`.",
  "useRegistry.ts": "Registro de tecnologias e tags compartilhado pelos CMSs.",
  "useResolvedAccent.ts": "Cor de acento resolvida por contexto de marca.",
  "useScrollLock.ts": "Bloqueio de scroll com compensação de scrollbar para modais.",
  "useSessionTracker.ts": "Rastreio de sessões administrativas (dispositivo e geolocalização aproximada).",
  "useSitePage.ts": "Dados da landing de criação de sites resolvidos a partir das tabelas `site_page_*`.",
  "useSmartBack.ts": "Voltar contextual que respeita a origem da navegação.",
  "useTimeTracking.ts": "Apontamento de horas e agregados por projeto.",
  // ---- i18n / lib / utils
  "LanguageContext.tsx": "Contexto de idioma (pt/en/es) e função de tradução da aplicação.",
  "translations.ts": "Dicionário de traduções do site público.",
  "colorExtract.ts": "Utilitários de extração e manipulação de cor.",
  "contractBuilder.ts": "Montagem do documento de contrato a partir do projeto e cláusulas.",
  "money.ts": "Formatação e aritmética monetária (evita erros de ponto flutuante).",
  "storage.ts": "Acesso ao Storage privado: upload e URLs assinadas.",
  "utils.ts": "Utilidades gerais, incluindo composição de classes Tailwind.",
  "authErrors.ts": "Tradução de erros de autenticação para mensagens compreensíveis.",
  "browserStorageGuard.ts": "Proteção contra ambientes sem acesso a storage (iframes e modo restrito).",
  "offlineQueue.ts": "Fila offline em IndexedDB drenada pelo Background Sync.",
  "pdfExport.ts": "Exportação de relatórios em PDF.",
  "registerServiceWorker.ts": "Registro do service worker com guarda para ambientes de preview.",
  "safeStorage.ts": "Wrapper tolerante a falhas sobre localStorage/sessionStorage.",
  "techData.ts": "Metadados de tecnologias (cores e identificadores de ícone).",
  "theme.ts": "Alternância e persistência de tema.",
  // ---- Módulos
  "AutomationFlowBuilder.tsx": "Construtor visual de regras de automação (gatilho, condições e ações).",
  "AutomationGuideDrawer.tsx": "Guia contextual de automações.",
  "automationTemplates.ts": "Modelos prontos de automação.",
  "LogoEditorModal.tsx": "Editor de variações de logo do Brand Studio.",
  "GuidedConnectionTest.tsx": "Teste guiado de conexão com provider externo.",
  "IntegrationDetailsModal.tsx": "Detalhe de integração: estado, credenciais mascaradas e histórico.",
  "IntegrationLogsPanel.tsx": "Logs de execução das integrações.",
  "IntegrationMarketplaceModal.tsx": "Marketplace interno de providers.",
  "ProviderConfigModal.tsx": "Configuração de provider; segredos são gravados via Edge Function, nunca no cliente.",
  "ProviderLogo.tsx": "Renderização do logo do provider a partir do registro global.",
  "SetupGuideDrawer.tsx": "Passo a passo de configuração por provider.",
  "TestResultPanel.tsx": "Resultado normalizado dos testes de conexão.",
  "providerCatalog.ts": "Catálogo de providers suportados e seus recursos.",
  "GlobalFAB.tsx": "Botão de ação flutuante global (WhatsApp, chatbot e ações rápidas).",
  "MobileBottomNav.tsx": "Navegação inferior mobile focada no fluxo diário do SevenOS.",
  "RadialActionMenu.tsx": "Menu radial de ações rápidas.",
  "NotificationBell.tsx": "Sino de notificações com contagem em tempo real.",
  "OnboardingChecklist.tsx": "Checklist de ativação persistido em `onboarding_progress`.",
  "OnboardingTour.tsx": "Tour guiado do SevenOS.",
  "tourSteps.ts": "Passos do tour de onboarding.",
  "AIRecommendationPanel.tsx": "Recomendações de saúde do sistema geradas por IA.",
  "HealthStatusGrid.tsx": "Grade de status dos serviços monitorados.",
  "RealtimeActivityFeed.tsx": "Atividade do sistema em tempo real.",
  "UserDetailsModal.tsx": "Detalhe de usuário, papéis e sessões.",
  "WebhookDebugger.tsx": "Reenvio e inspeção de entregas de webhook.",
  "WebhookGuideDrawer.tsx": "Guia de configuração de webhooks.",
  "WebhookPayloadViewer.tsx": "Visualizador de payloads de webhook.",
  // ---- Páginas públicas
  "Index.tsx": "Entrada da rota raiz; delega a composição para `Home`.",
  "Home.tsx": "Composição da home pública (hero, serviços, stack, projetos e contato).",
  "About.tsx": "Página institucional com posicionamento, provas reais e links para o portfólio.",
  "Services.tsx": "Serviços oferecidos, alimentados pelo CMS `services_cms`.",
  "Projects.tsx": "Listagem do portfólio com filtros.",
  "ProjectDetail.tsx": "Detalhe de projeto com transição compartilhada a partir dos cards.",
  "ProjectsHub.tsx": "Hub de navegação entre projetos e clusters relacionados.",
  "Store.tsx": "Vitrine de produtos e pacotes.",
  "Fornecedores.tsx": "Página de fornecedores e parceiros.",
  "Blog.tsx": "Índice do blog alimentado por `blog_posts`.",
  "BlogPost.tsx": "Leitura de post com progresso de leitura e schema.org Article.",
  "Auth.tsx": "Login e cadastro; erros são traduzidos por `authErrors`.",
  "Profile.tsx": "Perfil do usuário autenticado: dados, papéis e estatísticas.",
  "PrivacyPolicy.tsx": "Política de privacidade.",
  "NotFound.tsx": "Página 404 com efeito glitch e rotas sugeridas.",
  "OAuthCallback.tsx": "Conclusão do fluxo OAuth PKCE e retorno ao destino pretendido.",
  "IntegrationsMarketplace.tsx": "Vitrine pública de integrações suportadas.",
  "AIHub.tsx": "Hub de conteúdo otimizado para citação por assistentes de IA.",
  "WhySevenDevX.tsx": "Página de diferenciais e provas.",
  "GeoArticle.tsx": "Índice e leitura de artigos GEO (respostas e base de conhecimento).",
  "SolutionPage.tsx": "Páginas de soluções por problema de negócio.",
  "CaseStudies.tsx": "Índice e detalhe de estudos de caso.",
  "ContentClusters.tsx": "Mapa de clusters de conteúdo.",
  "LocalSeoPage.tsx": "Página local por cidade, com sinais geográficos estruturados.",
  "CriacaoSitesProfissionais.tsx": "Landing de criação de sites, 100% alimentada pelas tabelas `site_page_*`.",
  // ---- Páginas admin
  "AdminDashboard.tsx": "Dashboard do SevenOS: KPIs, insights e atividade recente.",
  "AiOpsAdmin.tsx": "Operações assistidas por IA e histórico de uso.",
  "AutomationRunsAdmin.tsx": "Execuções de automação com status e payloads.",
  "AutomationsAdmin.tsx": "Regras de automação e seus gatilhos.",
  "BackupAdmin.tsx": "Exportação de backups do tenant em múltiplos formatos.",
  "BlogAdmin.tsx": "CMS do blog: posts, categorias e publicação.",
  "BrandStudioAdmin.tsx": "Extração de paleta, tokens e brand kit.",
  "CashflowAdmin.tsx": "Projeção de caixa a partir das transações previstas.",
  "CitationsAdmin.tsx": "Monitoramento de citações da marca em respostas de IA.",
  "ClientsAdmin.tsx": "CRM: clientes e interações.",
  "ClientsFinanceAdmin.tsx": "Rentabilidade por cliente.",
  "ContactCenterAdmin.tsx": "Mensagens recebidas e modelos de resposta.",
  "CronAdmin.tsx": "Jobs agendados e seus últimos resultados.",
  "DlqAdmin.tsx": "Dead-letter queue de webhooks com reprocessamento.",
  "EventsAdmin.tsx": "Barramento de eventos internos.",
  "FaqAdmin.tsx": "CMS de FAQ usado pelo site público.",
  "FinanceAdmin.tsx": "Transações, orçamentos e margem consolidada.",
  "ForecastAdmin.tsx": "Previsão ponderada do pipeline comercial.",
  "GeoAnalyticsAdmin.tsx": "Tráfego e citações originadas de IA.",
  "IncidentsAdmin.tsx": "Incidentes e linha do tempo de resolução.",
  "IntegrationsAdmin.tsx": "Providers externos: configuração, testes e saúde.",
  "LogoLabAdmin.tsx": "Geração de variações de logo assistida por IA.",
  "LogoLibraryAdmin.tsx": "Acervo de logos e assets de marca.",
  "LogsAdmin.tsx": "Log de auditoria com filtros e exportação.",
  "MfaAdmin.tsx": "Enrolamento e gestão de MFA (TOTP).",
  "NotificationPreferencesAdmin.tsx": "Preferências de notificação por canal.",
  "NotificationsAdmin.tsx": "Central de notificações do SevenOS.",
  "OAuthAdmin.tsx": "Conexões OAuth (PKCE) e seus escopos.",
  "PipelineAdmin.tsx": "Funil comercial com histórico de estágios.",
  "ProcessAdmin.tsx": "Modelos de processo e estágios padrão.",
  "ProjectDetailAdmin.tsx": "Operação completa de um projeto: estágios, documentos, finanças e integrações.",
  "ProjectsAdmin.tsx": "Gestão de projetos e criação assistida.",
  "ProjectsDebug.tsx": "Tela de diagnóstico de dados de projetos.",
  "ReconciliationAdmin.tsx": "Conciliação bancária a partir de importações.",
  "ResponseTemplatesAdmin.tsx": "Modelos de resposta do contact center.",
  "RestoreAdmin.tsx": "Restauração seletiva de tabelas a partir de um backup.",
  "SearchConsoleAdmin.tsx": "Insights de busca orgânica.",
  "SecurityAdmin.tsx": "Hub de segurança: MFA, sessões e eventos sensíveis.",
  "ServicesAdmin.tsx": "CMS de serviços exibidos no site público.",
  "SessionsAdmin.tsx": "Sessões administrativas ativas.",
  "SiteCreationAdmin.tsx": "CMS da landing de criação de sites (seções, projetos, stack e SEO).",
  "SystemHealthAdmin.tsx": "Saúde dos serviços, SLO e incidentes.",
  "SystemSettingsAdmin.tsx": "Configurações globais do sistema (leitura restrita a admin).",
  "TagsAdmin.tsx": "Registro de tags.",
  "TechnologiesAdmin.tsx": "Registro de tecnologias e seus ícones.",
  "UsersAdmin.tsx": "Usuários e papéis; papéis vivem em `user_roles`.",
  "WebhooksAdmin.tsx": "Webhooks, entregas e reprocessamento.",
  "WhatsAppInboxAdmin.tsx": "Inbox do WhatsApp Business (Meta Cloud API).",
  "sw.ts": "Service worker: estratégias de cache, offline shell e Background Sync da fila offline.",
};

/** Notas de segurança/performance por área. */
const NOTES = [
  [/^src\/pages\/admin\//, "@security Rota protegida por `ProtectedRoute requiredRole=\"admin\"`; a autoridade final é RLS."],
  [/^src\/components\/admin\//, "@security Uso restrito ao SevenOS; arquivos privados sempre por URL assinada."],
  [/^src\/pages\/geo\//, "@seo Metadados e JSON-LD definidos via `SEOHead`."],
  [/^src\/hooks\//, "@remarks Cache e invalidação via React Query; efeitos colaterais concentrados nas mutations."],
];

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const moduleFor = (rel) =>
  MODULE_BY_DIR.find(([dir]) => rel.startsWith(dir + "/"))?.[1] ?? "App";

const kindFor = (rel) => {
  if (rel.startsWith("src/pages/")) return "Página";
  if (rel.includes("/hooks/") || basename(rel).startsWith("use")) return "Hook";
  if (rel.endsWith(".tsx")) return "Componente";
  return "Módulo";
};

function buildHeader(rel) {
  const name = basename(rel);
  const mod = moduleFor(rel);
  const route = ROUTES[rel];
  const desc =
    DESCRIPTIONS[name] ??
    `${kindFor(rel)} do módulo ${mod}. Ver o README do diretório para o papel dentro do fluxo.`;
  const note = NOTES.find(([re]) => re.test(rel))?.[1];
  const readme = existsSync(`${dirname(rel)}/README.md`) ? `${dirname(rel)}/README.md` : "docs/architecture/MODULE_MAP.md";

  return [
    "/**",
    ` * ${name} — SevenDevX`,
    " * ─────────────────────────────────────────────────────────────────────",
    ` * @file ${rel}`,
    ` * @module ${mod}`,
    ...(route ? [` * @route ${route}`] : []),
    " *",
    " * @description",
    ` * ${desc}`,
    ...(note ? [" *", ` * ${note}`] : []),
    " *",
    ` * @see ${readme}`,
    " * ─────────────────────────────────────────────────────────────────────",
    " */",
    "",
  ].join("\n");
}

// ============================================================================
// 📤 EXECUÇÃO
// ============================================================================

const files = readFileSync(process.argv[2] ?? "/tmp/missing.txt", "utf8")
  .split("\n")
  .map((l) => l.trim())
  .filter(Boolean);

let applied = 0;
for (const rel of files) {
  if (!existsSync(rel)) continue;
  const src = readFileSync(rel, "utf8");
  if (src.slice(0, 500).includes("@file")) continue;

  // Preserva diretivas obrigatórias de topo.
  const lines = src.split("\n");
  let insertAt = 0;
  while (
    insertAt < lines.length &&
    /^(#!|"use \w+";?|'use \w+';?|\/\/\/\s*<reference)/.test(lines[insertAt].trim())
  ) insertAt++;

  const next = [...lines.slice(0, insertAt), buildHeader(rel).trimEnd(), "", ...lines.slice(insertAt)].join("\n");
  writeFileSync(rel, next);
  applied++;
}

console.log(`✅ Cabeçalhos aplicados: ${applied}`);
