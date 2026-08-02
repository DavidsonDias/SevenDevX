/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
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
 * index.ts
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
 * 🔒 Validações de frontend são de UX — a autoridade é o banco (RLS)
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
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: authHeader } } });
    const { data: { user } } = await userClient.auth.getUser();
    if (!user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: corsHeaders });

    const { session_id } = await req.json();
    const ip = (req.headers.get('x-forwarded-for') ?? '').split(',')[0].trim() || req.headers.get('cf-connecting-ip') || '';

    let geo: any = {};
    if (ip) {
      try {
        const r = await fetch(`https://ipapi.co/${ip}/json/`);
        if (r.ok) geo = await r.json();
      } catch {}
    }

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    // detect suspicious: country change in last hour
    const { data: recent } = await supa
      .from('admin_sessions')
      .select('country, last_seen_at')
      .eq('user_id', user.id)
      .gte('last_seen_at', new Date(Date.now() - 3600_000).toISOString())
      .neq('id', session_id)
      .order('last_seen_at', { ascending: false })
      .limit(1);

    const suspicious = !!(geo.country_code && recent?.[0]?.country && recent[0].country !== geo.country_code);

    await supa.from('admin_sessions').update({
      ip,
      country: geo.country_code ?? null,
      city: geo.city ?? null,
      region: geo.region ?? null,
      lat: geo.latitude ?? null,
      lng: geo.longitude ?? null,
      isp: geo.org ?? null,
      is_suspicious: suspicious,
      geo_checked_at: new Date().toISOString(),
    }).eq('id', session_id).eq('user_id', user.id);

    if (suspicious) {
      await supa.from('notifications').insert({
        user_id: user.id,
        type: 'session.suspicious',
        title: 'Login suspeito detectado',
        body: `IP de ${geo.country_name ?? geo.country_code} — anterior era ${recent[0].country}`,
        url: '/admin/sessions',
        severity: 'error',
        payload: { session_id, geo },
      });
    }

    return new Response(JSON.stringify({ ok: true, geo, suspicious }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
