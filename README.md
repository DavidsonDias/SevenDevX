<div align="center">

<img src="src/assets/logo.svg" alt="SevenDevX" width="420" />

# ⚡ SevenDevX — Plataforma Web + SevenOS

### _"Transformamos ideias em soluções digitais de alto impacto."_

**Site institucional premium + ERP/CRM interno (SevenOS) construído em uma única stack React + Supabase Edge.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?style=for-the-badge&logo=vercel)](https://vercel.com)
[![PWA](https://img.shields.io/badge/PWA-Installable-5A0FC8?style=for-the-badge&logo=pwa)](https://sevendevx.com)
[![GEO Ready](https://img.shields.io/badge/GEO-Ready_for_ChatGPT_%7C_Gemini_%7C_Claude-10A37F?style=for-the-badge)]()

![React](https://img.shields.io/badge/React-18.3-20232A?logo=react&logoColor=61DAFB)
![TypeScript](https://img.shields.io/badge/TypeScript-5-007ACC?logo=typescript&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-3-38B2AC?logo=tailwindcss&logoColor=white)
![Framer Motion](https://img.shields.io/badge/Framer_Motion-12-0055FF?logo=framer&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-Edge_Runtime-3ECF8E?logo=supabase&logoColor=white)
![shadcn/ui](https://img.shields.io/badge/shadcn%2Fui-Radix-000?logo=radixui)
![TanStack Query](https://img.shields.io/badge/TanStack_Query-v5-FF4154?logo=reactquery&logoColor=white)

🌐 **Produção:** [sevendevx.com](https://sevendevx.com) · [sevendevx.lovable.app](https://sevendevx.lovable.app)
🏢 **HQ:** Belo Horizonte · MG · Brasil

</div>

---

## 📑 Sumário

1. [Sobre o Projeto](#-sobre-o-projeto)
2. [Dois Produtos, Uma Stack](#-dois-produtos-uma-stack)
3. [Stack Técnica Completa](#-stack-técnica-completa)
4. [Arquitetura Geral](#️-arquitetura-geral)
5. [SevenDevX — Site Público](#-sevendevx--site-público)
6. [SevenOS — ERP/CRM Interno](#-sevenos--ercrm-interno)
7. [O que é Serverless aqui?](#-o-que-é-serverless-aqui)
8. [Edge Functions (28 funções)](#️-edge-functions-28-funções)
9. [Banco de Dados](#-banco-de-dados--rls-grants)
10. [Estrutura Completa de Pastas](#-estrutura-completa-de-pastas)
11. [Design System](#-design-system)
12. [SEO + GEO (AI-first)](#-seo--geo-ai-first)
13. [Segurança](#-segurança--rbac)
14. [Performance & PWA](#-performance--pwa)
15. [i18n](#-internacionalização)
16. [Como Rodar Localmente](#-como-rodar-localmente)
17. [Status do Site](#-status-do-projeto)
18. [Roadmap](#️-roadmap)

---

## 📖 Sobre o Projeto

A **SevenDevX** é um studio brasileiro de desenvolvimento de software com sede em **Belo Horizonte (MG)**, especializado em:

- 🎯 **Sites de alta conversão** (LPs, institucionais, e-commerce headless)
- 🧠 **Sistemas web sob medida** (ERP/CRM, plataformas SaaS)
- 🤖 **Integração com IA** (chatbots, automações, RAG, GEO)
- 📱 **PWAs enterprise** (offline-first, instaláveis, push notifications)

Este repositório é **monorepo de produto único** que entrega **dois sistemas** rodando na mesma stack, mesmo deploy e mesmo banco — com separação por rota, role e Service Worker.

---

## 🎭 Dois Produtos, Uma Stack

| Produto | O que é | Acesso | Rota |
|---|---|---|---|
| 🌐 **SevenDevX** | Site institucional premium: portfólio, blog, GEO/SEO, captação de leads, chatbot IA | Público | `/`, `/sobre`, `/servicos`, `/projetos`, `/blog`, `/contato`, `/local/:cidade`, `/geo/*` |
| 🛠️ **SevenOS** | ERP/CRM interno enterprise: 28 módulos administrativos cobrindo CRM, financeiro, projetos, automações, IA Ops, observabilidade | Privado (RBAC `admin`/`moderator`) | `/admin/*` |

> ⚠️ **SevenOS é INTERNO da SevenDevX** — não é SaaS multi-tenant. Não há billing/quota/planos.

---

## 🧩 Stack Técnica Completa

### 🎨 Frontend
| Tech | Versão | Função |
|---|---|---|
| React | 18.3 | UI declarativa, Suspense + lazy routes |
| TypeScript | 5+ | Type-safety end-to-end (frontend ↔ DB via types gerados) |
| Vite | 5+ | Build, HMR, code splitting agressivo |
| Tailwind CSS | 3+ | Styling com **tokens semânticos HSL** (zero cores hardcoded) |
| Framer Motion | 12+ | Animações cinematográficas, layoutId transitions, spring physics |
| shadcn/ui + Radix | latest | Componentes acessíveis (WCAG AA) |
| React Router | v6 | SPA routing + AnimatePresence |
| React Hook Form + Zod | v7 / v3 | Forms tipados, validação schema-first |
| TanStack Query | v5 | Cache, sync, optimistic updates |
| Recharts | latest | Gráficos do SevenOS |
| lucide-react | latest | Ícones SVG tree-shaken |
| vite-plugin-pwa + Workbox | latest | Service Worker, offline-first |

### ⚙️ Backend (100% serverless)
| Tech | Função |
|---|---|
| **Supabase Auth** | Email + Google OAuth, JWT, refresh rotation |
| **Supabase Postgres** | Banco transacional com RLS |
| **Supabase Edge Functions** | 28 funções Deno na borda (~30–60ms cold start) |
| **Supabase Storage** | Bucket `attachments` **privado** com signed URLs |
| **Supabase Realtime** | Activity Feed, System Health, Citation Engine |
| **Lovable AI Gateway** | Gemini 2.5 Flash / Pro, GPT-5 (sem gerenciar chaves OpenAI) |
| **Lovable Connector Gateway** | Google Search Console, GitHub, Figma, Vercel |
| **Web Push (VAPID)** | Notificações nativas |
| **Vercel Edge Network** | CDN global, headers, redirects |

### 🛠️ DevOps & Tooling
- ESLint 9 (flat config) · Prettier (auto via shadcn) · TypeScript strict
- Deploy contínuo via **Lovable** (push → build → Vercel + Edge Functions)
- Migrations versionadas em `supabase/migrations/` (46 arquivos)
- `vercel.json` com headers de segurança + CSP

---

## 🏛️ Arquitetura Geral

```text
                         ┌────────────────────────────┐
                         │      USUÁRIOS / BOTS       │
                         │  Humanos · GPTBot · Claude │
                         └─────────────┬──────────────┘
                                       │
                       ┌───────────────┴────────────────┐
                       │     VERCEL EDGE (CDN + HTTPS)  │
                       │   sevendevx.com / lovable.app  │
                       └───────────────┬────────────────┘
                                       │
                ┌──────────────────────┴──────────────────────┐
                │                                             │
        ┌───────▼────────┐                          ┌─────────▼────────┐
        │  SPA (React)   │                          │  Service Worker  │
        │  Site + Admin  │                          │  PWA + Offline   │
        └───────┬────────┘                          └─────────┬────────┘
                │                                             │
                └────────────────┬────────────────────────────┘
                                 │  (HTTPS + JWT)
              ┌──────────────────┴───────────────────┐
              │     SUPABASE EDGE RUNTIME (Deno)     │
              │   28 Edge Functions globais          │
              └──────────────────┬───────────────────┘
                                 │
        ┌────────────┬───────────┼───────────┬──────────────┐
        │            │           │           │              │
   ┌────▼────┐  ┌────▼────┐  ┌──▼───┐  ┌────▼─────┐  ┌─────▼──────┐
   │Postgres │  │ Storage │  │ Auth │  │ Realtime │  │  Lovable   │
   │  + RLS  │  │ private │  │OAuth │  │ channels │  │ AI Gateway │
   └─────────┘  └─────────┘  └──────┘  └──────────┘  └────────────┘
```

---

## 🌐 SevenDevX — Site Público

Construído para **conversão + autoridade + descoberta por IA**.

### 📄 Páginas principais
- 🏠 `/` — Hero, Serviços, **PsicoOne hero card**, Tech Stack, Testimonials 3D, Contato
- 👤 `/sobre` — Sobre com counters premium e timeline
- 🛎️ `/servicos` — Catálogo CMS-driven
- 💼 `/projetos` + `/projetos/:slug` — Portfólio com `layoutId` transitions + 3D tilt
- ✍️ `/blog` + `/blog/:slug` — CMS com schema.org `Article`, reading progress, shared layout
- 📬 `/contato` — Multi-step form, salva no DB antes do redirect (zero perda de lead)
- 🛒 `/store`, `/fornecedores`, `/perfil`, `/auth`
- 📍 `/local/:cidade` — 15 páginas SEO local (BH, SP, RJ, POA, FLN, SSA, REC, FOR, GYN, CPQ, VIX, MAO, UDI, …)
- 🤖 `/geo/*` — AI Hub, Case Studies, Content Clusters, Solution Pages

### ✨ UX Premium
- Glassmorphism + monochrome bg/fg
- Motion design global (spring `stiffness: 150, damping: 20`)
- 3D tilt nos cards de projeto/serviço (desativado no mobile)
- FAB WhatsApp + Chatbot 7AI flutuantes
- **Command Palette ⌘K** (busca cross-entidade)
- Exit-intent popup
- PWA instalável + offline fallback
- Page transitions com `AnimatePresence`

---

## 🛠️ SevenOS — ERP/CRM Interno

Acessível em `/admin/*` para usuários com role `admin` ou `moderator` (RBAC via `user_roles` + `has_role()` security-definer).

### 🗂️ 28 Módulos do SevenOS

| Categoria | Módulo | Rota | Função |
|---|---|---|---|
| 🏠 **Core** | Dashboard | `/admin` | KPIs, leads, gráficos Recharts, ActivityFeed Realtime |
| 👥 **CRM** | Clientes | `/admin/clients` | CRM + histórico de interações |
| 👥 | Pipeline | `/admin/pipeline` | Kanban de oportunidades + stage log |
| 👥 | Contact Center | `/admin/contact-center` | Inbox de mensagens do site |
| 📂 **Projetos** | Projetos | `/admin/projects` | Listagem + filtros + cards 3D |
| 📂 | Projeto detalhe | `/admin/projects/:id` | Stages, checklists, docs, integrações, finanças, time tracking |
| 📂 | Processos | `/admin/process` | Templates de processo reutilizáveis |
| 💰 **Financeiro** | Financeiro | `/admin/finance` | Transactions, budgets, FX rates, margem (`fn_project_margin`) |
| 🎨 **CMS** | Serviços | `/admin/services` | Edita `/servicos` |
| 🎨 | Tecnologias | `/admin/technologies` | Registry de techs |
| 🎨 | Tags | `/admin/tags` | Tag registry central |
| 🎨 | FAQ | `/admin/faq` | FAQ + Speakable schema |
| 🎨 | Logo Lab | `/admin/logo-lab` | Extração de paleta dominante |
| 🎨 | Logo Library | `/admin/logo-library` | Biblioteca de marcas |
| 🔌 **Integrações** | Marketplace | `/admin/integrations` | Stripe, Resend, Slack, Discord, WhatsApp, Vercel, GitHub, Figma, OpenAI… |
| 🔌 | Automações | `/admin/automations` | Flow builder visual + runs |
| 🔌 | Webhooks | `/admin/webhooks` | Dispatch + debugger + payload viewer |
| 🤖 **IA & SEO** | AI Ops | `/admin/ai-ops` | Telemetria de uso de IA |
| 🤖 | GEO Analytics | `/admin/geo-analytics` | Health Score, bot hits, indexação |
| 🤖 | Citation Engine | `/admin/citations` | Monitor de menções em ChatGPT/Gemini/Claude/Perplexity/Copilot — **pausável**, queries/modelos editáveis |
| 🤖 | Search Console | `/admin/search-console` | GSC via Connector Gateway |
| 📊 **Observabilidade** | System Health | `/admin/system-health` | Status grid + activity realtime |
| 📊 | Incidents | `/admin/incidents` | Timeline de incidentes |
| 📊 | Logs | `/admin/logs` | Logs centralizados |
| 📊 | Events | `/admin/events` | Audit log + activity feed |
| 🔐 **Acesso** | Security | `/admin/security` | Sessions + scans |
| 🔐 | Users | `/admin/users` | RBAC + UserDetailsModal |
| 🔐 | Sessions | `/admin/sessions` | Admin sessions ativas |

### 🎁 Recursos Transversais do SevenOS
- ⌘K **Command Palette** (busca + ações cross-entidade)
- 📡 **Activity Feed em tempo real** (Realtime + trigger de audit)
- 🧠 **Smart Insights** com recomendações de IA
- 📱 **Mobile Bottom Nav** + **Radial Action Menu** + **Global FAB**
- ⏱️ **Time Tracker Widget** flutuante (start/stop por projeto)
- 📎 **AttachmentManager** com bucket privado + signed URLs
- 🔔 **Push Notifications** (VAPID)
- 📝 **Contract Builder** com versionamento e diff modal

---

## ☁️ O que é "Serverless" aqui?

**Serverless ≠ "sem servidor".** Significa que **você não gerencia, mantém ou paga por servidor ocioso** — o código roda sob demanda em containers efêmeros na borda da rede.

Na SevenDevX isso se traduz em:

| Camada | Onde roda | O que faz |
|---|---|---|
| **Frontend (SPA)** | CDN Vercel (edge) | HTML/JS/CSS estáticos servidos de POPs globais |
| **API / Backend** | **Supabase Edge Functions** (Deno, ~30 regiões) | Todo backend customizado: IA, webhooks, integrações, GSC, push, monitor de citações |
| **Banco** | Supabase Postgres (managed) | Dados transacionais com RLS |
| **Auth** | Supabase Auth (managed) | JWT, OAuth, sessions |
| **Storage** | Supabase Storage (managed) | Buckets S3-compatíveis privados |
| **Realtime** | Supabase Realtime (managed) | WebSockets para Activity Feed, Citations |

### ✅ Benefícios concretos do modelo
- 🌍 **Latência baixa global** (edge runtime na borda)
- 💸 **Custo por uso** — pausou? Custo zero (ex: Citation Monitor pausado = 0 chamadas de IA)
- 🔁 **Auto-scaling infinito** — sem worry de provisionamento
- 🛡️ **Zero patching de SO** — Supabase/Vercel cuidam
- 🚀 **Deploy contínuo** — push → live em ~30s

---

## ⚡️ Edge Functions (28 funções)

Tudo backend roda em **Supabase Edge Functions (Deno runtime)** distribuídas globalmente.

### 🤖 IA & GEO
| Função | Propósito |
|---|---|
| `ai-chat` | Chatbot streaming do site com personalidade 7AI (Markdown, histórico) |
| `ai-engine` | Proxy genérico para Lovable AI Gateway |
| `ai-ops` | Telemetria de uso de IA + recomendações |
| `citation-monitor` | Pergunta às IAs sobre a SevenDevX, classifica sentimento, salva em `ai_citations`. **Pausável** via `citation_monitor_settings.enabled` — quando pausado retorna `{paused:true}` sem chamar nenhum modelo (zero custo) |
| `project-generator` | Cria scaffolding de projeto com IA |

### 🔍 SEO
| Função | Propósito |
|---|---|
| `gsc-insights` | Google Search Console (sites + searchAnalytics) via Connector Gateway |

### 📈 Analytics & Eventos
| Função | Propósito |
|---|---|
| `track-analytics` | Pageviews + eventos customizados |

### 🔗 Integrações & Webhooks
| Função | Propósito |
|---|---|
| `webhook-dispatch` | Envio + retry exponencial de webhooks |
| `provider-secrets-check` | Verifica se cada secret está set (booleano, sem expor valor) — admin-only |
| `provider-test` | Smoke test genérico de provider |
| `vercel-info`, `vercel-test`, `vercel-watch` | Status de deploys, alertas |
| `github-info`, `github-test` | Repo + smoke test |
| `figma-info`, `figma-test` | Workspace + smoke test |
| `stripe-test`, `resend-test`, `slack-test`, `discord-test`, `whatsapp-test`, `openai-test` | Conectividade de cada provider |

### 🔔 Push & Admin
| Função | Propósito |
|---|---|
| `push-public-key` | Retorna VAPID public key |
| `push-send` | Envia Web Push autenticado |
| `admin-delete-user` | Hard delete seguro de usuário (admin-only) |

### 📊 Status do Serverless
- ✅ **28 Edge Functions** em produção
- ✅ Auto-deploy a cada push
- ✅ Cold start médio: **~30–60ms**
- ✅ `corsHeaders` padronizado em todas
- ✅ Validação Zod onde há input do usuário
- ✅ `LOVABLE_API_KEY` **server-side only** (nunca exposto ao browser)
- ✅ Logs centralizados via `console.log` → Supabase Logs

---

## 🗄️ Banco de Dados — RLS + GRANTs

- **46 migrations** versionadas em `supabase/migrations/`
- **RLS habilitado em 100%** das tabelas `public.*`
- **GRANTs explícitos** em cada `CREATE TABLE` (anon/authenticated/service_role)
- **Roles em tabela separada** (`user_roles`) — nunca no `profiles` (anti privilege escalation)
- **Função security-definer** `has_role(uuid, app_role)` usada em todas as policies admin
- **Bucket `attachments` privado** — sempre `createSignedUrl`, nunca `getPublicUrl`
- **Triggers**: `audit_log` automático em mutations sensíveis
- **RPCs**: `fn_project_margin`, `has_role`, `handle_new_user`

---

## 📂 Estrutura Completa de Pastas

```text
sevendevx/
│
├── 📁 public/                              # Estáticos servidos pela CDN
│   ├── 🤖 ai.txt                           # Diretivas para crawlers de IA
│   ├── 🤖 llms.txt                         # Manifesto LLM-friendly
│   ├── 🤖 llm-context.json                 # Dataset estruturado p/ RAG
│   ├── 🤖 robots.txt                       # Libera GPTBot, ClaudeBot, etc
│   ├── 🗺️ sitemap.xml                       # Sitemap dinâmico (cidades + cases + artigos)
│   ├── 📱 manifest.json                    # PWA manifest
│   ├── 📱 sw.js                            # Service Worker compilado
│   ├── 📱 offline.html                     # Fallback offline
│   ├── 🎨 placeholder.svg
│   └── 📁 icons/tech/                      # SVGs de tecnologias (docker, python, …)
│
├── 📁 src/
│   │
│   ├── 📁 app/                             # 🎯 Bootstrap da aplicação
│   │   ├── Providers.tsx                   # QueryClient + Auth + Language + Tooltip
│   │   └── Router.tsx                      # Rotas lazy + AnimatePresence
│   │
│   ├── 📁 pages/                           # 🖼️ Páginas (site + admin)
│   │   ├── Home.tsx, About.tsx, Services.tsx
│   │   ├── Projects.tsx, ProjectsHub.tsx, ProjectDetail.tsx
│   │   ├── Blog.tsx, BlogPost.tsx
│   │   ├── Auth.tsx, Profile.tsx, Fornecedores.tsx, Store.tsx
│   │   ├── PrivacyPolicy.tsx, NotFound.tsx
│   │   │
│   │   ├── 📁 admin/                       # 🛠️ === SevenOS (28 telas) ===
│   │   │   ├── AdminDashboard, ClientsAdmin, PipelineAdmin
│   │   │   ├── ProjectsAdmin, ProjectDetailAdmin, ProcessAdmin
│   │   │   ├── FinanceAdmin, ContactCenterAdmin, EventsAdmin
│   │   │   ├── ServicesAdmin, TechnologiesAdmin, TagsAdmin, FaqAdmin
│   │   │   ├── LogoLabAdmin, LogoLibraryAdmin
│   │   │   ├── IntegrationsAdmin, AutomationsAdmin, WebhooksAdmin
│   │   │   ├── AiOpsAdmin, GeoAnalyticsAdmin, CitationsAdmin, SearchConsoleAdmin
│   │   │   ├── SystemHealthAdmin, IncidentsAdmin, LogsAdmin
│   │   │   └── SecurityAdmin, UsersAdmin, SessionsAdmin
│   │   │
│   │   └── 📁 geo/                         # 🤖 Páginas GEO (AI-first)
│   │       ├── AIHub.tsx                   # Hub de respostas para IAs
│   │       ├── WhySevenDevX.tsx            # Posicionamento E-E-A-T
│   │       ├── CaseStudies.tsx             # 10 cases estruturados
│   │       ├── ContentClusters.tsx         # Topic clusters
│   │       ├── GeoArticle.tsx              # Template de artigo GEO
│   │       ├── LocalSeoPage.tsx            # Template /local/:cidade (15 cidades)
│   │       └── SolutionPage.tsx            # Template de solução
│   │
│   ├── 📁 components/                      # 🧱 Componentes do site
│   │   ├── 🏠 Hero, Header, Footer, ScrollToTop
│   │   ├── 📬 Contact, ContactMultiStep, OrcamentoButton, OrcamentoModal
│   │   ├── 💼 ProjectCard3D, ProjectModal, ProjectsPreview, PortfolioCarousel3D, PortfolioFilter, FeaturedProjects
│   │   ├── 🛎️ ServiceCard3D, ServicesPreview
│   │   ├── ⚛️ TechShowcase, TechIcon, TechIconCDN, TechModal, TechPreview, TagIcon
│   │   ├── 💬 TestimonialsCarousel3D, Testimonials
│   │   ├── 🤖 AIChatbot, WhatsAppButton, ExitIntentPopup
│   │   ├── 🎨 GlassCard, PageTransition, SectionDivider, SkeletonLoader
│   │   ├── 🔍 SEOHead, BreadcrumbSchema, EntityGraphSchema, GeoKnowledgeGraph
│   │   ├── 📱 PWAUpdatePrompt, AppInstallerButton, LanguageSwitcher
│   │   │
│   │   ├── 📁 admin/                       # 🛠️ Componentes do SevenOS
│   │   │   ├── AdminMenu, AdminPageShell, AdminComingSoon, Breadcrumb
│   │   │   ├── GlobalSearch (⌘K), KpiCards, ActivityFeed
│   │   │   ├── SmartInsights, AiInsightsBlock, AiProjectGeneratorModal
│   │   │   ├── CitationMonitorSettings  ⬅ pausa, queries, modelos
│   │   │   ├── ContractCard, ContractVersionHistory, AuditDiffModal
│   │   │   ├── AttachmentManager, FilePreview, IconUploader
│   │   │   ├── ClientPicker, TagMultiSelect, TechMultiSelect
│   │   │   ├── PricingEngineModal, PushSubscribeButton, StageDocuments
│   │   │   ├── 📁 finance/   ProjectFinanceBlock, TimeTrackerWidget
│   │   │   └── 📁 integrations/   ProjectIntegrationsBlock
│   │   │
│   │   ├── 📁 auth/ProtectedRoute.tsx      # Guard de role + redirect
│   │   ├── 📁 layout/ Container, Section
│   │   ├── 📁 security/Blocker.tsx         # Bloqueio anti-bot
│   │   ├── 📁 services/ FAQSection, ProcessSection
│   │   └── 📁 ui/                          # shadcn/ui (button, dialog, sheet, …)
│   │
│   ├── 📁 modules/                         # 🧩 Features ricas do SevenOS
│   │   ├── 📁 automations/   AutomationFlowBuilder, AutomationGuideDrawer
│   │   ├── 📁 branding/      LogoEditorModal
│   │   ├── 📁 integrations/  Marketplace, ProviderConfig, Logs, TestPanel, ProviderLogo, providerCatalog
│   │   ├── 📁 layout/        GlobalFAB, MobileBottomNav, RadialActionMenu
│   │   ├── 📁 system-health/ HealthStatusGrid, RealtimeActivityFeed, AIRecommendationPanel
│   │   ├── 📁 users/         UserDetailsModal
│   │   └── 📁 webhooks/      WebhookDebugger, WebhookGuideDrawer, WebhookPayloadViewer
│   │
│   ├── 📁 hooks/                           # 🪝 Hooks customizados
│   │   ├── useProjects, useFinance, useTimeTracking
│   │   ├── useIntegrations, useIntegrationFavorites, useAttachments
│   │   ├── useAuditLog, useSmartInsights, useAnalytics
│   │   ├── useAiReferralTracker, usePushSubscription, useSessionTracker
│   │   ├── useBrandPalette, useExtractedColor, useResolvedAccent, useLogoOverrides
│   │   ├── useContacts, useContractVersions, useDocuments, useEcosystem
│   │   ├── useRegistry, useScrollLock, useSmartBack
│   │   ├── use-mobile, use-toast
│   │
│   ├── 📁 contexts/AuthContext.tsx         # 🔐 Auth global (ÚNICO ponto)
│   ├── 📁 i18n/                            # 🌍 PT/EN/ES (LanguageContext + translations)
│   ├── 📁 integrations/supabase/           # 🔌 client + types (auto-gerados — NÃO editar)
│   ├── 📁 core/branding/palette-engine/    # 🎨 Extração de paleta dominante
│   ├── 📁 data/                            # 📊 projects, caseStudies, geoContent, contentClusters, entityGraph
│   ├── 📁 lib/                             # 🛠️ utils, storage, money, contractBuilder, colorExtract
│   ├── 📁 utils/                           # 🛠️ authErrors, theme, safeStorage, pdfExport, browserStorageGuard, registerServiceWorker
│   ├── 📁 assets/                          # 🎨 logo.svg, icons, imagens otimizadas
│   ├── App.tsx, main.tsx, sw.ts
│   ├── index.css                           # 🎨 Design tokens (HSL semânticos)
│   └── fonts.css
│
├── 📁 supabase/
│   ├── config.toml
│   ├── 📁 migrations/                      # 🗄️ 46 migrations versionadas (RLS + GRANTs)
│   └── 📁 functions/                       # ☁️ === 28 Edge Functions ===
│       ├── 🤖 ai-chat, ai-engine, ai-ops
│       ├── 🤖 citation-monitor, project-generator
│       ├── 🔍 gsc-insights
│       ├── 📈 track-analytics
│       ├── 🔗 webhook-dispatch
│       ├── 🔔 push-public-key, push-send
│       ├── 🔐 admin-delete-user
│       ├── 🔐 provider-secrets-check, provider-test
│       ├── 🟢 vercel-info, vercel-test, vercel-watch
│       ├── 🟢 github-info, github-test
│       ├── 🟢 figma-info, figma-test
│       ├── 🟢 stripe-test, resend-test, slack-test
│       └── 🟢 discord-test, whatsapp-test, openai-test
│
├── 📁 scripts/   generate-pwa-icons.js
├── ⚙️ tailwind.config.ts, vite.config.ts, vercel.json
├── ⚙️ components.json (shadcn), eslint.config.js
├── ⚙️ tsconfig.json, tsconfig.app.json, tsconfig.node.json
├── 📄 index.html
└── 📄 README.md
```

---

## 🎨 Design System

- **Tokens semânticos HSL** em `src/index.css` (zero `text-white`/`bg-black` em components)
- **Glassmorphism + monochrome bg/fg** — visual enterprise/futurista
- **Framer Motion ONLY** (proibido GSAP) — spring `stiffness: 150, damping: 20`
- **3D tilt diferenciado**: Services tilt suave, Projects tilt 6° (desativado mobile)
- **Mobile-first**: `w-full overflow-x-hidden` no body, nunca `100vw`
- **Typography fluida**: `clamp()` em toda escala tipográfica
- **Modal scroll lock**: `useScrollLock.ts` com compensação de scrollbar

---

## 🌍 SEO + GEO (AI-first)

| Asset | Estado |
|---|---|
| `sitemap.xml` dinâmico (cidades + cases + artigos) | ✅ |
| `robots.txt` libera GPTBot, ClaudeBot, PerplexityBot, Google-Extended | ✅ |
| `llms.txt` + `llm-context.json` | ✅ |
| Schema.org sitewide (Organization, LocalBusiness, BreadcrumbList, FAQ, Article, Speakable) | ✅ |
| Entity Graph com 20+ relacionamentos | ✅ |
| Open Graph + Twitter Card em todas as páginas | ✅ |
| Páginas locais com `geo.region` + `GeoCoordinates` | ✅ 15 cidades |
| Artigos GEO em `/geo/*` com FAQ + Speakable | ✅ 13 |
| Citation Engine monitorando ChatGPT/Gemini/Claude/Perplexity/Copilot | ✅ pausável |

---

## 🔐 Segurança + RBAC

- **Auth**: Supabase Auth (email + Google OAuth, sem signup anônimo)
- **RBAC**: roles em `user_roles` + `has_role()` security-definer (nunca no profile)
- **RLS**: ativada em todas as tabelas `public.*` com `GRANT`s explícitos
- **Storage**: bucket `attachments` privado, signed URLs obrigatórias
- **CSP**: `connect-src` Vercel + Supabase configurado em `vercel.json`
- **Service Worker**: `NetworkOnly` para `*.supabase.co` (zero cache de auth)
- **Edge Functions**: Zod em todos os inputs; admin-only checks via `has_role`
- **Secrets**: `LOVABLE_API_KEY`, `VAPID_*`, provider keys — apenas em Edge runtime
- **Audit log** automático via trigger em mutações sensíveis
- **anti-bot Blocker** em rotas privadas

---

## 🚀 Performance & PWA

- ⚡ **Lighthouse Performance**: 90+ mobile
- ♿ **Acessibilidade**: WCAG AA
- 📱 **PWA instalável** com Service Worker próprio
- 🌐 **Offline fallback** (`/offline.html`)
- 🔁 **PWA Update Prompt** automático
- 🧊 **Code-splitting** por rota (lazy + Suspense)
- 🖼️ **Lazy loading** em todas as imagens
- 🎯 **Preload** de fonts críticas
- 🛡️ **Iframe guard** no Service Worker

---

## 🌎 Internacionalização

- 🇧🇷 Português · 🇺🇸 English · 🇪🇸 Español
- Implementado via `LanguageContext` + `translations.ts` + `useTranslation()`
- LanguageSwitcher no Header

---

## 💻 Como Rodar Localmente

```bash
# 1. Clone
git clone https://github.com/DavidsonDias/sevendevx.git
cd sevendevx

# 2. Instale (bun é mais rápido)
bun install        # ou: npm install

# 3. Envs
cp .env.example .env
# preencha: VITE_SUPABASE_URL, VITE_SUPABASE_PUBLISHABLE_KEY, VITE_SUPABASE_PROJECT_ID

# 4. Dev server
bun dev            # → http://localhost:5173
```

> Edge functions e migrations são deployadas automaticamente pelo Lovable. **Não precisa rodar `supabase` CLI localmente.**

---

## 📊 Status do Projeto

| Métrica | Estado |
|---|---|
| 🟢 **Deploy** | Online em Vercel + Lovable |
| 🟢 **PWA** | Instalável, offline fallback ativo |
| 🟢 **GEO Health Score** | 68/100 (Sólido) |
| 🟢 **Indexação técnica** | 9/9 checklist OK |
| 🟢 **Artigos GEO publicados** | 13 |
| 🟢 **Páginas locais ativas** | 15 cidades |
| 🟢 **Search Console** | Conectado (`sc-domain:sevendevx.com`) |
| 🟢 **Bots únicos detectados** | Bingbot / Copilot ativos |
| 🟢 **Citation Monitor** | Operacional, pausável, queries/modelos editáveis |
| 🟢 **Edge Functions** | 28 deployadas |
| 🟢 **Migrations** | 46 versionadas |
| 🟢 **Lighthouse Performance** | 90+ mobile |
| 🟢 **Acessibilidade** | WCAG AA |

---

## 🗺️ Roadmap

- [ ] Multi-tenant **opcional** do SevenOS para clientes selecionados
- [ ] App mobile nativo (React Native compartilhando hooks)
- [ ] AI Copilot interno no SevenOS (CRUD por linguagem natural)
- [ ] Marketplace de templates de processo
- [ ] BI embarcado com dashboards customizáveis
- [ ] Integração WhatsApp Business API oficial

---

## 📜 Licença

MIT © [Davidson Dias](https://github.com/DavidsonDias) — SevenDevX

---

<div align="center">

### 🇧🇷 Construído com ❤️ em Belo Horizonte · MG · Brasil

[🌐 sevendevx.com](https://sevendevx.com) · [💼 LinkedIn](https://linkedin.com/company/sevendevx) · [✉️ contato@sevendevx.com](mailto:contato@sevendevx.com)

<sub>SevenDevX · Web Development · Custom Software · AI Integration · GEO/SEO</sub>

</div>
