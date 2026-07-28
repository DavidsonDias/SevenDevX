# Integrations

## Objetivo

Conectar o SevenOS a serviços externos (repositórios, deploy, comunicação, pagamento, design, IA) com configuração, teste real de conexão, logs e observabilidade.

## Arquitetura

```text
Integrations
├── Marketplace        src/modules/integrations/IntegrationMarketplaceModal.tsx
├── Provider Registry  src/modules/integrations/providerCatalog.ts
├── Config Engine      src/modules/integrations/ProviderConfigModal.tsx
├── Test Engine        src/modules/integrations/GuidedConnectionTest.tsx + TestResultPanel.tsx
├── Logs               src/modules/integrations/IntegrationLogsPanel.tsx
├── Branding           src/modules/integrations/ProviderLogo.tsx
└── OAuth Layer        supabase/functions/oauth-start · oauth-callback
```

## Data flow

```text
UI (/admin/integrations)
 ↓
useIntegrations (React Query)
 ↓
integration_providers (Postgres, RLS admin)
 ↓ teste
supabase.functions.invoke("<provider>-test")
 ↓
Edge Function (JWT + has_role admin) → API do provider
 ↓
integration_logs
```

Segredos ficam em variáveis de ambiente das Edge Functions. O browser nunca recebe token de provider.

## Providers com Edge Function dedicada

| Provider | Teste real | Info | OAuth | Webhook |
|---|---|---|---|---|
| GitHub | `github-test` | `github-info` | `oauth-start`/`oauth-callback` | via `webhook-dispatch` |
| Vercel | `vercel-test` | `vercel-info` | — | `vercel-watch` (alertas de deploy) |
| Figma | `figma-test` | `figma-info` | — | — |
| OpenAI | `openai-test` | — | — | — |
| Slack | `slack-test` | — | — | — |
| Discord | `discord-test` | — | — | — |
| Resend | `resend-test` | — | — | — |
| Stripe | `stripe-test` | — | — | — |
| WhatsApp (Meta) | `whatsapp-test` | — | — | `whatsapp-webhook` (HMAC) |
| Genérico | `provider-test`, `provider-secrets-check` | — | — | — |

> Tabela derivada dos diretórios existentes em `supabase/functions/`. Ao adicionar um provider, atualize esta tabela e `supabase/functions/README.md`.

## Webhooks de saída

```text
events → webhook-dispatch → webhook_deliveries
                         ↘ falha → webhook_dlq → webhook-retry-worker
```

Depuração em `/admin/webhooks` (`WebhookDebugger.tsx`, `WebhookPayloadViewer.tsx`).

## Vitrine pública

`/integracoes` (`src/pages/IntegrationsMarketplace.tsx`) apresenta o catálogo sem expor configuração ou credenciais.
