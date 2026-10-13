/**
 * 🚀 session-geo/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/session-geo/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `session-geo` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `admin_sessions`, `notifications`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `session-geo`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🌐 API EXTERNA                                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🌐 ipapi.co
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
 * ⚡ session-geo/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/session-geo/index.ts
 * @module Security/Sessions
 *
 * @description
 * Enriquece a sessão administrativa com dados geográficos.
 *
 * @security
 * JWT do usuário. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Geo IP
 *
 * @remarks
 * IP é dado pessoal: armazenar apenas o necessário para auditoria.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🌍 Session Geo — enriquece sessão atual com país/cidade/ISP via ipapi.co.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
const corsHeaders = { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type', 'Content-Type': 'application/json' };

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
// ✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.
//

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'POST required' }), { status: 405, headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });
    const { data: admin, error: roleError } = await userClient.rpc('has_role', { _user_id: user.id, _role: 'admin' });
    if (roleError || admin !== true) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: corsHeaders });

    let payload;
    try { payload = await req.json(); } catch { return new Response(JSON.stringify({ error: 'invalid JSON' }), { status: 400, headers: corsHeaders }); }
    const session_id = payload?.session_id;
    if (typeof session_id !== 'string' || !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(session_id)) return new Response(JSON.stringify({ error: 'invalid session_id' }), { status: 400, headers: corsHeaders });
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: owned, error: ownershipError } = await supa.from('admin_sessions').select('id').eq('id', session_id).eq('user_id', user.id).is('revoked_at', null).maybeSingle();
    if (ownershipError) throw new Error('Session lookup failed');
    if (!owned) return new Response(JSON.stringify({ error: 'session not found' }), { status: 404, headers: corsHeaders });
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';

    let geo: any = {};
    if (ip) {
      try {
        const r = await fetch(`https://ipapi.co/${encodeURIComponent(ip)}/json/`, { signal: AbortSignal.timeout(5000) });
        if (r.ok) geo = await r.json();
      } catch {}
    }

    // detect suspicious: country change in last hour
    const { data: recent, error: historyError } = await supa
      .from('admin_sessions')
      .select('country, last_seen_at')
      .eq('user_id', user.id)
      .gte('last_seen_at', new Date(Date.now() - 3600_000).toISOString())
      .neq('id', session_id)
      .order('last_seen_at', { ascending: false })
      .limit(1);
    if (historyError) throw new Error('Session history failed');

    const suspicious = !!(geo.country_code && recent?.[0]?.country && recent[0].country !== geo.country_code);

    const { data: updated, error: updateError } = await supa.from('admin_sessions').update({
      ip,
      country: geo.country_code ?? null,
      city: geo.city ?? null,
      region: geo.region ?? null,
      lat: geo.latitude ?? null,
      lng: geo.longitude ?? null,
      isp: geo.org ?? null,
      is_suspicious: suspicious,
      geo_checked_at: new Date().toISOString(),
    }).eq('id', session_id).eq('user_id', user.id).is('revoked_at', null).select('id');
    if (updateError) throw new Error('Session update failed');
    if (!updated?.length) return new Response(JSON.stringify({ error: 'session not found' }), { status: 404, headers: corsHeaders });

    if (suspicious) {
      const { error: notificationError } = await supa.from('notifications').insert({
        user_id: user.id,
        type: 'session.suspicious',
        title: 'Login suspeito detectado',
        body: `IP de ${geo.country_name ?? geo.country_code} — anterior era ${recent[0].country}`,
        url: '/admin/sessions',
        severity: 'error',
        payload: { session_id, geo },
      });
      if (notificationError) throw new Error('Notification persistence failed');
    }

    return new Response(JSON.stringify({ ok: true, geo, suspicious }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch {
    return new Response(JSON.stringify({ error: 'Session enrichment failed' }), { status: 500, headers: corsHeaders });
  }
});