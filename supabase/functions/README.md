# Supabase Edge Functions

Backend serverless (Deno) do SevenOS. Toda operação que exige segredo, privilégio elevado ou chamada a API externa vive aqui.

## Padrão de segurança

Ver [EDGE_FUNCTION_SECURITY](../../docs/security/EDGE_FUNCTION_SECURITY.md). Resumo:

- `OPTIONS` → CORS antes de qualquer lógica
- JWT verificado com `auth.getUser()`
- Funções administrativas revalidam `rpc("has_role", { _role: "admin" })`
- Jobs protegidos por token; webhooks de terceiros por assinatura
- Segredos apenas em `Deno.env` — nunca retornados

## Inventário

| Function | Propósito | Auth | API externa |
|---|---|---|---|
| `admin-delete-user` | Exclusão definitiva de usuário | Admin | — |
| `ai-chat` | Chatbot do site público | Pública controlada | AI Gateway |
| `ai-contract-summarize` | Resumo/análise de contratos | Admin | AI Gateway |
| `ai-engine` | Execuções genéricas de IA | Admin | AI Gateway |
| `ai-ops` | Operações assistidas por IA | Admin | AI Gateway |
| `ai-ops-autonomous` | Rotina autônoma de operações | Job | AI Gateway |
| `automation-runner` | Processa regras de automação | Job | — |
| `brand-scan` | Extração de identidade/paleta | Admin | Web |
| `citation-monitor` | Monitor de citações por IAs | Job | Buscadores/IA |
| `daily-digest` | Resumo diário operacional | Job | — |
| `discord-test` | Teste de integração Discord | Admin | Discord |
| `figma-info` / `figma-test` | Dados e diagnóstico Figma | Admin | Figma |
| `github-info` / `github-test` | Dados e diagnóstico GitHub | Admin | GitHub |
| `gsc-insights` | Insights de Search Console | Admin | Google Search Console |
| `health-collector` | Coleta de saúde dos serviços | Job | Serviços monitorados |
| `incident-notify` | Notificação de incidentes | Job | Canais de notificação |
| `lead-score-ai` | Pontuação de leads | Admin/Job | AI Gateway |
| `logo-variations-ai` | Variações de logo | Admin | AI Gateway |
| `mfa-enroll` / `mfa-verify` / `mfa-disable` | Ciclo de MFA TOTP | Usuário autenticado | — |
| `oauth-start` / `oauth-callback` | Fluxo OAuth PKCE | Admin | Providers OAuth |
| `openai-test` | Teste de integração OpenAI | Admin | OpenAI |
| `project-generator` | Geração assistida de projeto | Admin | AI Gateway |
| `provider-secrets-check` | Verifica presença de segredos | Admin | — |
| `provider-test` | Teste genérico de provider | Admin | Variável |
| `push-public-key` | Chave pública de push | Pública | — |
| `push-send` | Envio de push | Autenticado/Job | Web Push |
| `resend-test` | Teste de e-mail | Admin | Resend |
| `session-geo` | Enriquecimento geográfico de sessão | Autenticado | Geo IP |
| `slack-test` | Teste de integração Slack | Admin | Slack |
| `stripe-test` | Teste de integração Stripe | Admin | Stripe |
| `tenant-export` | Exportação completa de dados | Admin | — |
| `tenant-restore` | Restauração de dados | Admin | — |
| `track-analytics` | Telemetria do site público | Pública controlada | — |
| `vercel-info` / `vercel-test` | Dados e diagnóstico Vercel | Admin | Vercel |
| `vercel-watch` | Alertas de deploy | Job | Vercel |
| `webhook-dispatch` | Entrega de webhooks | Job/interno | Endpoints externos |
| `webhook-retry-worker` | Reprocessa a DLQ | Job | Endpoints externos |
| `weekly-intel-report` | Relatório semanal | Job | AI Gateway |
| `whatsapp-send` | Envio de mensagem | Admin | Meta Cloud API |
| `whatsapp-test` | Diagnóstico da integração | Admin | Meta Cloud API |
| `whatsapp-webhook` | Recebimento de mensagens | Assinatura HMAC | Meta Cloud API |

## Convenções

- Um diretório por função, sempre com `index.ts`.
- Nome em `kebab-case`; sufixo `-test` para diagnóstico e `-info` para leitura de metadados.
- Erros do provider são propagados com status e corpo reais.
- Toda função nova entra nesta tabela e, se aplicável, em [INTEGRATIONS](../../docs/architecture/INTEGRATIONS.md).

## Configuração

`supabase/config.toml` é gerenciado pela plataforma — não editar manualmente.
