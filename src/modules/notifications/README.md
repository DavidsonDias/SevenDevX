# Notifications Module

## Objetivo

Entregar avisos operacionais aos administradores dentro do SevenOS e via push.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `NotificationBell.tsx` | Indicador e lista de notificações no shell admin |

## Data flow

```text
Trigger / RPC fn_emit_notification
  → notifications
  → Realtime → NotificationBell
  → push-send → push_subscriptions (quando habilitado)
```

Preferências por usuário em `notification_preferences` (`/admin/notifications/preferences`).

## Tabelas

`notifications` · `notification_preferences` · `push_subscriptions`

## Edge Functions

`push-send` · `push-public-key`

## Pontos de atenção

- Notificação é sinal, não fonte de verdade: a entidade original sempre deve ser consultada.
- Push exige permissão do browser e assinatura ativa; a ausência não deve quebrar o fluxo in-app.
- Novos leads geram notificação administrativa automaticamente.
