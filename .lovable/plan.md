# SevenOS — Fase 3 Enterprise Security & Reliability

Sem i18n. Foco em segurança, confiabilidade e profundidade operacional. Quatro frentes integradas.

---

## 1. Segurança Avançada (2FA + Sessões Geo + Alertas)

**2FA TOTP obrigatório para admins:**
- Tabela `user_mfa` (user_id, secret_encrypted, enabled_at, backup_codes[], last_used_at).
- Edge function `mfa-enroll` — gera secret TOTP + QR code (otpauth://) + 10 backup codes.
- Edge function `mfa-verify` — valida código de 6 dígitos (lib `otpauth` via esm.sh).
- Flag `mfa_required_for_admins` em `system_settings` (nova tabela).
- Guard no `ProtectedRoute`: se admin sem MFA e flag ligada → redirect `/admin/security/mfa/enroll`.
- Página `/admin/security/mfa` — enroll wizard (QR + verificar + baixar backup codes) + reset.

**Geolocalização de sessões:**
- Trigger `fn_enrich_session()` em `user_sessions` INSERT chama edge function `session-geo` que consulta `ipapi.co` (free tier, sem key) e preenche `country`, `city`, `lat`, `lng`, `isp`.
- `SessionsAdmin` ganha mapa (Leaflet via CDN dinâmico) + lista com bandeira do país + badge "Suspeito" quando IP muda de país em < 1h.
- Edge function `session-anomaly-check` roda no INSERT → se anômalo, chama `fn_emit_notification` com severity=error + dispara `automation-runner` com event `session.suspicious`.

**Política de senhas configurável:**
- `system_settings`: `password_min_length`, `password_require_special`, `password_require_number`, `password_max_age_days`.
- Validação no client (Auth + Profile) lendo as flags.

## 2. Webhooks Enterprise (Retry + DLQ + HMAC verificado)

- `webhooks`: adicionar `retry_policy jsonb` (`{max_attempts, backoff_seconds, multiplier}`), `dead_letter_after int`, `verify_signature boolean`.
- `webhook_deliveries`: já tem `attempt` — adicionar `next_retry_at`, `is_dead_letter`, `signature_verified`.
- Nova tabela `webhook_dlq` (delivery_id ref, payload, error, moved_at).
- Edge function `webhook-dispatch` (já existe) — adicionar lógica de retry exponencial + verificação HMAC bidirecional (assina saída + valida `X-SevenOS-Signature` em respostas se configurado).
- Edge function `webhook-retry-worker` invocada por `pg_cron` a cada minuto — varre `webhook_deliveries` com `next_retry_at <= now()` e re-dispara; após `max_attempts` move para DLQ.
- `WebhooksAdmin`: aba "Dead Letter Queue" com replay em massa (checkbox + botão "Reenfileirar selecionados") e botão "Replay all failed in last 24h".
- `WebhookDebugger` (já existe): mostrar histórico completo de tentativas com signature status.

## 3. CRM Inteligente (Lead Scoring IA + Forecast + Templates)

- `contacts`: adicionar `lead_score int default 0`, `score_reasons jsonb`, `assigned_to uuid ref auth.users`, `sla_due_at timestamptz`, `last_contacted_at`.
- Edge function `lead-score-ai` — recebe contact, chama Lovable AI (gemini-2.5-flash) com prompt estruturado (email domain, empresa, mensagem, fonte) → retorna `{score, reasons[], priority}`. Trigger em `contacts INSERT` dispara.
- `projects`: adicionar `probability int` (0-100), `expected_close_date`, `forecast_value numeric`. RPC `fn_pipeline_forecast()` retorna receita ponderada por mês (próximos 6 meses).
- Nova tabela `response_templates` (id, name, subject, body, variables[], category, usage_count).
- `ContactCenterAdmin`: 
  - Seletor de responsável + SLA timer visual (verde/amarelo/vermelho).
  - Botão "Converter em projeto" (pré-popula form com dados do lead).
  - Drawer de templates de resposta com merge tags `{{name}}`, `{{company}}`.
  - Badge de score + tooltip com razões da IA.
- Nova página `/admin/forecast` — gráfico de receita prevista (Recharts) + breakdown por estágio + top deals.

## 4. Observabilidade Pro (Uptime Histórico + Backup + Alertas)

**Histórico de uptime:**
- Nova tabela `service_health_snapshots` (service_name, status, latency_ms, checked_at, error).
- Edge function `health-collector` chamada por `pg_cron` a cada 5min — pinga services (DB, Edge, AI Gateway, Resend, Stripe) e grava snapshot.
- `SystemHealthAdmin` ganha gráfico de uptime (últimos 7/30 dias) por serviço + cálculo de SLO (99.9% target) + lista de incidentes inferidos.
- Tabela `incidents`: já existe? se sim, ligar snapshots → auto-criar incident em downtime > 2min consecutivos.

**Backup/Export:**
- Edge function `tenant-export` — admin only, gera ZIP com JSON de todas as tabelas relevantes (projects, contacts, transactions, etc), upload para bucket `backups` (privado), retorna signed URL.
- Página `/admin/backup` — botão "Gerar snapshot agora", lista de snapshots anteriores (download + delete), opção "Agendar diário" (pg_cron).
- Retenção configurável em `system_settings` (default 30 dias).

**Alertas críticos:**
- Trigger em `user_roles INSERT/UPDATE` (role change) → notification severity=warning + automation event `security.role_changed`.
- Trigger em `audit_log` para eventos críticos (secret rotation, MFA disable, mass delete) → notification + email via Resend.

---

## Migration (uma só, ordenada)

```text
- user_mfa (RLS: user_id = auth.uid())
- system_settings (RLS: admin only) + seed defaults
- service_health_snapshots (RLS: admin only)
- webhook_dlq (RLS: admin only)
- response_templates (RLS: admin only)
- ALTER user_sessions: country, city, lat, lng, isp, is_suspicious
- ALTER webhooks: retry_policy, dead_letter_after, verify_signature
- ALTER webhook_deliveries: next_retry_at, is_dead_letter, signature_verified
- ALTER contacts: lead_score, score_reasons, assigned_to, sla_due_at, last_contacted_at
- ALTER projects: probability, expected_close_date, forecast_value
- RPC fn_pipeline_forecast()
- Triggers: fn_enrich_session, fn_score_lead, fn_alert_role_change, fn_alert_critical_audit
- pg_cron: health-collector (5min), webhook-retry-worker (1min), tenant-export-scheduled (diário se ligado)
- Bucket "backups" privado
```

## Edge Functions novas

- `mfa-enroll`, `mfa-verify`, `mfa-disable`
- `session-geo`, `session-anomaly-check`
- `webhook-retry-worker`
- `lead-score-ai`
- `health-collector`
- `tenant-export`

## Páginas novas

- `/admin/security/mfa` — enroll/manage 2FA
- `/admin/forecast` — receita prevista
- `/admin/backup` — snapshots & export
- `/admin/webhooks/dlq` — dead letter queue (ou aba dentro de WebhooksAdmin)

## Editados

- `ProtectedRoute.tsx` — guard MFA
- `Auth.tsx` — challenge MFA pós-login
- `SessionsAdmin.tsx` — mapa + flags + suspicious badge
- `SystemHealthAdmin.tsx` — gráficos históricos + SLO
- `WebhooksAdmin.tsx` — tab DLQ + retry config
- `ContactCenterAdmin.tsx` — assignee, SLA, templates, score
- `AdminMenu.tsx` — entradas: Segurança/2FA, Forecast, Backup
- `system_settings` hook + tela em `/admin/system-health` ou nova

## Ordem de execução

1. Migration completa (tabelas + alters + triggers + cron + bucket).
2. Edge functions de segurança (mfa-*, session-geo, anomaly).
3. UI 2FA (enroll + guard + Auth challenge).
4. Webhook retry worker + DLQ UI.
5. Lead scoring + forecast + templates + ContactCenter v2.
6. Health collector + SystemHealth gráficos + backup/export.
7. Trigger alertas críticos.

Vou começar disparando a migration. Aprova para seguir?
