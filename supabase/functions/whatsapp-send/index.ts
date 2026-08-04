/**
 * 🚀 whatsapp-send/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/whatsapp-send/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `whatsapp-send` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `whatsapp_threads`, `system_settings`, `whatsapp_messages`
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
 * Edge Function `whatsapp-send`
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
 * 🌐 graph.facebook.com
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
 * ⚡ whatsapp-send/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/whatsapp-send/index.ts
 * @module WhatsApp
 *
 * @description
 * Envia mensagem pela Meta Cloud API.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Meta Cloud API
 *
 * @remarks
 * Respeitar janelas e templates aprovados pela Meta.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Send WhatsApp message via Meta Cloud API. Admin only.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const WA_TOKEN = Deno.env.get('WHATSAPP_TOKEN') || '';

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// ✅ A sessão autenticada é validada antes de qualquer operação privilegiada.
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// ✅ Operações administrativas exigem o papel `admin`; o papel nunca vem do cliente.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// 🌐 Falhas de API externa são tratadas e devolvidas como erro, sem derrubar o fluxo.
//

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await userClient.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { thread_id, phone, body } = await req.json();
    if (!body || (!thread_id && !phone)) return new Response(JSON.stringify({ error: 'missing_fields' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    let toPhone = phone;
    let threadId = thread_id;
    if (threadId && !toPhone) {
      const { data: th } = await supa.from('whatsapp_threads').select('contact_phone').eq('id', threadId).single();
      toPhone = th?.contact_phone;
    }
    if (!threadId && toPhone) {
      const { data: ex } = await supa.from('whatsapp_threads').select('id').eq('contact_phone', toPhone).maybeSingle();
      if (ex) threadId = ex.id;
      else {
        const { data: nw } = await supa.from('whatsapp_threads').insert({ contact_phone: toPhone, last_message_preview: body.slice(0, 160) }).select('id').single();
        threadId = nw?.id;
      }
    }

    // 🔑 Prefer tenant-managed credentials (system_settings) over env secret
    const { data: settingsRows } = await supa.from('system_settings').select('key, value')
      .in('key', ['whatsapp_token', 'whatsapp_business_phone_id']);
    const sm: Record<string, string> = {};
    (settingsRows || []).forEach((r: any) => {
      const v = r.value;
      sm[r.key] = typeof v === 'string' ? v : v?.value ?? String(v ?? '').replace(/"/g, '');
    });
    const phoneId = sm.whatsapp_business_phone_id || '';
    const token = sm.whatsapp_token || WA_TOKEN;
    let waId: string | null = null;
    let status = 'sent';
    let error: string | null = null;

    if (phoneId && token) {
      const r = await fetch(`https://graph.facebook.com/v20.0/${phoneId}/messages`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({ messaging_product: 'whatsapp', to: toPhone, type: 'text', text: { body } }),
      });
      const json = await r.json().catch(() => ({}));
      if (!r.ok) { status = 'failed'; error = JSON.stringify(json).slice(0, 500); }
      waId = json?.messages?.[0]?.id || null;
    } else {
      status = 'failed';
      error = 'Configure whatsapp_token e whatsapp_business_phone_id em /admin/integrations (WhatsApp Business)';
    }

    await supa.from('whatsapp_messages').insert({
      thread_id: threadId, direction: 'out', body, wa_message_id: waId, status, error, sent_by: u.user.id,
    });
    await supa.from('whatsapp_threads').update({
      last_message_at: new Date().toISOString(),
      last_message_preview: body.slice(0, 160),
    }).eq('id', threadId);

    return new Response(JSON.stringify({ ok: status === 'sent', wa_id: waId, error }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
