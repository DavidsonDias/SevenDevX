# SevenDevX — inventário auditado da origem

> Fase 1, somente leitura. Referência: 2026-10-03 UTC. Nenhuma migração, conexão, publicação ou alteração operacional foi executada.

## Status executivo

- **Origem:** Lovable Cloud, banco PostgreSQL 17.6 gerenciado, ativo, plano Medium.
- **Projeto Lovable:** projeto atual, preservado sem remix.
- **Código auditado:** branch `edit/edt-2d71daa0-e016-4fe2-9ced-6e8a58d97c4a`, commit `d1d645126fc3f515e589696feb9d8f600dcc68fd`.
- **Aplicação:** React/Vite, Vercel, PWA avançada; preview e produção compartilham atualmente uma instância de backend.
- **Destino externo:** **NÃO VERIFICADO** — URL, identificador, estado, região, versão, extensões e conteúdo não foram fornecidos.
- **Viabilidade sem remix:** suportada pelo fluxo oficial atual Export → Remove Cloud → Connect Supabase → Import, mas a troca não é automática. `Remove Lovable Cloud` é irreversível e não pertence a esta fase.

## Banco real auditado

| Item | Evidência do banco real |
|---|---:|
| Tabelas `public` | 80 |
| Registros `public` | 13.492 (soma exata em 2026-10-02) |
| Views `public` | 0 |
| Funções `public` | 78, incluindo funções da extensão `pg_trgm` |
| Funções `SECURITY DEFINER` | 40 |
| Triggers não internos | 88 |
| Policies RLS `public` | 131 |
| Índices `public` | 183 |
| Enums de negócio | 16 |
| Migrations registradas no banco | 69 |
| Realtime | 10 tabelas na publicação principal |
| Jobs `pg_cron` ativos | 13 |

As 80 tabelas são: `admin_sessions`, `ai_citations`, `ai_ops_actions`, `ai_referrals`, `ai_usage`, `analytics_events`, `attachments`, `audit_log`, `automation_runs`, `automations`, `bank_import_batches`, `blog_categories`, `blog_posts`, `branding_assets`, `chat_conversations`, `chat_messages`, `citation_monitor_settings`, `client_interactions`, `clients`, `contact_messages`, `contacts`, `contract_versions`, `events`, `faq_categories`, `faq_items`, `fx_rates`, `incident_timeline`, `incidents`, `integration_logs`, `integration_providers`, `logo_variations`, `marketplace_installs`, `notification_preferences`, `notifications`, `oauth_connections`, `onboarding_progress`, `page_views`, `pipeline_stage_log`, `portfolio_settings`, `process_template_stages`, `process_templates`, `profiles`, `project_budgets`, `project_stages`, `projects`, `push_subscriptions`, `response_templates`, `restore_jobs`, `service_health_snapshots`, `services_cms`, `site_page_comparison_rows`, `site_page_config`, `site_page_diagnostics`, `site_page_differentials`, `site_page_faqs`, `site_page_metrics`, `site_page_process_steps`, `site_page_projects`, `site_page_roi_metrics`, `site_page_tech`, `site_page_versions`, `stage_checklist_items`, `stage_documents`, `system_settings`, `tag_registry`, `team_members`, `tech_categories`, `tech_registry`, `tenant_backups`, `time_entries`, `transactions`, `user_integration_favorites`, `user_mfa`, `user_roles`, `vercel_deploy_alerts`, `webhook_deliveries`, `webhook_dlq`, `webhooks`, `whatsapp_messages`, `whatsapp_threads`.

### Volumes relevantes confirmados

`analytics_events=885`, `page_views=4301`, `service_health_snapshots=6912`, `audit_log=252`, `projects=25`, `tech_registry=166`, `tech_categories=11`, `tag_registry=58`, `contacts=4`, `clients=2`, `blog_posts=12`, `events=10`, `system_settings=19`, `services_cms=7`, `portfolio_settings=1`, `tenant_backups=2`, `user_roles=2`. A consulta completa e reproduzível está em `01-preflight-readonly.sql`.

## Auth e identidade

- 3 usuários em `auth.users`; todos usam identidade de e-mail, estão confirmados e já acessaram.
- 2 vínculos administrativos em `user_roles`; roles permanecem fora de `profiles`.
- `profiles=0`; `user_mfa=0`; fatores MFA do Auth=0.
- FKs e regras dependem da preservação literal de `auth.users.id`; UUIDs não podem ser recriados.
- `handle_new_user`, `has_role`, RPCs administrativas e RLS com `auth.uid()` precisam ser preservados.
- Provedores sociais, SMTP, URLs de redirect, templates e sessões ativas: **NÃO VERIFICADOS** ou não exportáveis automaticamente; validar manualmente.

