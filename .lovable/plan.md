# 🚀 Central de Integrações + Administração Global — SevenOS

Esse escopo é gigantesco (8 novos módulos enterprise, dezenas de providers reais com OAuth, RBAC completo, audit, sessions, webhooks, central de contatos, WhatsApp Business API completo, etc). Tentar entregar tudo num único loop vira código raso e instável. Vou propor uma entrega **faseada em 4 fases**, começando pela fundação e pelos módulos de maior valor imediato — mas preciso da sua confirmação de prioridade antes.

## Fase 1 — Fundação (essa rodada)

Backend e shell visual que destravam todas as outras fases.

1. **Migração DB**:
   - `contact_messages` (central de contatos do site) + RLS admin + trigger push
   - `admin_sessions` (rastreio de sessões ativas: device, browser, ip, last_seen)
   - `webhooks` (endpoints registrados, secret, ativos, contagem de entregas)
   - `webhook_deliveries` (log de payloads + status + replay)
   - `integration_providers` (catálogo: id, nome, categoria, status, config JSON, secret_ref)
   - `integration_logs` (request/response/erro/timing)
   - extensão de `app_role`: `super_admin`, `manager`, `editor`, `viewer`
2. **Shell de navegação Super Admin**: novo grupo no `AdminMenu` com as 8 rotas (`/admin/integrations`, `/admin/users`, `/admin/contact-center`, `/admin/security`, `/admin/logs`, `/admin/sessions`, `/admin/webhooks`, `/admin/system-health`) + páginas placeholder com `AdminPageShell` + KPI skeletons (já navegável, sem dados mock).
3. **Header site — animated underline premium** nos links de navegação (item isolado e rápido).
4. **Página `/admin/integrations`** funcional com hero KPIs reais (contagem de providers, falhas, último sync) + grid de cards por categoria + botão "Testar conexão" para os 3 providers já existentes (GitHub, Vercel, Figma) reaproveitando as edge functions atuais.

## Fase 2 — Central de Contatos + Usuários & Sessões

- `/admin/contact-center` estilo inbox (lista + detail pane + responder + converter em cliente/projeto + atribuir).
- Migrar formulário do site para gravar em `contact_messages` (mantendo trigger push existente).
- `/admin/users`: convidar admin, promover/rebaixar role, revogar sessão, reset senha (via edge function service-role).
- `/admin/sessions`: lista de sessões ativas + encerrar individual/todas.
- Audit log expandido (usar tabela `audit_log` já existente + UI dedicada).

## Fase 3 — Webhooks + Logs + System Health + Security

- `/admin/webhooks`: gerar callback URL, secret, replay payload.
- `/admin/logs`: viewer realtime virtualizado de `integration_logs` + `audit_log` + `webhook_deliveries`.
- `/admin/system-health`: uptime, latência média de cada edge function (via `analytics_query`), status Supabase, fila de jobs.
- `/admin/security`: rate-limit config, rotação de tokens, force-logout global, password policy.

## Fase 4 — Provider deep-dives + roadmap

- WhatsApp Business API completo (credenciais, números, templates Meta, envio de teste).
- GitHub/Vercel/Figma enterprise views (PRs, deploys com logs, embeds Figma).
- Google Calendar OAuth + sync.
- Roadmap "Em breve": Telegram, Twilio, Slack, Discord, Zapier, Make, n8n.

---

## Decisões técnicas

- **Stack**: Supabase (DB + Edge Functions + Realtime) + React Query + Framer Motion + tokens semânticos do design system existente.
- **Secrets de provider**: armazenados em Supabase Secrets (server-side), nunca no frontend. Tabela `integration_providers` guarda apenas nome do secret + metadados públicos.
- **RBAC**: estender enum `app_role` mantendo retrocompatibilidade (`admin` continua válido como super_admin).
- **Realtime**: usar canais Supabase em logs, sessões, contact_messages.
- **Testes de conexão**: edge function genérica `integration-test` que despacha por provider id.
- **WhatsApp Business**: requer secrets `META_WABA_TOKEN`, `META_PHONE_NUMBER_ID`, `META_APP_SECRET`, `META_VERIFY_TOKEN` — vou pedir na fase 4.

## Perguntas antes de começar

1. **Confirmo começar pela Fase 1** (fundação + shell + integrations base + animated underline)? Ou quer que eu inverta a ordem (ex: começar por Central de Contatos que tem impacto comercial direto)?
2. Posso **estender o enum `app_role`** para incluir `super_admin`, `manager`, `editor`, `viewer`? Hoje só existe `admin`/`moderator`/`user`.
3. O formulário público do site hoje grava em `contacts` — quer que eu **migre para `contact_messages`** ou mantenha `contacts` e use ela como tabela única da Central?

Responde essas 3 e eu começo a Fase 1 imediatamente.