# Edge Functions, integrações e jobs

## Funções no repositório (50)

`admin-delete-user`, `ai-chat`, `ai-contract-summarize`, `ai-engine`, `ai-ops`, `ai-ops-autonomous`, `automation-runner`, `brand-scan`, `citation-monitor`, `daily-digest`, `discord-test`, `figma-info`, `figma-test`, `github-info`, `github-test`, `gsc-insights`, `health-collector`, `incident-notify`, `lead-score-ai`, `logo-variations-ai`, `mfa-disable`, `mfa-enroll`, `mfa-verify`, `oauth-callback`, `oauth-start`, `openai-test`, `portfolio-content`, `portfolio-cover`, `project-generator`, `provider-secrets-check`, `provider-test`, `push-public-key`, `push-send`, `resend-test`, `session-geo`, `slack-test`, `stripe-test`, `tech-icon`, `tenant-export`, `tenant-restore`, `track-analytics`, `vercel-info`, `vercel-test`, `vercel-watch`, `webhook-dispatch`, `webhook-retry-worker`, `weekly-intel-report`, `whatsapp-send`, `whatsapp-test`, `whatsapp-webhook`.

Categorias: administração; IA/Brand Studio; MFA/Auth/OAuth; portfólio e assets; analytics; push; backup/restore; integrações; jobs; WhatsApp; webhooks. Implantação real, versão e `verify_jwt` de cada função: **NÃO VERIFICADO**. `tech-icon` é público no config local; as demais dependem do default e validações internas.

## Segurança

Funções administrativas validam JWT e role. Jobs devem aceitar apenas secret compartilhado/service role. `whatsapp-webhook` valida HMAC. CORS `*` é amplo, mas não substitui autenticação. No destino, comparar configuração implantada com código e não reduzir proteção. Service role nunca entra em frontend nem variável `VITE_*`.

## Integrações externas

Lovable AI Gateway, OpenAI, Resend, Meta WhatsApp, Vercel, Google Search Console, GitHub, Figma, Slack, Discord, Stripe, VAPID, geolocalização IP e catálogo genérico de providers. Google Search Console aparece conectado na origem; Firecrawl aparece cadastrado mas não conectado. Tokens/valores não foram lidos.

## Jobs e webhooks

13 jobs ativos reais; migrations locais descrevem subconjunto e URLs antigas. Há outbound webhooks com retry/DLQ e inbound WhatsApp HMAC. Stripe possui secret/teste, mas endpoint de webhook dedicado não foi encontrado. Antes do deploy no destino: jobs, webhooks, filas, e-mails, push e chamadas pagas ficam desativados. Ativar um por vez após validação e garantir que somente um backend processe cada evento.

## Ordem de implantação

Deploy sem tráfego → configurar nomes de secrets → validar JWT/CORS sem efeitos → smoke tests simulados → configurar endpoints externos ainda inativos → cortar origem → ativar jobs/webhooks canônicos no destino → monitorar duplicação e DLQ. Nunca testar e-mail, cobrança, WhatsApp, IA paga ou webhook real sem autorização.
