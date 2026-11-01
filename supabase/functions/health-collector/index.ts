import { openAIRequest } from '../_shared/openai.ts';
/**
 * 🚀 health-collector/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/health-collector/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `health-collector` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `system_settings`, `attachments`, `service_health_snapshots`, `notifications`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `health-collector`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 * 💾 Bucket(s) utilizados: `attachments`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 api.openai.com
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
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
 * ⚡ health-collector/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/health-collector/index.ts
 * @module System Health
 *
 * @description
 * Coleta amostras de saúde dos serviços monitorados.
 *
 * @security
 * Token de job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Serviços monitorados
 *
 * @remarks
 * Grava em service_health_snapshots; ausência de amostra não significa saudável.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🩺 Health Collector — pinga serviços críticos e salva snapshot.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// ⚠️ URLs assinadas expiram; não devem ser persistidas como valor permanente.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🟡 Saídas geradas por IA são assistivas e exigem revisão humana antes de uso oficial.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
//

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

async function check(name: string, fn: () => Promise<boolean>): Promise<any> {
  const t0 = Date.now();
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const ok = await Promise.race([
      fn(),
      new Promise<boolean>((_, rej) => { timer = setTimeout(() => rej(new Error('timeout')), 8000); }),
    ]);
    return { service_name: name, status: ok ? 'up' : 'down', latency_ms: Date.now() - t0 };
  } catch (e: any) {
    return { service_name: name, status: 'down', latency_ms: Date.now() - t0, error: e?.message?.slice(0, 200) };
  } finally {
    clearTimeout(timer);
  }
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

// A project can retain more than one valid legacy service JWT during key rotation.
// Claims are only a prefilter: the project's Data API must verify the same token.
async function verifiedProjectServiceToken(token: string): Promise<boolean> {
  try {
    if (token.length > 8192) return false;
    const parts = token.split('.');
    if (parts.length !== 3) return false;
    const encoded = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const claims = JSON.parse(atob(encoded.padEnd(Math.ceil(encoded.length / 4) * 4, '=')));
    const project = new URL(SUPABASE_URL).hostname.split('.')[0];
    if (claims.role !== 'service_role' || claims.ref !== project ||
        typeof claims.exp !== 'number' || claims.exp <= Date.now() / 1000) return false;
    const response = await fetch(`${SUPABASE_URL}/rest/v1/system_settings?select=key&limit=0`, {
      headers: { apikey: token, Authorization: `Bearer ${token}` },
      redirect: 'error', signal: AbortSignal.timeout(7000),
    });
    if (response.status !== 200) return false;
    const rows = await response.json();
    return Array.isArray(rows) && rows.length === 0;
  } catch { return false; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders });
  const auth = req.headers.get('Authorization') || '';
  const provided = auth.replace(/^Bearer\s+/i, '');
  let okAuth = !!((CRON_SECRET && provided === CRON_SECRET) || (SERVICE_KEY && provided === SERVICE_KEY));
  if (!okAuth && provided) okAuth = await verifiedProjectServiceToken(provided);
  if (!okAuth && provided) {
    const userClient = createClient(SUPABASE_URL, Deno.env.get('SUPABASE_ANON_KEY')!, { global: { headers: { Authorization: auth } } });
    const { data, error } = await userClient.auth.getUser();
    if (!error && data?.user) {
      const role = await userClient.rpc('has_role', { _user_id: data.user.id, _role: 'admin' });
      okAuth = !role.error && role.data === true;
    }
  }
  if (!okAuth) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const checks = await Promise.all([
      check('database', async () => {
        const { error } = await supa.from('system_settings').select('key').limit(1);
        return !error;
      }),
      check('edge_functions', async () => {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/push-public-key`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${SERVICE_KEY}`, apikey: SERVICE_KEY },
          signal: AbortSignal.timeout(7000),
        });
        if (!r.ok) throw new Error(`Edge probe HTTP ${r.status}`);
        return true;
      }),
      check('ai_gateway', async () => {
        if (!OPENAI_API_KEY) return false;
        const r = await openAIRequest('models', {
          headers: { Authorization: `Bearer ${OPENAI_API_KEY}` },
          signal: AbortSignal.timeout(7000),
        });
        return r.ok;
      }),
      check('storage', async () => {
        const { error } = await supa.storage.from('attachments').list('', { limit: 1 });
        return !error;
      }),
    ]);

    const saved = await supa.from('service_health_snapshots').insert(checks);
    if (saved.error) throw new Error('Snapshot persistence failed');

    // auto-create incident on consecutive down (last 2 snapshots)
    for (const c of checks) {
      if (c.status === 'down') {
        const { data: prev, error: historyError } = await supa
          .from('service_health_snapshots')
          .select('status')
          .eq('service_name', c.service_name)
          .order('checked_at', { ascending: false })
      .limit(3);
        if (historyError) throw new Error('Snapshot history unavailable');
        if (prev && prev.length >= 2 && prev[1]?.status === 'down') {
          const notified = await supa.from('notifications').insert({
            user_id: null,
            type: 'incident.detected',
            title: `Serviço fora do ar: ${c.service_name}`,
            body: c.error ?? 'Downtime detectado em 2 checagens consecutivas',
            url: '/admin/system-health',
            severity: 'error',
            payload: c,
          });
          if (notified.error) throw new Error('Incident notification persistence failed');
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, checks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'Health collection failed' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});

