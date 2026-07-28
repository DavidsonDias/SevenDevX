# Database (arquitetura)

Postgres gerenciado (Lovable Cloud / Supabase) com RLS habilitado nas tabelas de aplicação.

## Domínios lógicos

```text
Identidade        profiles · user_roles · user_mfa · admin_sessions
CRM               clients · contacts · client_interactions · contact_messages · response_templates
Projetos          projects · project_stages · stage_checklist_items · stage_documents
                  process_templates · process_template_stages · pipeline_stage_log
Financeiro        transactions · project_budgets · time_entries · fx_rates · bank_import_batches
Conteúdo          blog_posts · blog_categories · faq_items · faq_categories · services_cms
                  site_page_* (config, projects, tech, faqs, metrics, process_steps,
                  comparison_rows, differentials, roi_metrics, diagnostics, versions)
Registries        tech_registry · tag_registry · team_members
Integrações       integration_providers · integration_logs · oauth_connections
                  user_integration_favorites · marketplace_installs
Mensageria        whatsapp_threads · whatsapp_messages · chat_conversations · chat_messages
Automação         automations · automation_runs · events · webhooks · webhook_deliveries · webhook_dlq
Observabilidade   audit_log · analytics_events · page_views · service_health_snapshots
                  incidents · incident_timeline · vercel_deploy_alerts
IA / GEO          ai_usage · ai_ops_actions · ai_citations · ai_referrals · citation_monitor_settings
Plataforma        system_settings · notifications · notification_preferences · push_subscriptions
                  onboarding_progress · tenant_backups · restore_jobs · attachments
                  branding_assets · logo_variations · contract_versions
```

Detalhe por tabela: [database/TABLES](../database/TABLES.md).

## Regras estruturais

1. Toda tabela nova no schema `public` recebe `GRANT` explícito na mesma migration (RLS sozinho não basta — PostgREST exige privilégio).
2. Ordem obrigatória: `CREATE TABLE` → `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
3. Leitura anônima só onde o conteúdo é público (CMS do site, blog, serviços, tecnologias, projetos publicados).
4. Papéis vivem só em `user_roles`, consultados por `has_role` (SECURITY DEFINER, `search_path = public`).
5. Funções usadas exclusivamente por triggers têm `EXECUTE` revogado de `PUBLIC`, `anon` e `authenticated`.

## Agregações no banco

Cálculos pesados ficam em RPC (`fn_project_margin`, `fn_cashflow_forecast`, `fn_pipeline_forecast`, `fn_client_finance_summary`, `fn_stale_leads`, `fn_service_slo`) para evitar over-fetching no cliente. Ver [RPC_FUNCTIONS](../database/RPC_FUNCTIONS.md).

## Storage

Bucket `attachments` é **privado**: sempre `createSignedUrl`, nunca `getPublicUrl`.
