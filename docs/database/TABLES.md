# Tables

Inventário das tabelas do schema `public` (extraído de `src/integrations/supabase/types.ts`). Campos completos e tipos estão nesse arquivo gerado — aqui documentamos **finalidade, relacionamentos e consumidores**.

## Identidade e acesso

| Tabela | Finalidade | Relacionamentos | Consumidor |
|---|---|---|---|
| `profiles` | Perfil público mínimo do usuário | `auth.users` | Profile, Users Admin |
| `user_roles` | **Única** fonte de papéis (`app_role`) | `auth.users` | `has_role`, RLS de tudo |
| `user_mfa` | Segredo TOTP e backup codes | `auth.users` | MFA Admin |
| `admin_sessions` | Sessões administrativas rastreadas | `auth.users` | Sessions Admin |
| `team_members` | Equipe exibida/institucional | — | Site público, Admin |

## CRM

| Tabela | Finalidade | Relacionamentos | Consumidor |
|---|---|---|---|
| `clients` | Cadastro de clientes | `projects`, `transactions` | Clients Admin |
| `contacts` | Leads capturados (formulários, diagnóstico) | `clients` | Pipeline, Contact Center |
| `client_interactions` | Histórico de contato | `clients` | Clients Admin |
| `contact_messages` | Mensagens recebidas | `contacts` | Contact Center |
| `response_templates` | Respostas padronizadas | — | Contact Center |

## Projetos e processo

| Tabela | Finalidade | Relacionamentos | Consumidor |
|---|---|---|---|
| `projects` | Entidade central de projeto e pipeline | `clients`, `project_stages` | Projects, Pipeline, Site público |
| `project_stages` | Etapas do projeto | `projects` | Project Detail |
| `stage_checklist_items` | Checklist por etapa | `project_stages` | Project Detail |
| `stage_documents` | Documentos por etapa | `project_stages`, `attachments` | Project Detail |
| `process_templates` / `process_template_stages` | Modelos de processo reutilizáveis | — | Process Admin |
| `pipeline_stage_log` | Histórico de mudança de estágio | `projects` | Pipeline, Forecast |
| `contract_versions` | Versionamento de contratos | `projects` | Contratos, IA de contratos |
| `attachments` | Metadados de arquivos (bucket privado) | várias | Attachment Manager |

## Financeiro

| Tabela | Finalidade | Consumidor |
|---|---|---|
| `transactions` | Entradas e saídas | Finance, Cashflow, Reconciliation |
| `project_budgets` | Orçamento por projeto | Finance, margem |
| `time_entries` | Apontamento de horas | Time Tracking, margem |
| `fx_rates` | Câmbio para conversão | Finance |
| `bank_import_batches` | Lotes de importação bancária | Reconciliation |

## Conteúdo e CMS

| Tabela | Finalidade | Leitura anônima |
|---|---|---|
| `blog_posts` / `blog_categories` | Blog | Sim (publicados) |
| `faq_items` / `faq_categories` | FAQ do site | Sim |
| `services_cms` | Serviços exibidos na home e em `/services` | Sim |
| `site_page_config` | Configuração da landing de criação de sites | Sim |
| `site_page_projects` / `site_page_tech` | Projetos e tecnologias destacados | Sim |
| `site_page_faqs` / `site_page_process_steps` / `site_page_metrics` | Blocos da landing | Sim |
| `site_page_comparison_rows` / `site_page_differentials` / `site_page_roi_metrics` | Blocos comparativos | Sim |
| `site_page_diagnostics` | Respostas do diagnóstico do visitante | Não (insert público, leitura admin) |
| `site_page_versions` | Histórico de versões da landing | Não |

## Registries

| Tabela | Finalidade |
|---|---|
| `tech_registry` | Catálogo de tecnologias (ícone, cor, categoria) |
| `tag_registry` | Catálogo de tags |
| `branding_assets` / `logo_variations` | Acervo de marca e variações geradas |

## Integrações e mensageria

| Tabela | Finalidade |
|---|---|
| `integration_providers` | Providers configurados |
| `integration_logs` | Histórico de testes e chamadas |
| `oauth_connections` | Conexões OAuth (PKCE) |
| `user_integration_favorites` | Favoritos por usuário |
| `marketplace_installs` | Instalações do marketplace |
| `whatsapp_threads` / `whatsapp_messages` | Inbox WhatsApp |
| `chat_conversations` / `chat_messages` | Chatbot do site |

## Automação e observabilidade

| Tabela | Finalidade |
|---|---|
| `events` | Barramento de eventos internos |
| `automations` / `automation_runs` | Regras e execuções |
| `webhooks` / `webhook_deliveries` / `webhook_dlq` | Entrega e reprocessamento |
| `audit_log` | Trilha de auditoria de mutações |
| `analytics_events` / `page_views` | Telemetria do site |
| `service_health_snapshots` | Amostras de saúde |
| `incidents` / `incident_timeline` | Gestão de incidentes |
| `vercel_deploy_alerts` | Alertas de deploy |

## IA e GEO

| Tabela | Finalidade |
|---|---|
| `ai_usage` | Consumo e quota de IA |
| `ai_ops_actions` | Ações sugeridas/aplicadas por IA |
| `ai_citations` | Citações da marca por IAs |
| `ai_referrals` | Tráfego originado de IAs |
| `citation_monitor_settings` | Configuração do monitor |

## Plataforma

| Tabela | Finalidade |
|---|---|
| `system_settings` | Configurações globais (admin-only) |
| `notifications` / `notification_preferences` / `push_subscriptions` | Central de notificações e push |
| `onboarding_progress` | Progresso do onboarding |
| `tenant_backups` / `restore_jobs` | Backup e restauração |

> Ao criar tabela nova: atualize esta página, [RLS](RLS.md) e o [MODULE_MAP](../architecture/MODULE_MAP.md).
