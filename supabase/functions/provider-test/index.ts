/**
 * 🚀 provider-test/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/provider-test/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `provider-test` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Invoca RPC: `has_role`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `provider-test`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ O papel administrativo é verificado via RPC `has_role` (SECURITY DEFINER)
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 api.openai.com
 * 🌐 generativelanguage.googleapis.com
 * 🌐 api.telegram.org
 * 🌐 slack.com
 * 🌐 discord.com
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * ✅ Sessão obtida do AuthContext; nunca de storage local
 * 🔒 A autoridade final é a RLS do banco, não o corpo da requisição
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔧 MANUTENÇÃO                                                       │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Atualizar este cabeçalho quando a responsabilidade do arquivo mudar
 * ✅ Manter regras de negócio próximas da implementação
 * ✅ Registrar decisões arquiteturais relevantes em ADR
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔗 DOCUMENTAÇÃO RELACIONADA                                         │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * @see docs/architecture/MODULE_MAP.md
 * @see docs/code-standards/CODE_ANATOMY.md
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 *
 * @updated 2026-08-02
 * @license Proprietary — SevenDevX
 * ═══════════════════════════════════════════════════════════════════════
 */

// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ provider-test/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/provider-test/index.ts
 * @module Integrations
 *
 * @description
 * Teste genérico de conexão para providers do catálogo.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Variável (provider)
 *
 * @remarks
 * Propaga status e corpo do provider em caso de falha.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// ============================================================================
// 🧩 TYPES & CONTRACTS
// ============================================================================

type Check = { name: string; ok: boolean; detail?: string; latency_ms?: number };
type ProviderSpec = {
  name: string;
  secrets: string[];
  optional?: string[];
  test?: (secrets: Record<string, string>) => Promise<{ checks: Check[]; payload?: Record<string, unknown>; rate_limit?: Record<string, unknown> }>;
};

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { ...corsHeaders, "Content-Type": "application/json" } });

const timed = async (name: string, run: () => Promise<Response>, detail?: (r: Response, data: any) => string): Promise<{ check: Check; data: any; headers: Headers }> => {
  const t0 = Date.now();
  const r = await run();
  let data: any = null;
  try { data = await r.clone().json(); } catch { data = await r.text(); }
  return {
    check: { name, ok: r.ok, detail: r.ok ? (detail?.(r, data) ?? `HTTP ${r.status}`) : `HTTP ${r.status}`, latency_ms: Date.now() - t0 },
    data,
    headers: r.headers,
  };
};

