# Webhooks Module

## Objetivo

Inspecionar, depurar e reprocessar entregas de webhook do SevenOS para sistemas externos.

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `WebhookDebugger.tsx` | Reenvio e simulação de entregas |
| `WebhookPayloadViewer.tsx` | Visualização do payload enviado/recebido |
| `WebhookGuideDrawer.tsx` | Documentação in-app de assinatura e formato |

## Data flow

```text
events → webhook-dispatch → endpoint externo
                          → webhook_deliveries (sucesso/falha)
                          ↘ falha persistente → webhook_dlq
                                              → webhook-retry-worker (job)
```

## Tabelas

`webhooks` · `webhook_deliveries` · `webhook_dlq`

## Edge Functions

`webhook-dispatch` · `webhook-retry-worker`

## Superfícies

`/admin/webhooks` · `/admin/webhooks/dlq`

## Pontos de atenção

- Reprocessar item da DLQ pode gerar entrega duplicada no destino — consumidores devem ser idempotentes.
- Cabeçalhos de autenticação não são persistidos em log.
- Webhooks **de entrada** de terceiros (ex.: WhatsApp) são outra superfície e exigem verificação de assinatura HMAC.
