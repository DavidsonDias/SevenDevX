<div align="center">

<img src="src/assets/logo.svg" alt="SevenDevX" width="380" />

# SevenDevX — Plataforma Web + SevenOS

**Site institucional premium + ERP/CRM interno (SevenOS) construído em uma única stack React/Supabase.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
![Last Commit](https://img.shields.io/github/last-commit/DavidsonDias/sevendevx)
[![Deploy on Vercel](https://img.shields.io/badge/Deploy-Vercel-black?logo=vercel)](https://vercel.com/sevendevx)
![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/React-20232A?logo=react&logoColor=61DAFB)
![Vite](https://img.shields.io/badge/Vite-646CFF?logo=vite&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-38B2AC?logo=tailwind-css&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-3ECF8E?logo=supabase&logoColor=white)
![PWA](https://img.shields.io/badge/PWA-Enabled-5A0FC8?logo=pwa)

🔗 **Produção:** [sevendevx.com](https://sevendevx.com) · [sevendevx.lovable.app](https://sevendevx.lovable.app)

</div>

---

## 📖 Sobre

A **SevenDevX** é um studio brasileiro de desenvolvimento de software com sede em **Belo Horizonte (MG)**, especializado em sites de alta conversão, sistemas web sob medida (ERP/CRM), SaaS e integração com IA.

Este repositório contém **dois produtos rodando na mesma stack**:

| Produto | O que é | Rota |
|---|---|---|
| **SevenDevX** (site público) | Site institucional, portfólio, blog, GEO/SEO, captação de leads | `/`, `/sobre`, `/servicos`, `/projetos`, `/blog`, `/contato` |
| **SevenOS** (ERP/CRM interno) | Painel administrativo enterprise: clientes, projetos, financeiro, automações, IA Ops, GEO Analytics, monitor de citações em IAs | `/admin/*` |

> *"Transformamos ideias em soluções digitais de alto impacto."*

---

## 🧩 Stack

### Core
| Tecnologia | Versão | Função |
|---|---|---|
| **React** | 18.3 | UI |
| **TypeScript** | 5+ | Tipagem |
| **Vite** | 5+ | Build / Dev server |
| **Tailwind CSS** | 3+ | Styling (tokens semânticos) |
| **Framer Motion** | 12+ | Animações cinematográficas |
| **Supabase** | Cloud | Auth, Postgres, Edge Functions, Storage, Realtime |
| **Vercel** | — | Hosting + Edge Network |

### Bibliotecas-chave
- **UI**: shadcn/ui, Radix, lucide-react
- **Forms**: React Hook Form + Zod
- **Data**: TanStack Query, React Router v6
- **Charts**: Recharts
- **PWA**: vite-plugin-pwa + Workbox (NetworkOnly para Supabase)
- **i18n**: contexto próprio com PT/EN/ES
- **AI**: Lovable AI Gateway (Gemini, GPT-5)

---

## 🌐 SevenDevX — o site público

Site institucional construído para **conversão + autoridade**.

**Páginas principais:**
- `/` — Home com Hero, Serviços, Projetos em destaque (PsicoOne hero card), Tech Stack, Testimonials 3D, Contato
- `/sobre` — About com contadores premium e timeline
- `/servicos` — Catálogo de serviços (CMS-driven)
- `/projetos` + `/projetos/:slug` — Portfólio com `layoutId` transitions, 3D tilt, modais imersivos
- `/blog` + `/blog/:slug` — CMS com schema.org Article, reading progress, shared layout
- `/contato` — Multi-step form com salvamento prévio no DB
- `/auth`, `/perfil`, `/fornecedores`, `/store`

**SEO / GEO (Generative Engine Optimization):**
- `llms.txt`, `ai.txt`, `llm-context.json`, `robots.txt`, `sitemap.xml` dinâmico
- Schema.org sitewide: Organization, LocalBusiness, BreadcrumbList, Entity Graph
- 15 páginas locais (`/local/:cidade`) com `geo.region` + `GeoCoordinates`
- 13+ artigos GEO em `/geo/*` com FAQ + Speakable schema
- Case studies estruturados (`CaseStudies.tsx`)
- Content clusters (`ContentClusters.tsx`)

**UX premium:**
- Glassmorphism + monochrome bg/fg
- Motion design global (spring stiffness 150, damping 20)
- 3D tilt nos cards (desativado no mobile)
- FAB WhatsApp + Chatbot IA
- PWA instalável com Service Worker próprio
- Exit-intent popup, Command Palette ⌘K

---

## 🛠️ SevenOS — o ERP/CRM interno

> ⚠️ **SevenOS é um ERP/CRM INTERNO da SevenDevX**, não um SaaS multi-tenant. Não há billing/quota/planos.

Acessível em `/admin/*` apenas para usuários com role `admin`/`moderator` (RBAC via `user_roles` + `has_role()` security-definer).

### Módulos do SevenOS

| Módulo | Rota | Descrição |
|---|---|---|
| **Dashboard** | `/admin` | KPIs, leads, gráficos Recharts, ActivityFeed em tempo real |
| **Clientes** | `/admin/clients` | CRM com histórico de interações |
| **Pipeline** | `/admin/pipeline` | Kanban de oportunidades + stage log |
| **Projetos** | `/admin/projects` + `/admin/projects/:id` | Projetos completos com stages, checklists, documentos, integrações, finanças, time tracking |
| **Financeiro** | `/admin/finance` | Transactions, budgets, FX rates, margem por projeto via RPC `fn_project_margin` |
| **Processos** | `/admin/process` | Templates de processos reutilizáveis com stages |
| **Contatos** | `/admin/contact-center` | Inbox de mensagens do site |
| **Eventos** | `/admin/events` | Audit log + activity feed |
| **Serviços CMS** | `/admin/services` | Edita o que aparece em `/servicos` |
| **Tecnologias** | `/admin/technologies` | Registry de techs do portfólio |
| **Tags** | `/admin/tags` | Tag registry centralizado |
| **FAQ** | `/admin/faq` | CMS de FAQ com Speakable schema |
| **Logo Lab + Library** | `/admin/logo-lab`, `/admin/logo-library` | Branding/extração de paleta |
| **Integrações** | `/admin/integrations` | Marketplace + setup guides (Stripe, Resend, Slack, Discord, WhatsApp, Vercel, GitHub, Figma, OpenAI, etc) |
| **Automações** | `/admin/automations` | Flow builder visual + runs |
| **Webhooks** | `/admin/webhooks` | Dispatch + debugger + payload viewer |
| **AI Ops** | `/admin/ai-ops` | Painel de uso de IA, recomendações |
| **GEO Analytics** | `/admin/geo-analytics` | Health Score, AI bot hits, indexação |
| **Citation Engine** | `/admin/citations` | Monitor automático de menções da SevenDevX em ChatGPT/Gemini/Claude/Perplexity/Copilot (pausável, queries editáveis, modelos selecionáveis) |
| **Search Console** | `/admin/search-console` | GSC via Lovable Connector Gateway |
| **System Health** | `/admin/system-health` | Status grid + realtime activity |
| **Incidents** | `/admin/incidents` | Timeline de incidentes |
| **Logs** | `/admin/logs` | Logs centralizados |
| **Security** | `/admin/security` | Sessions, scans |
| **Users** | `/admin/users` | RBAC + UserDetailsModal |
| **Sessions** | `/admin/sessions` | Admin sessions ativas |

### Recursos transversais do SevenOS
- **Command Palette ⌘K** com busca cross-entidade e ações
- **Activity Feed em tempo real** via Supabase Realtime + trigger de audit
- **Smart Insights** com recomendações de IA
- **Mobile Bottom Nav** + Radial Action Menu + FAB Global
- **Time Tracker Widget** flutuante (start/stop por projeto)
- **AttachmentManager** com bucket `attachments` **privado** (signed URLs obrigatórias)
- **Push notifications** via VAPID (`push-public-key`, `push-send`)

---

## 📂 Estrutura de pastas

```
sevendevx/
├── public/                          # Estáticos servidos pela CDN
│   ├── llms.txt, ai.txt             # Diretivas para LLMs (ChatGPT, Claude, etc)
│   ├── llm-context.json             # Dataset estruturado p/ RAG
│   ├── robots.txt, sitemap.xml      # SEO clássico
│   ├── manifest.json, sw.js         # PWA
│   ├── offline.html                 # Fallback offline
│   └── icons/tech/                  # SVGs das tecnologias
│
├── src/
│   ├── app/
│   │   ├── Providers.tsx            # QueryClient + Auth + Language + Tooltip
│   │   └── Router.tsx               # Rotas lazy + AnimatePresence
│   │
│   ├── pages/                       # Site público (Home, Blog, Projetos, etc)
│   │   ├── admin/                   # === SevenOS (28 telas admin) ===
│   │   │   ├── AdminDashboard, ProjectsAdmin, ProjectDetailAdmin
│   │   │   ├── ClientsAdmin, PipelineAdmin, FinanceAdmin
│   │   │   ├── CitationsAdmin, GeoAnalyticsAdmin, SearchConsoleAdmin
│   │   │   ├── AutomationsAdmin, WebhooksAdmin, IntegrationsAdmin
│   │   │   ├── AiOpsAdmin, SystemHealthAdmin, SecurityAdmin
│   │   │   ├── ServicesAdmin, TechnologiesAdmin, TagsAdmin, FaqAdmin
│   │   │   ├── LogoLabAdmin, LogoLibraryAdmin
│   │   │   ├── EventsAdmin, IncidentsAdmin, LogsAdmin
│   │   │   ├── SessionsAdmin, UsersAdmin, ContactCenterAdmin
│   │   │   └── ProcessAdmin
│   │   └── geo/                     # Páginas GEO (Generative Engine Optimization)
│   │       ├── AIHub, WhySevenDevX, CaseStudies, ContentClusters
│   │       ├── GeoArticle, LocalSeoPage, SolutionPage
│
│   ├── components/
│   │   ├── Hero, Header, Footer, Contact, ContactMultiStep
│   │   ├── ProjectCard3D, ServiceCard3D, TestimonialsCarousel3D
│   │   ├── PortfolioCarousel3D, PortfolioFilter, ProjectModal
│   │   ├── TechShowcase, TechIcon, TechModal
│   │   ├── AIChatbot, WhatsAppButton, ExitIntentPopup
│   │   ├── GlassCard, PageTransition, SectionDivider
│   │   ├── SEOHead, BreadcrumbSchema, EntityGraphSchema, GeoKnowledgeGraph
│   │   ├── PWAUpdatePrompt, AppInstallerButton
│   │   ├── admin/                   # Componentes do SevenOS
│   │   │   ├── AdminMenu, AdminPageShell, GlobalSearch (⌘K)
│   │   │   ├── ActivityFeed, KpiCards, SmartInsights, AiInsightsBlock
│   │   │   ├── CitationMonitorSettings (pausa/edita queries/modelos)
│   │   │   ├── ContractCard, ContractVersionHistory, AuditDiffModal
│   │   │   ├── AttachmentManager, FilePreview, IconUploader
│   │   │   ├── ClientPicker, TagMultiSelect, TechMultiSelect
│   │   │   ├── PricingEngineModal, AiProjectGeneratorModal
│   │   │   ├── PushSubscribeButton, Breadcrumb, StageDocuments
│   │   │   ├── finance/ (ProjectFinanceBlock, TimeTrackerWidget)
│   │   │   └── integrations/ (ProjectIntegrationsBlock)
│   │   ├── auth/ProtectedRoute.tsx  # Guard de role
│   │   ├── layout/ (Container, Section)
│   │   ├── security/Blocker.tsx     # Bloqueio anti-bot
│   │   ├── services/ (FAQSection, ProcessSection)
│   │   └── ui/                      # shadcn (button, dialog, sheet, …)
│
│   ├── modules/                     # Features ricas do SevenOS
│   │   ├── automations/             # Flow builder + guide drawer
│   │   ├── branding/                # LogoEditorModal
│   │   ├── integrations/            # Marketplace, ProviderConfig, Logs, TestPanel
│   │   ├── layout/                  # GlobalFAB, MobileBottomNav, RadialActionMenu
│   │   ├── system-health/           # HealthGrid, RealtimeActivityFeed, AIRecommendations
│   │   ├── users/UserDetailsModal
│   │   └── webhooks/                # Debugger, GuideDrawer, PayloadViewer
│
│   ├── hooks/                       # useAuth(Context), useProjects, useFinance,
│   │                                # useTimeTracking, useIntegrations, useAttachments,
│   │                                # useAuditLog, useSmartInsights, useAnalytics,
│   │                                # useAiReferralTracker, usePushSubscription, …
│   │
│   ├── contexts/AuthContext.tsx     # Auth global (ÚNICO ponto, useAuth.ts removido)
│   ├── i18n/                        # PT/EN/ES (LanguageContext + translations)
│   ├── integrations/supabase/       # client + types (gerados — não editar)
│   ├── core/branding/palette-engine/  # Extração de paleta dominante
│   ├── data/                        # projects, caseStudies, geoContent,
│   │                                # contentClusters, entityGraph
│   ├── lib/                         # utils, storage, money, contractBuilder, colorExtract
│   ├── utils/                       # authErrors, theme, safeStorage, pdfExport,
│   │                                # browserStorageGuard, registerServiceWorker
│   ├── assets/                      # logo.svg, icons, imagens otimizadas
│   ├── App.tsx, main.tsx, sw.ts
│   ├── index.css                    # Design tokens (HSL semânticos)
│   └── fonts.css
│
├── supabase/
│   ├── config.toml
│   ├── migrations/                  # Schema versionado (RLS + GRANTs)
│   └── functions/                   # === 26 Edge Functions (serverless) ===
│       ├── ai-chat                  # Chatbot streaming (7AI personality)
│       ├── ai-engine                # Lovable AI Gateway proxy
│       ├── ai-ops                   # Painel de uso/recomendações
│       ├── citation-monitor         # Monitora menções em ChatGPT/Gemini/Claude
│       ├── gsc-insights             # Google Search Console via Connector Gateway
│       ├── project-generator        # Geração de projetos via IA
│       ├── track-analytics          # Captura pageviews/eventos
│       ├── webhook-dispatch         # Disparo + retry de webhooks
│       ├── push-public-key, push-send       # Web Push (VAPID)
│       ├── admin-delete-user        # User management seguro
│       ├── provider-secrets-check, provider-test
│       ├── vercel-info, vercel-test, vercel-watch
│       ├── github-info, github-test
│       ├── figma-info, figma-test
│       ├── stripe-test, resend-test
│       ├── slack-test, discord-test
│       ├── whatsapp-test, openai-test
│
├── scripts/generate-pwa-icons.js
├── tailwind.config.ts, vite.config.ts, vercel.json
├── components.json (shadcn)
└── README.md
```

---

## ⚡ Serverless (Edge Functions)

Tudo backend roda em **Supabase Edge Functions (Deno runtime)** distribuídas globalmente. Zero servidor próprio para manter.

| Função | Categoria | Propósito |
|---|---|---|
| `ai-chat` | IA | Chatbot streaming do site (personalidade 7AI) |
| `ai-engine` | IA | Proxy genérico p/ Lovable AI Gateway |
| `ai-ops` | IA | Telemetria de uso + recomendações |
| `citation-monitor` | GEO | Pergunta às IAs sobre a SevenDevX, classifica sentimento, salva em `ai_citations`. **Pausável** via `citation_monitor_settings.enabled` — quando pausado retorna `{paused:true}` sem chamar nenhum modelo (zero custo) |
| `gsc-insights` | SEO | Google Search Console (sites + searchAnalytics) via Connector Gateway |
| `project-generator` | IA | Cria scaffolding de projeto com IA |
| `track-analytics` | Analytics | Pageviews + eventos custom |
| `webhook-dispatch` | Integração | Envia + retry de webhooks |
| `push-public-key`, `push-send` | Push | Web Push (VAPID) |
| `admin-delete-user` | Admin | Hard delete seguro |
| `provider-secrets-check`, `provider-test` | Integração | Valida credenciais de providers |
| `vercel-info/test/watch` | DevOps | Status de deploys, alertas |
| `github-info/test`, `figma-info/test` | DevOps | Integrações de design/code |
| `stripe-test`, `resend-test`, `slack-test`, `discord-test`, `whatsapp-test`, `openai-test` | Integração | Smoke tests de cada provider |

### Status atual do serverless
✅ **26 Edge Functions deployadas e em produção**
✅ Auto-deploy a cada push (gerenciado pelo Lovable)
✅ Cold start médio: ~30–60ms
✅ `corsHeaders` padronizado em todas
✅ Validação Zod onde há input de usuário
✅ `LOVABLE_API_KEY` server-side only (nunca exposto ao browser)
✅ RLS habilitado em **todas** as tabelas `public.*` com GRANTs explícitos
✅ Bucket `attachments` privado com signed URLs

---

## 🚀 Como rodar localmente

```bash
# 1. Clone
git clone https://github.com/DavidsonDias/sevendevx.git
cd sevendevx

# 2. Instale (use bun se possível — é mais rápido)
bun install            # ou: npm install

# 3. Configure as envs (Vercel/Supabase)
cp .env.example .env   # preencha VITE_SUPABASE_URL + VITE_SUPABASE_PUBLISHABLE_KEY

# 4. Rode
bun dev                # http://localhost:5173
```

> Edge functions e migrations são deployados automaticamente pela infra do Lovable. Não é necessário rodar `supabase` CLI localmente.

---

## 📊 Status do site

| Métrica | Estado |
|---|---|
| **Deploy** | 🟢 Online em Vercel + Lovable |
| **PWA** | 🟢 Instalável, offline fallback ativo |
| **GEO Health Score** | 🟢 68/100 (Sólido) |
| **Indexação técnica** | 🟢 9/9 checklist OK |
| **Artigos GEO publicados** | 🟢 13 |
| **Páginas locais ativas** | 🟢 15 cidades |
| **Search Console** | 🟢 Conectado (`sc-domain:sevendevx.com`) |
| **Bots únicos detectados** | Bingbot/Copilot ativo |
| **Citation Monitor** | 🟢 Operacional, pausável, queries/modelos editáveis |
| **Lighthouse Performance** | 90+ (mobile) |
| **Acessibilidade** | WCAG AA |

---

## 🔐 Segurança

- **Auth**: Supabase Auth (email + Google OAuth)
- **RBAC**: roles em tabela separada (`user_roles`) + função security-definer `has_role()` — **nunca** no profile
- **RLS**: ativada em todas as tabelas, com `GRANT`s explícitos
- **Storage**: bucket `attachments` privado, signed URLs obrigatórias
- **CSP**: `connect-src` Vercel + Supabase configurado
- **Service Worker**: NetworkOnly para `*.supabase.co` (evita cache de auth)
- **Validação**: Zod em todos os inputs de Edge Functions

---

## 🌍 SEO + GEO

- `sitemap.xml` dinâmico com rotas locais + cases + artigos
- `robots.txt` libera explicitamente GPTBot, ClaudeBot, PerplexityBot, Google-Extended
- `llms.txt` + `llm-context.json` para descoberta por LLMs
- Schema.org sitewide: Organization, LocalBusiness, BreadcrumbList, FAQ, Article, Speakable
- Entity Graph com 20+ relacionamentos
- Open Graph + Twitter Card em todas as páginas

---

## 📜 Licença

MIT © [Davidson Dias](https://github.com/DavidsonDias) — SevenDevX

---

<div align="center">

**Construído com ❤️ em Belo Horizonte • MG • Brasil**

[sevendevx.com](https://sevendevx.com) · [LinkedIn](https://linkedin.com/company/sevendevx) · [contato@sevendevx.com](mailto:contato@sevendevx.com)

</div>
