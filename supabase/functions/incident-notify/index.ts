/**
 * 🚀 incident-notify/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/incident-notify/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `incident-notify` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `user_roles`, `system_settings`, `events`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `incident-notify`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
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
 * ⚡ incident-notify/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/incident-notify/index.ts
 * @module System Health
 *
 * @description
 * Notifica a equipe sobre incidentes abertos ou agravados.
 *
 * @security
 * Token de job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Canais de notificação
 *
 * @remarks
 * Evitar tempestade de alertas: respeitar deduplicação por incidente.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Incident notifier — posts incident summary to Discord/Slack webhooks stored in system_settings.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SEV_COLOR: Record<string, number> = { critical: 0xef4444, high: 0xf97316, medium: 0xeab308, low: 0x3b82f6 };

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// ✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.
//

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    // Auth: require internal service secret OR admin JWT
    const authHeader = req.headers.get('Authorization') || '';
    const token = authHeader.replace(/^Bearer\s+/i, '');
    let authorized = false;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    if (token && token === SERVICE_KEY) {
      authorized = true;
    } else if (token) {
      const { data: u } = await supa.auth.getUser(token);
      if (u?.user) {
        const { data: r } = await supa.from('user_roles').select('role').eq('user_id', u.user.id).eq('role', 'admin').maybeSingle();
        if (r) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const body = await req.json();
    const inc = body.incident || body;
    // Sanitize incident fields to prevent chat injection
    const sanitize = (s: any, max = 500) => String(s ?? '').replace(/[\r\n]+/g, ' ').slice(0, max);
    inc.title = sanitize(inc.title, 200);
    inc.description = sanitize(inc.description, 1000);
    inc.impact = sanitize(inc.impact, 500);
    inc.severity = sanitize(inc.severity, 20);
    inc.status = sanitize(inc.status, 20);
    const { data: settings } = await supa.from('system_settings').select('key,value').in('key', ['discord_webhook_url', 'slack_webhook_url']);
    const map: Record<string, string> = {};
    for (const r of settings || []) map[r.key] = typeof r.value === 'string' ? r.value : (r.value?.url ?? '');

    const sev = (inc.severity || 'medium').toLowerCase();
    const title = `🚨 ${sev.toUpperCase()} · ${inc.title || 'Novo incident'}`;
    const desc = inc.description || inc.impact || 'Incident aberto pelo SevenOS.';
    const url = `https://www.sevendevx.com/admin/incidents`;
    const results: any = {};

    // Discord
    if (map.discord_webhook_url) {
      const r = await fetch(map.discord_webhook_url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          embeds: [{
            title, description: desc, color: SEV_COLOR[sev] ?? 0x64748b, url,
            fields: [
              { name: 'Severidade', value: sev, inline: true },
              { name: 'Status', value: inc.status || 'open', inline: true },
            ],
            timestamp: new Date().toISOString(),
            footer: { text: 'SevenOS Incidents' },
          }],
        }),
      });
      results.discord = r.status;
    }
    // Slack
    if (map.slack_webhook_url) {
      const r = await fetch(map.slack_webhook_url, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: `${title}\n${desc}\n${url}`,
          attachments: [{ color: '#' + (SEV_COLOR[sev] ?? 0x64748b).toString(16), text: `Status: ${inc.status || 'open'} · Sev: ${sev}` }],
        }),
      });
      results.slack = r.status;
    }

    await supa.from('events').insert({ type: 'incident.notified', source: 'incident-notify', severity: 'info', payload: { incident_id: inc.id, results } });
    return new Response(JSON.stringify({ ok: true, results }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
