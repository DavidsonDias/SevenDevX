# Integrations Module

## Objetivo

Gerenciar as integrações externas do SevenOS: descoberta, configuração, teste real de conexão, diagnóstico e histórico.

## Recursos

- Marketplace interno de providers
- Catálogo/registry de providers
- Configuração por provider
- Teste guiado de conexão
- Painel de resultado e logs
- Identidade visual do provider
- Guia de setup passo a passo

## Estrutura

| Arquivo | Responsabilidade |
|---|---|
| `providerCatalog.ts` | Registry declarativo dos providers suportados |
| `IntegrationMarketplaceModal.tsx` | Descoberta e ativação de providers |
| `IntegrationDetailsModal.tsx` | Visão consolidada de um provider |
| `ProviderConfigModal.tsx` | Formulário de configuração |
| `GuidedConnectionTest.tsx` | Execução assistida do teste de conexão |
| `TestResultPanel.tsx` | Exibição de checks, latência e falhas |
| `IntegrationLogsPanel.tsx` | Histórico de chamadas e erros |
| `SetupGuideDrawer.tsx` | Instruções de configuração |
| `ProviderLogo.tsx` | Logo e cor do provider |

## Arquitetura

```text
Integrations
├── Marketplace
├── Provider Registry
├── Config Engine
├── Test Engine
├── Logs
└── Branding
```

## Data flow

```text
UI (/admin/integrations)
 ↓
useIntegrations · useIntegrationFavorites (React Query)
 ↓
integration_providers / integration_logs (RLS admin)
 ↓ teste
supabase.functions.invoke("<provider>-test")
 ↓
Edge Function (JWT + has_role admin) → API do provider
```

## Tabelas

`integration_providers` · `integration_logs` · `oauth_connections` · `user_integration_favorites` · `marketplace_installs`

## Edge Functions

`github-test`/`github-info` · `vercel-test`/`vercel-info`/`vercel-watch` · `figma-test`/`figma-info` · `openai-test` · `slack-test` · `discord-test` · `resend-test` · `stripe-test` · `whatsapp-test` · `provider-test` · `provider-secrets-check` · `oauth-start`/`oauth-callback`

## Pontos de atenção

- Segredos de provider **nunca** chegam ao browser; ficam no ambiente das Edge Functions.
- `provider-secrets-check` retorna apenas presença/ausência, nunca valor.
- Falhas do provider são exibidas com status e corpo reais, sem mascarar como erro genérico.

## Documentação relacionada

[architecture/INTEGRATIONS](../../../docs/architecture/INTEGRATIONS.md) · [security/EDGE_FUNCTION_SECURITY](../../../docs/security/EDGE_FUNCTION_SECURITY.md)