## Storage real

| Bucket | Acesso | Objetos | Volume conhecido |
|---|---|---:|---:|
| `attachments` | privado | 2 | consultar script |
| `backups` | privado | 18 | ~57 MB |
| `blog-images` | público | 19 | consultar script |
| `database_export_02_10_26` | privado | não consolidado | ~5,7 MB |
| `database_export_27_09_26` | privado | não consolidado | ~5,5 MB |
| `portfolio-covers` | privado | 20 | consultar script |
| `project-images` | público | 8 | ~10 MB; limite 10 MB/objeto |
| `tech-icons` | público | 21 | consultar script |

Há divergência entre migrations locais (4 buckets criados) e banco real (8 buckets). O banco real e o inventário de objetos prevalecem.

## Backups encontrados

- `tenant_backups`: 2 registros, de 2026-06-20 e 2026-06-25, ~240 KB cada; cobrem apenas uma seleção de tabelas de negócio.
- Buckets de exportação: dois exports armazenados, porém conteúdo lógico, checksums e capacidade de restauração não foram ensaiados nesta fase.
- Bucket `backups`: 18 objetos, ~57 MB; conteúdo integral e checksums **NÃO VERIFICADOS**.
- **Conclusão:** estes artefatos são camadas auxiliares, não substituem o dump PostgreSQL oficial final. O dump oficial + export de Auth/Storage é a fonte primária para execução.

## Realtime e jobs

Publicação `supabase_realtime`: `admin_sessions`, `audit_log`, `automation_runs`, `branding_assets`, `contact_messages`, `events`, `incidents`, `integration_logs`, `projects`, `webhook_deliveries`. Há uma publicação adicional de `realtime.messages` gerenciada pela plataforma.

Foram observados 13 jobs ativos, incluindo coletores a cada 5 minutos, retry de webhook a cada minuto, digest, monitor de citações, GSC, limpeza de auditoria e inteligência semanal. Há nomes legados/duplicados; o destino deve reproduzir apenas a lista canônica aprovada após comparação de `cron.job` e histórico de execução.

## Código e diferença para o banco

- 72 arquivos em `supabase/migrations/`; 69 versões registradas no banco.
- 80 tabelas locais correspondem às 80 tabelas tipadas, mas os timestamps de várias migrations locais não coincidem literalmente com os registrados no banco, e existem arquivos locais não registrados.
- 50 Edge Functions com `index.ts` no repositório; implantação real por função e configuração `verify_jwt`: **NÃO VERIFICADO**.
- 78 rotas React identificadas.
- Não existe seed nem rollback SQL consolidado.

**Decisão:** não restaurar produção pelo replay cego das 72 migrations. Gerar e validar dump oficial do banco real; usar migrations como histórico e para análise de intenção/diferenças.

## Módulos mapeados

Identidade/RBAC/MFA/sessões; CRM e contatos; projetos/pipeline/documentos; financeiro/time tracking; CMS público, blog, serviços e página de criação de sites; portfólio headless e currículo; registries de tecnologias/tags; automações/eventos/notificações; WhatsApp e webhooks; integrações/OAuth/marketplace; IA/Brand Studio/monitoramento; auditoria/incidentes/health; backup/restore; PWA/offline/analytics.

## Dependências de plataforma e externas

- Lovable AI Gateway (`LOVABLE_API_KEY`) em funções de IA.
- Lovable preview/session broker e `lovable-tagger` apenas no fluxo de desenvolvimento.
- Vercel e Speed Insights; GSC; Resend; Meta WhatsApp; GitHub; Figma; Slack; Discord; Stripe; OpenAI; VAPID; geolocalização IP.
- URLs de backend atuais aparecem em configuração, preconnect e jobs; só podem ser trocadas no corte controlado.

## Fontes e limitações

Fontes: banco real consultado em modo leitura, catálogo PostgreSQL, Auth/Storage, repositório, migrations, types gerados, documentação interna e documentação oficial Lovable/Supabase. Não foram lidos valores de secrets nem dados pessoais. Destino, deploy efetivo de cada função, configuração completa de Auth e integridade restaurável dos backups permanecem **NÃO VERIFICADOS**.
