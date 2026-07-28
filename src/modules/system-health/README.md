# System Health Module

## Objetivo

Observabilidade operacional do SevenOS: estado dos serviços, atividade em tempo real e recomendações.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `HealthStatusGrid.tsx` | Estado atual dos serviços monitorados |
| `RealtimeActivityFeed.tsx` | Eventos e auditoria em tempo real |
| `AIRecommendationPanel.tsx` | Sugestões geradas por IA a partir dos sinais coletados |

## Data flow

```text
health-collector (job) → service_health_snapshots
                        → fn_service_slo → HealthStatusGrid
falha detectada         → incidents + incident_timeline
                        → incident-notify → notificações
audit_log (Realtime)    → RealtimeActivityFeed
```

## Tabelas

`service_health_snapshots` · `incidents` · `incident_timeline` · `audit_log` · `vercel_deploy_alerts`

## Edge Functions

`health-collector` · `incident-notify` · `vercel-watch`

## Superfícies

`/admin/system-health` · `/admin/incidents`

## Pontos de atenção

- Indicadores refletem apenas os serviços efetivamente coletados; ausência de amostra não significa "saudável".
- Recomendações de IA são sugestões — aplicação é sempre decisão humana e fica registrada em `ai_ops_actions`.
- Nenhum número de SLA é exibido sem amostra correspondente em `service_health_snapshots`.
