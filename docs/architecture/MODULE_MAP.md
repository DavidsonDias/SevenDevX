# Module Map

Mapa dos módulos reais, seus entry points e dependências de dados.

## SevenOS (admin)

| Módulo | Responsabilidade | Entry point | Tabelas principais | Edge Functions |
|---|---|---|---|---|
| Dashboard | KPIs, insights e atividade | `/admin` | `audit_log`, `projects`, `contacts` | — |
| Projects | Gestão de projetos e stages | `/admin/projects` | `projects`, `project_stages`, `stage_checklist_items`, `stage_documents` | `project-generator` |
| Pipeline | Funil comercial | `/admin/pipeline` | `projects`, `pipeline_stage_log` | `lead-score-ai` |
| CRM / Clients | Clientes e interações | `/admin/clients` | `clients`, `client_interactions`, `contacts` | — |
| Contact Center | Mensagens e templates | `/admin/contact-center` | `contact_messages`, `response_templates` | — |
| WhatsApp Inbox | Conversas Meta Cloud API | `/admin/whatsapp` | `whatsapp_threads`, `whatsapp_messages` | `whatsapp-send`, `whatsapp-webhook`, `whatsapp-test` |
| Finance | Transações, orçamentos, margem | `/admin/financeiro` | `transactions`, `project_budgets`, `time_entries` | — |
| Finance / Clientes | Rentabilidade por cliente | `/admin/finance/clients` | `transactions`, `clients` | — |
| Finance / Conciliação | Importação bancária | `/admin/finance/reconciliation` | `bank_import_batches`, `transactions`, `fx_rates` | — |
| Cashflow | Projeção de caixa | `/admin/cashflow` | `transactions` | — |
| Forecast | Previsão ponderada de pipeline | `/admin/forecast` | `projects` | — |
| Integrations | Providers externos | `/admin/integrations` | `integration_providers`, `integration_logs`, `user_integration_favorites` | `*-test`, `provider-test`, `provider-secrets-check` |
| OAuth | Conexões OAuth (PKCE) | `/admin/oauth` | `oauth_connections` | `oauth-start`, `oauth-callback` |
| Webhooks | Entrega e DLQ | `/admin/webhooks`, `/admin/webhooks/dlq` | `webhooks`, `webhook_deliveries`, `webhook_dlq` | `webhook-dispatch`, `webhook-retry-worker` |
| Automations | Regras e execuções | `/admin/automations`, `/admin/automations/runs` | `automations`, `automation_runs`, `events` | `automation-runner` |
| AI Ops | Operações assistidas por IA | `/admin/ai-ops` | `ai_ops_actions`, `ai_usage` | `ai-ops`, `ai-ops-autonomous`, `ai-engine` |
| Brand Studio | Paleta, tokens e brand kit | `/admin/brand-studio` | `branding_assets`, `logo_variations` | `brand-scan`, `logo-variations-ai` |
| Logo Lab / Library | Geração e acervo de logos | `/admin/logo-lab`, `/admin/logo-library` | `logo_variations`, `branding_assets` | `logo-variations-ai` |
| Blog CMS | Posts e categorias | `/admin/blog` | `blog_posts`, `blog_categories` | — |
| Services CMS | Serviços exibidos no site | `/admin/services` | `services_cms` | — |
| Site Creation CMS | Landing `/criacao-de-sites-profissionais` | `/admin/site-creation` | `site_page_*` | — |
| Registry | Tecnologias e tags | `/admin/technologies`, `/admin/tags` | `tech_registry`, `tag_registry` | — |
| GEO Analytics | Citações e tráfego de IA | `/admin/geo`, `/admin/citations` | `ai_citations`, `ai_referrals`, `citation_monitor_settings` | `citation-monitor` |
| Search Console | Insights de busca | `/admin/search-console` | — | `gsc-insights` |
| Users & Roles | Usuários, papéis, sessões | `/admin/users`, `/admin/sessions` | `profiles`, `user_roles`, `admin_sessions` | `admin-delete-user`, `session-geo` |
| Security | Hub de segurança e MFA | `/admin/security`, `/admin/security/mfa` | `user_mfa`, `audit_log` | `mfa-enroll`, `mfa-verify`, `mfa-disable` |
| System Health | Saúde, incidentes e SLO | `/admin/system-health`, `/admin/incidents` | `service_health_snapshots`, `incidents`, `incident_timeline` | `health-collector`, `incident-notify` |
| Observability | Logs, eventos e auditoria | `/admin/logs`, `/admin/events` | `audit_log`, `analytics_events`, `events` | `track-analytics` |
| Notifications | Central e preferências | `/admin/notifications` | `notifications`, `notification_preferences`, `push_subscriptions` | `push-send`, `push-public-key` |
| Backup / Restore | Export e recuperação | `/admin/backup`, `/admin/restore` | `tenant_backups`, `restore_jobs` | `tenant-export`, `tenant-restore` |
| Cron | Jobs agendados | `/admin/cron` | — (`cron` via RPC `fn_cron_status`) | `daily-digest`, `weekly-intel-report`, `vercel-watch` |
| Settings | Configurações globais | `/admin/settings` | `system_settings` | — |
| Onboarding | Checklist e tour | integrado ao shell admin | `onboarding_progress` | — |

## Site público

| Módulo | Responsabilidade | Entry point |
|---|---|---|
| Home / Institucional | Hero, serviços, tech, projetos | `/`, `/about`, `/services` |
| Portfólio | Projetos e detalhes | `/projects`, `/projects/:slug`, `/projects-hub` |
| Blog | Conteúdo editorial | `/blog`, `/blog/:slug` |
| GEO/SEO | Conteúdo para buscadores e LLMs | `/ai`, `/answers`, `/solucoes`, `/cases`, `/clusters`, `/local/:city`, `/why-sevendevx` |
| Marketplace | Vitrine de integrações | `/integracoes` |
| Criação de Sites | Landing dinâmica via CMS | `/criacao-de-sites-profissionais` |
| Conversão | Diagnóstico, orçamento, WhatsApp | componentes globais |

## Dependências transversais

```text
AuthContext ──> ProtectedRoute ──> páginas /admin
LanguageContext ──> componentes públicos (pt/en/es)
React Query ──> hooks ──> Supabase Client
```