const SPECS: Record<string, ProviderSpec> = {
  openai: { name: "OpenAI", secrets: ["OPENAI_API_KEY"], test: async (s) => {
    const r = await timed("Listar modelos", () => fetch("https://api.openai.com/v1/models", { headers: { Authorization: `Bearer ${s.OPENAI_API_KEY}` } }), (_r, d) => `${(d.data || []).length} modelos`);
    return { checks: [r.check], payload: { models: (r.data.data || []).slice(0, 3).map((m: any) => m.id) } };
  } },
  gemini: { name: "Google Gemini", secrets: ["GEMINI_API_KEY"], test: async (s) => {
    const r = await timed("Validar API key", () => fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${s.GEMINI_API_KEY}`), (_r, d) => `${(d.models || []).length} modelos`);
    return { checks: [r.check], payload: { models: (r.data.models || []).slice(0, 3).map((m: any) => m.name) } };
  } },
  telegram: { name: "Telegram", secrets: ["TELEGRAM_BOT_TOKEN"], test: async (s) => {
    const r = await timed("Bot getMe", () => fetch(`https://api.telegram.org/bot${s.TELEGRAM_BOT_TOKEN}/getMe`), (_r, d) => d.result?.username ? `@${d.result.username}` : "bot válido");
    return { checks: [r.check], payload: { bot: r.data.result } };
  } },
  slack: { name: "Slack", secrets: ["SLACK_BOT_TOKEN"], optional: ["SLACK_SIGNING_SECRET"], test: async (s) => {
    const r = await timed("auth.test", () => fetch("https://slack.com/api/auth.test", { headers: { Authorization: `Bearer ${s.SLACK_BOT_TOKEN}` } }), (_r, d) => d.ok ? `${d.team} · ${d.user}` : d.error);
    r.check.ok = !!r.data.ok;
    if (!r.check.ok) r.check.detail = r.data.error || r.check.detail;
    return { checks: [r.check], payload: { team: r.data.team, user: r.data.user } };
  } },
  discord: { name: "Discord", secrets: ["DISCORD_BOT_TOKEN"], test: async (s) => {
    const r = await timed("Bot identity", () => fetch("https://discord.com/api/v10/users/@me", { headers: { Authorization: `Bot ${s.DISCORD_BOT_TOKEN}` } }), (_r, d) => d.username || "bot válido");
    return { checks: [r.check], payload: { bot: r.data.username, id: r.data.id } };
  } },
  twilio: { name: "Twilio", secrets: ["TWILIO_ACCOUNT_SID", "TWILIO_AUTH_TOKEN"], test: async (s) => {
    const auth = btoa(`${s.TWILIO_ACCOUNT_SID}:${s.TWILIO_AUTH_TOKEN}`);
    const r = await timed("Account lookup", () => fetch(`https://api.twilio.com/2010-04-01/Accounts/${s.TWILIO_ACCOUNT_SID}.json`, { headers: { Authorization: `Basic ${auth}` } }), (_r, d) => d.friendly_name || d.status);
    return { checks: [r.check], payload: { sid: r.data.sid, status: r.data.status } };
  } },
  resend: { name: "Resend", secrets: ["RESEND_API_KEY"], test: async (s) => {
    const r = await timed("Listar domains", () => fetch("https://api.resend.com/domains", { headers: { Authorization: `Bearer ${s.RESEND_API_KEY}` } }), (_r, d) => `${(d.data || []).length} domínios`);
    return { checks: [r.check], payload: { domains: (r.data.data || []).slice(0, 3).map((d: any) => d.name) } };
  } },
  stripe: { name: "Stripe", secrets: ["STRIPE_SECRET_KEY"], optional: ["STRIPE_WEBHOOK_SECRET"], test: async (s) => {
    const auth = btoa(`${s.STRIPE_SECRET_KEY}:`);
    const r = await timed("Balance", () => fetch("https://api.stripe.com/v1/balance", { headers: { Authorization: `Basic ${auth}` } }), (_r, d) => `${(d.available || []).length} saldos`);
    return { checks: [r.check], payload: { livemode: r.data.livemode, available: r.data.available } };
  } },
  notion: { name: "Notion", secrets: ["NOTION_TOKEN"], test: async (s) => {
    const r = await timed("Listar usuários", () => fetch("https://api.notion.com/v1/users", { headers: { Authorization: `Bearer ${s.NOTION_TOKEN}`, "Notion-Version": "2022-06-28" } }), (_r, d) => `${(d.results || []).length} usuários`);
    return { checks: [r.check], payload: { users: (r.data.results || []).slice(0, 3).map((u: any) => u.name || u.id) } };
  } },
  linear: { name: "Linear", secrets: ["LINEAR_API_KEY"], test: async (s) => {
    const r = await timed("GraphQL viewer", () => fetch("https://api.linear.app/graphql", { method: "POST", headers: { Authorization: s.LINEAR_API_KEY, "Content-Type": "application/json" }, body: JSON.stringify({ query: "query { viewer { id name email } }" }) }), (_r, d) => d.data?.viewer?.name || "viewer ok");
    return { checks: [r.check], payload: { viewer: r.data.data?.viewer } };
  } },
  gitlab: { name: "GitLab", secrets: ["GITLAB_TOKEN"], test: async (s) => {
    const r = await timed("/api/v4/user", () => fetch("https://gitlab.com/api/v4/user", { headers: { "PRIVATE-TOKEN": s.GITLAB_TOKEN } }), (_r, d) => d.username || d.name);
    return { checks: [r.check], payload: { username: r.data.username, id: r.data.id } };
  } },
  bitbucket: { name: "Bitbucket", secrets: ["BITBUCKET_USERNAME", "BITBUCKET_TOKEN"], test: async (s) => {
    const auth = btoa(`${s.BITBUCKET_USERNAME}:${s.BITBUCKET_TOKEN}`);
    const r = await timed("/2.0/user", () => fetch("https://api.bitbucket.org/2.0/user", { headers: { Authorization: `Basic ${auth}` } }), (_r, d) => d.username || d.display_name);
    return { checks: [r.check], payload: { username: r.data.username } };
  } },
  netlify: { name: "Netlify", secrets: ["NETLIFY_TOKEN"], test: async (s) => {
    const r = await timed("Listar sites", () => fetch("https://api.netlify.com/api/v1/sites", { headers: { Authorization: `Bearer ${s.NETLIFY_TOKEN}` } }), (_r, d) => `${Array.isArray(d) ? d.length : 0} sites`);
    return { checks: [r.check], payload: { sites: Array.isArray(r.data) ? r.data.slice(0, 3).map((x: any) => x.name) : [] } };
  } },
  render: { name: "Render", secrets: ["RENDER_API_KEY"], test: async (s) => {
    const r = await timed("Listar services", () => fetch("https://api.render.com/v1/services?limit=5", { headers: { Authorization: `Bearer ${s.RENDER_API_KEY}` } }), (_r, d) => `${Array.isArray(d) ? d.length : 0} services`);
    return { checks: [r.check], payload: { services: Array.isArray(r.data) ? r.data.map((x: any) => x.service?.name) : [] } };
  } },
  cloudflare: { name: "Cloudflare", secrets: ["CLOUDFLARE_API_TOKEN", "CLOUDFLARE_ACCOUNT_ID"], test: async (s) => {
    const r = await timed("Token verify", () => fetch("https://api.cloudflare.com/client/v4/user/tokens/verify", { headers: { Authorization: `Bearer ${s.CLOUDFLARE_API_TOKEN}` } }), (_r, d) => d.result?.status || "token válido");
    r.check.ok = !!r.data.success;
    return { checks: [r.check], payload: { status: r.data.result?.status } };
  } },
  neon: { name: "Neon", secrets: ["NEON_API_KEY"], test: async (s) => {
    const r = await timed("Listar projects", () => fetch("https://console.neon.tech/api/v2/projects", { headers: { Authorization: `Bearer ${s.NEON_API_KEY}` } }), (_r, d) => `${(d.projects || []).length} projects`);
    return { checks: [r.check], payload: { projects: (r.data.projects || []).slice(0, 3).map((p: any) => p.name) } };
  } },
  anthropic: { name: "Anthropic", secrets: ["ANTHROPIC_API_KEY"], test: async (s) => {
    const r = await timed("Listar models", () => fetch("https://api.anthropic.com/v1/models", { headers: { "x-api-key": s.ANTHROPIC_API_KEY, "anthropic-version": "2023-06-01" } }), (_r, d) => `${(d.data || []).length} modelos`);
    return { checks: [r.check], payload: { models: (r.data.data || []).slice(0, 3).map((m: any) => m.id) } };
  } },
  datadog: { name: "Datadog", secrets: ["DATADOG_API_KEY", "DATADOG_APP_KEY"], test: async (s) => {
    const r = await timed("Validate API key", () => fetch("https://api.datadoghq.com/api/v1/validate", { headers: { "DD-API-KEY": s.DATADOG_API_KEY, "DD-APPLICATION-KEY": s.DATADOG_APP_KEY } }), (_r, d) => d.valid ? "key válida" : "key inválida");
    r.check.ok = !!r.data.valid;
    return { checks: [r.check], payload: { valid: r.data.valid } };
  } },
  grafana: { name: "Grafana", secrets: ["GRAFANA_URL", "GRAFANA_API_TOKEN"], test: async (s) => {
    const url = s.GRAFANA_URL.replace(/\/$/, "");
    const r = await timed("/api/health", () => fetch(`${url}/api/health`, { headers: { Authorization: `Bearer ${s.GRAFANA_API_TOKEN}` } }), (_r, d) => d.database || d.version || "health ok");
    return { checks: [r.check], payload: { version: r.data.version, database: r.data.database } };
  } },
  n8n: { name: "n8n", secrets: ["N8N_API_KEY", "N8N_BASE_URL"], test: async (s) => {
    const url = s.N8N_BASE_URL.replace(/\/$/, "");
    const r = await timed("Listar workflows", () => fetch(`${url}/api/v1/workflows?limit=5`, { headers: { "X-N8N-API-KEY": s.N8N_API_KEY } }), (_r, d) => `${(d.data || []).length} workflows`);
    return { checks: [r.check], payload: { workflows: (r.data.data || []).slice(0, 3).map((w: any) => w.name) } };
  } },
};

const PRESENCE_ONLY: Record<string, ProviderSpec> = {
  make: { name: "Make", secrets: ["MAKE_API_TOKEN"] },
  zapier: { name: "Zapier", secrets: ["ZAPIER_API_KEY"] },
  google: { name: "Google APIs", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  googlecalendar: { name: "Google Calendar", secrets: ["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"] },
  mercadopago: { name: "Mercado Pago", secrets: ["MERCADOPAGO_ACCESS_TOKEN"] },
  railway: { name: "Railway", secrets: ["RAILWAY_TOKEN"] },
  aws: { name: "AWS", secrets: ["AWS_ACCESS_KEY_ID", "AWS_SECRET_ACCESS_KEY", "AWS_REGION"] },
  gcp: { name: "Google Cloud", secrets: ["GCP_SERVICE_ACCOUNT_JSON"] },
  docker: { name: "Docker Hub", secrets: ["DOCKERHUB_USERNAME", "DOCKERHUB_TOKEN"] },
  supabase: { name: "Supabase", secrets: ["SUPABASE_SERVICE_ROLE_KEY"] },
  postgresql: { name: "PostgreSQL", secrets: ["DATABASE_URL"] },
  mongodb: { name: "MongoDB Atlas", secrets: ["MONGODB_URI"] },
  redis: { name: "Redis", secrets: ["REDIS_URL"] },
  rabbitmq: { name: "RabbitMQ", secrets: ["RABBITMQ_URL"] },
  firebase: { name: "Firebase", secrets: ["FIREBASE_SERVICE_ACCOUNT_JSON"] },
  clerk: { name: "Clerk", secrets: ["CLERK_SECRET_KEY"] },
  auth0: { name: "Auth0", secrets: ["AUTH0_DOMAIN", "AUTH0_CLIENT_ID", "AUTH0_CLIENT_SECRET"] },
};

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  const t0 = Date.now();
  const checks: Check[] = [];
  const payload: Record<string, unknown> = {};
  let status_code = 200;

  try {
    const auth = req.headers.get("Authorization");
    if (!auth) return json({ ok: false, error: "no auth" }, 401);
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: auth } } });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ ok: false, error: "unauthorized" }, 401);
    const { data: isAdmin } = await sb.rpc("has_role", { _user_id: user.id, _role: "admin" });
    if (!isAdmin) return json({ ok: false, error: "forbidden" }, 403);

    const body = await req.json().catch(() => ({}));
    const providerId = String(body.provider_id || "").toLowerCase();
    const spec = SPECS[providerId] ?? PRESENCE_ONLY[providerId];
    if (!providerId || !spec) return json({ ok: false, error: "unsupported_provider", checks: [{ name: "Provider suportado", ok: false, detail: providerId || "ausente" }], latency_ms: Date.now() - t0 }, 400);

    const secrets: Record<string, string> = {};
    for (const key of [...spec.secrets, ...(spec.optional || [])]) {
      const value = Deno.env.get(key) ?? "";
      secrets[key] = value;
      checks.push({ name: `Secret ${key}`, ok: spec.optional?.includes(key) ? true : !!value, detail: value ? "presente" : spec.optional?.includes(key) ? "opcional ausente" : "ausente" });
    }

    const requiredOk = spec.secrets.every((key) => !!secrets[key]);
    if (!requiredOk) {
      status_code = 422;
      throw new Error(`Secrets obrigatórios ausentes para ${spec.name}`);
    }

    if (providerId === "gcp") {
      try { const parsed = JSON.parse(secrets.GCP_SERVICE_ACCOUNT_JSON); payload.service_account = { client_email: parsed.client_email, project_id: parsed.project_id }; checks.push({ name: "JSON service account", ok: !!parsed.client_email, detail: parsed.client_email || "client_email ausente" }); }
      catch { checks.push({ name: "JSON service account", ok: false, detail: "JSON inválido" }); }
    } else if (providerId === "firebase") {
      try { const parsed = JSON.parse(secrets.FIREBASE_SERVICE_ACCOUNT_JSON); payload.service_account = { client_email: parsed.client_email, project_id: parsed.project_id }; checks.push({ name: "JSON service account", ok: !!parsed.project_id, detail: parsed.project_id || "project_id ausente" }); }
      catch { checks.push({ name: "JSON service account", ok: false, detail: "JSON inválido" }); }
    } else if (spec.test) {
      const extra = await spec.test(secrets);
      checks.push(...extra.checks);
      Object.assign(payload, extra.payload || {});
      if (extra.rate_limit) payload.rate_limit = extra.rate_limit;
    } else {
      checks.push({ name: "Validação operacional", ok: true, detail: "Secrets obrigatórios presentes; provider pronto para uso em automações/webhooks." });
    }

    const ok = checks.every((c) => c.ok);
    return json({ ok, latency_ms: Date.now() - t0, checks, payload, invoked_at: new Date().toISOString(), status_code: ok ? 200 : 422 }, ok ? 200 : 422);
  } catch (e) {
    checks.push({ name: "Diagnóstico", ok: false, detail: String((e as Error)?.message ?? e) });
    return json({ ok: false, latency_ms: Date.now() - t0, checks, payload, error: String((e as Error)?.message ?? e), invoked_at: new Date().toISOString(), status_code }, status_code >= 400 ? status_code : 500);
  }
});
