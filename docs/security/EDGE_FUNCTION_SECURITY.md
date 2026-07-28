# Edge Function Security

## Padrão obrigatório para funções administrativas

```ts
const auth = req.headers.get("Authorization");
if (!auth) return json({ error: "no auth" }, 401);

const sb = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  global: { headers: { Authorization: auth } },
});

const { data: { user } } = await sb.auth.getUser();
if (!user) return json({ error: "unauthorized" }, 401);

const { data: isAdmin } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
if (!isAdmin) return json({ error: "forbidden" }, 403);
```

Referência real: `supabase/functions/figma-test/index.ts` e `figma-info/index.ts`.

## Classes de função e proteção

| Classe | Exemplos | Proteção |
|---|---|---|
| Administrativa | `*-test`, `*-info`, `ai-ops`, `tenant-export`, `oauth-callback`, `admin-delete-user` | JWT + `has_role('admin')` |
| Do próprio usuário | `mfa-enroll`, `mfa-verify`, `mfa-disable`, `push-send` | JWT do usuário; opera apenas sobre `auth.uid()` |
| Job agendado | `daily-digest`, `weekly-intel-report`, `health-collector`, `webhook-retry-worker`, `automation-runner`, `incident-notify`, `citation-monitor`, `vercel-watch` | Token/segredo compartilhado — **não** acessível anonimamente |
| Webhook de terceiro | `whatsapp-webhook` | Verificação de assinatura HMAC do payload |
| Pública controlada | `ai-chat`, `track-analytics`, `push-public-key` | Sem PII de retorno, validação estrita de input |

## Regras

1. `OPTIONS` sempre responde com CORS antes de qualquer lógica.
2. Validar corpo/query antes de usar credenciais.
3. Nunca retornar segredo, mesmo parcialmente.
4. Propagar erro do provider com status e corpo — não converter em `500` genérico.
5. Usar service role apenas depois de autorizar o chamador.
6. Não implementar rate limiting ad-hoc sem decisão explícita.

## Erros no cliente

`supabase.functions.invoke` reporta qualquer falha como "non-2xx". Para diagnosticar, leia o corpo real:

```ts
import { FunctionsHttpError } from "@supabase/supabase-js";
const { data, error } = await supabase.functions.invoke("nome", { body });
if (error) {
  const details = error instanceof FunctionsHttpError ? await error.context.text() : error.message;
  console.error("nome falhou:", details);
}
```
