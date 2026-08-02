/**
 * 🚀 index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/lead-score-ai/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `lead-score-ai` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `user_roles`, `contacts`
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
 * 🌐 ai.gateway.lovable.dev
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
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
 * ⚡ lead-score-ai/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/lead-score-ai/index.ts
 * @module Pipeline
 *
 * @description
 * Calcula a pontuação de qualificação de leads.
 *
 * @security
 * JWT + role admin / job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * AI Gateway
 *
 * @remarks
 * Score é apoio à decisão, não classificação definitiva.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🤖 Lead Score AI — pontua leads de 0-100 via Lovable AI Gateway.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

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
    if (token && token === SERVICE_KEY) {
      authorized = true;
    } else if (token) {
      const admin = createClient(SUPABASE_URL, SERVICE_KEY);
      const { data: userData } = await admin.auth.getUser(token);
      if (userData?.user) {
        const { data: r } = await admin.from('user_roles').select('role').eq('user_id', userData.user.id).eq('role', 'admin').maybeSingle();
        if (r) authorized = true;
      }
    }
    if (!authorized) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { contact_id } = await req.json();
    if (!contact_id) return new Response(JSON.stringify({ error: 'contact_id_required' }), { status: 400, headers: corsHeaders });

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: c } = await supa.from('contacts').select('*').eq('id', contact_id).maybeSingle();
    if (!c) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: corsHeaders });

    const prompt = `Analise este lead e retorne APENAS JSON {"score": 0-100, "priority": "high|medium|low", "reasons": [string]}.

Lead:
- Nome: ${c.name}
- Email: ${c.email}
- Empresa: ${c.company ?? '—'}
- Telefone: ${c.phone ?? '—'}
- Origem: ${c.source ?? '—'}
- Mensagem: ${(c.message ?? '').slice(0, 800)}

Critérios:
+ email corporativo (não gmail/hotmail) +20
+ empresa preenchida +15
+ mensagem detalhada (>100 chars) +15
+ palavras-chave de intenção (orçamento, projeto, urgente, contratar) +30
+ telefone informado +10
+ origem qualificada (referral, indicação) +10
- email descartável -30
- mensagem genérica/spam -50`;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${LOVABLE_API_KEY}` },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
      }),
    });
    if (!r.ok) {
      const text = await r.text();
      return new Response(JSON.stringify({ error: 'ai_failed', detail: text.slice(0, 500) }), { status: 502, headers: corsHeaders });
    }
    const j = await r.json();
    let parsed: any = {};
    try { parsed = JSON.parse(j.choices?.[0]?.message?.content || '{}'); } catch {}
    const score = Math.max(0, Math.min(100, Number(parsed.score) || 0));
    const sla = score >= 70 ? 4 : score >= 40 ? 24 : 72; // horas

    await supa.from('contacts').update({
      lead_score: score,
      score_reasons: parsed,
      sla_due_at: new Date(Date.now() + sla * 3600_000).toISOString(),
    }).eq('id', contact_id);

    return new Response(JSON.stringify({ ok: true, score, parsed }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
