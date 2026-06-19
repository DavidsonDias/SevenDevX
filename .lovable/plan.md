# SevenOS — Fase 2 Enterprise (Top 3 ROI)

Três grandes entregas integradas, com efeito imediato no dia-a-dia do admin.

---

## 1. Onboarding Tour Guiado (`/admin`)

**Objetivo:** todo novo admin (e o próprio dono em telas novas) recebe um walkthrough contextual.

- Componente `OnboardingTour.tsx` baseado em portal + spotlight (overlay com recorte do elemento alvo via `getBoundingClientRect`) — sem libs externas.
- Steps definidos por rota em `src/modules/onboarding/tourSteps.ts` (target seletor + título + descrição + ação opcional).
- Persistência em nova tabela `onboarding_progress` (user_id, tour_key, completed_steps[], dismissed_at).
- Botão "Refazer tour" no Profile + auto-start na 1ª visita.
- Checklist inicial (`OnboardingChecklist.tsx`) no Dashboard: "Configurar perfil", "Conectar 1 integração", "Criar 1 projeto", "Convidar usuário", "Configurar push", "Criar 1 automação". Cada item com link direto e status real (query no DB).
- Dicas contextuais (`<TourHint>`) — tooltip discreto no canto de seções complexas (FlowBuilder, FinanceAdmin).

## 2. Central de Notificações In-App (sino 🔔)

**Objetivo:** unificar push + eventos do sistema num inbox persistente.

- Nova tabela `notifications` (user_id, type, title, body, url, severity, read_at, payload jsonb).
- Tabela `notification_preferences` (user_id, channel [push/email/inapp], event_type, enabled).
- Trigger `fn_emit_notification()` plugado em: `contacts INSERT`, `projects pipeline_changed`, `events severity=error`, `automation_runs status=failed`, `user_roles INSERT`.
- Componente `NotificationBell.tsx` no Header admin:
  - Badge com contador unread (Realtime subscription).
  - Dropdown com últimas 20 + agrupamento por dia + ações inline ("Marcar lida", "Abrir").
  - Filtros: Todas / Não lidas / Críticas.
- Página `/admin/notifications` com histórico completo, filtros por tipo/severidade, marcar todas como lidas, exportar.
- Página `/admin/notifications/preferences` — matriz canal×evento.
- Edge function `notification-digest` (cron diário) que envia resumo por email via Resend.

## 3. Automações com Triggers Reais (não só dry-run)

**Objetivo:** o FlowBuilder existe — falta o motor.

- Edge function `automation-runner` (HTTP + invocável):
  - Recebe `{ trigger_event, payload }`.
  - Busca automations ativas com `trigger_event` correspondente.
  - Avalia `conditions` (engine simples com operadores existentes).
  - Executa `actions` em sequência (webhook, email via Resend, slack, discord, ai.summarize via Lovable AI, db.update, delay, push.send, http.request, transform via Function constructor sandboxed).
  - Registra cada execução em `automation_runs` com steps detalhados.
- Trigger SQL `fn_dispatch_automation()` em `events` table → chama runner via `pg_net`/`http_post` (já temos extensão).
- Trigger `lead.created` (contacts INSERT) e `project.pipeline_changed` (já tem evento) → dispatcher.
- Scheduler cron via `pg_cron` para automações `schedule.cron` (campo `cron_expression` adicionado a `automations`).
- Nova aba "Templates" no AutomationsAdmin com 8 templates prontos: "Notificar Slack ao receber lead", "Email de boas-vindas", "Webhook ao mudar pipeline", "Resumo IA diário", "Alerta de deploy falho", "Push ao receber pagamento", "Backup semanal", "Lead scoring com IA".
- Página `/admin/automations/runs` — histórico paginado com replay button (re-executa com payload original).
- Botão "Test trigger" no FlowBuilder dispara o runner real com payload de exemplo editável.

---

## Mudanças no banco (uma migration)

```text
- onboarding_progress
- notifications
- notification_preferences
- automations: adicionar cron_expression, last_run_at, next_run_at
- automation_runs: adicionar trigger_payload, replay_of (self-ref)
- triggers: fn_emit_notification em 5 tabelas, fn_dispatch_automation em events
- pg_cron job: notification-digest diário 8h, automation-cron a cada minuto
```

## Arquivos novos (resumo)

- `src/modules/onboarding/{OnboardingTour,OnboardingChecklist,TourHint,tourSteps}.tsx/ts`
- `src/modules/notifications/{NotificationBell,NotificationItem,NotificationFilters}.tsx`
- `src/hooks/{useOnboarding,useNotifications,useNotificationPrefs}.ts`
- `src/pages/admin/{NotificationsAdmin,NotificationPreferencesAdmin,AutomationRunsAdmin,AutomationTemplatesAdmin}.tsx`
- `supabase/functions/automation-runner/index.ts`
- `supabase/functions/notification-digest/index.ts`
- Migration com tudo acima.

## Arquivos editados

- `src/components/admin/AdminPageShell.tsx` — slot do sino.
- `src/pages/AdminDashboard.tsx` — checklist no topo.
- `src/pages/Profile.tsx` — botão "Refazer tour".
- `src/app/Router.tsx` — novas rotas admin.
- `src/modules/automations/AutomationFlowBuilder.tsx` — botão "Test trigger real" + campo cron.
- `src/pages/admin/AutomationsAdmin.tsx` — aba templates + link runs.
- `src/components/admin/AdminMenu.tsx` — entradas notificações + automation runs.

## Ordem de execução

1. Migration (tabelas + triggers + cron) → aprovação.
2. Edge functions (`automation-runner`, `notification-digest`).
3. Hooks + componentes notificações + sino no header.
4. Onboarding tour + checklist.
5. Templates de automação + página de runs + integração no FlowBuilder.
6. Tradução PT/EN/ES das strings novas (mantém i18n consistente).

Pronto para começar pela migration?
