# Secrets

## Princípios

1. Segredos vivem **apenas** no ambiente das Edge Functions (`Deno.env.get(...)`).
2. O frontend só pode conter chaves publicáveis (URL do backend e chave anônima), injetadas por `import.meta.env`.
3. Nenhum segredo é commitado, logado, exibido em UI, incluído em backup exportável ou escrito em documentação.
4. `.env` do projeto é gerenciado pela plataforma — não editar manualmente.

## Classificação

| Tipo | Onde vive | Exposto ao browser |
|---|---|---|
| URL do backend / chave publicável | `import.meta.env` | Sim (por design) |
| Tokens de providers (GitHub, Vercel, Figma, Slack, Discord, Resend, Stripe, Meta/WhatsApp) | Env da Edge Function | Não |
| Chaves de IA | Env da Edge Function | Não |
| Service role key do backend | Runtime da Edge Function | Não — e indisponível ao operador |
| Segredos TOTP dos usuários | Tabela `user_mfa` com RLS restritiva | Não |

## Regras de código

```ts
// ✅ Edge Function
const token = Deno.env.get("FIGMA_TOKEN");
if (!token) throw new Error("FIGMA_TOKEN not configured");

// ❌ Frontend
const token = import.meta.env.VITE_ALGUM_TOKEN_PRIVADO; // nunca
```

- Mensagens de erro podem dizer "segredo ausente", nunca o valor.
- Não registre cabeçalhos de autorização em `integration_logs`.
- Rotação de segredo exige redeploy das funções que o consomem.

## Verificação

`provider-secrets-check` valida **presença** de segredos por provider, retornando apenas `presente/ausente`.
