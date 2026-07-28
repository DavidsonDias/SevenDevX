# RPC Functions

Funções expostas via `supabase.rpc()` ou usadas internamente por políticas/triggers.

## Autorização e papéis

| Função | Propósito | Quem executa |
|---|---|---|
| `has_role(_user_id, _role)` | Verificação canônica de papel (`SECURITY DEFINER`) | Cliente autenticado, políticas RLS, Edge Functions |
| `admin_set_role` / `admin_remove_role` | Concede/remove papel | Admin |
| `admin_list_users` | Lista usuários com dados agregados | Admin |
| `admin_list_mfa_status` | Situação de MFA por usuário (sem expor segredo) | Admin |
| `admin_revoke_session` | Revoga sessão administrativa | Admin |
| `upsert_admin_session` / `update_session_geo` | Registro e enriquecimento de sessão | Autenticado / job |

## Negócio

| Função | Propósito | Consumidor |
|---|---|---|
| `fn_project_margin` | Margem do projeto (orçamento × custos × horas) | Finance, Project Detail |
| `fn_client_finance_summary` | Rentabilidade consolidada por cliente | `/admin/finance/clients` |
| `fn_cashflow_forecast` | Projeção de caixa | `/admin/cashflow` |
| `fn_pipeline_forecast` | Receita ponderada por estágio | `useSmartInsights`, `/admin/forecast` |
| `fn_stale_leads` | Leads parados há N dias | `useSmartInsights` |
| `fn_service_slo` | SLO/uptime dos serviços monitorados | System Health |
| `contact_id_by_email` | Resolve contato por e-mail sem expor PII em listagem | Fluxos públicos de captação |
| `search_global` | Busca cross-entidade | Command Palette / Global Search |

## Plataforma

| Função | Propósito |
|---|---|
| `emit_event` | Publica evento no barramento `events` |
| `fn_emit_notification` | Cria notificação para usuários/admins |
| `fn_audit_export` | Exporta trilha de auditoria (CSV/JSON) |
| `fn_audit_cleanup` | Retenção da auditoria |
| `fn_cron_status` | Estado dos jobs agendados |
| `fn_ai_usage_check_quota` | Checagem de quota antes de chamar IA |

## Utilitários de extensão

`show_limit` / `show_trgm` — expostas pela extensão `pg_trgm`, usadas por busca textual.

## Regras

1. Funções `SECURITY DEFINER` sempre com `set search_path = public`.
2. Funções usadas **apenas** por triggers têm `EXECUTE` revogado de `PUBLIC`, `anon` e `authenticated`.
3. Funções administrativas revalidam `has_role` internamente — não confiam no chamador.
4. Assinatura alterada = migration + regeneração de tipos + atualização deste documento.
