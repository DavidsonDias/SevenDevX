/**
 * ⚡ ai-ops-autonomous/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/ai-ops-autonomous/index.ts
 * @module AI Ops
 *
 * @description
 * Rotina autônoma de operações assistidas por IA.
 *
 * @security
 * Token de job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * AI Gateway
 *
 * @remarks
 * Executa sem interação humana: toda ação deve ser auditável e reversível.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Autonomous AI Ops: triage lead → suggest project draft + pricing. Admin only.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

async function ai(prompt: string, system = 'Você é um analista de negócios sênior da SevenDevX. Responda APENAS com JSON válido.') {
  const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'google/gemini-2.5-flash',
      messages: [{ role: 'system', content: system }, { role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
    }),
  });
  if (!r.ok) throw new Error(`ai_failed_${r.status}`);
  const j = await r.json();
  const txt = j?.choices?.[0]?.message?.content || '{}';
  try { return JSON.parse(txt); } catch { return { raw: txt }; }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const { kind, source_id, apply } = await req.json();
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    if (kind === 'triage_lead') {
      const { data: c } = await supa.from('contacts').select('*').eq('id', source_id).single();
      if (!c) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

      // Historical projects for pricing reference
      const { data: hist } = await supa.from('projects')
        .select('title, pipeline_stage, forecast_value, probability')
        .not('forecast_value', 'is', null).order('created_at', { ascending: false }).limit(15);

      const prompt = `Lead recebido:
Nome: ${c.name}
Email: ${c.email}
Empresa: ${c.company || '—'}
Telefone: ${c.phone || '—'}
Fonte: ${c.source || '—'}
Mensagem: ${c.message || c.subject || '—'}

Histórico de projetos (referência de pricing):
${JSON.stringify(hist || [], null, 2)}

Retorne JSON com:
{
  "score": 0-100 (qualidade do lead),
  "score_reasons": ["..."],
  "priority": "low|medium|high|urgent",
  "project_draft": {
    "title": "título sugerido",
    "subtitle": "subtítulo curto",
    "category": "web|saas|landing|sistema|outro",
    "estimated_scope": "descrição do escopo em 2-3 linhas",
    "forecast_value_brl": número,
    "probability": 0-100,
    "expected_close_days": número
  },
  "next_actions": ["ação 1", "ação 2"],
  "confidence": 0-100
}`;
      const out = await ai(prompt);
      const { data: action } = await supa.from('ai_ops_actions').insert({
        kind: 'triage_lead', source_entity: 'contact', source_id, input: { contact: c },
        output: out, confidence: out?.confidence || 0,
        status: apply ? 'applied' : 'pending',
        applied_by: apply ? u.user.id : null, applied_at: apply ? new Date().toISOString() : null,
      }).select().single();

      if (apply) {
        await supa.from('contacts').update({
          lead_score: out?.score || 0,
          score_reasons: { reasons: out?.score_reasons || [], ai_priority: out?.priority },
        }).eq('id', source_id);
      }
      return new Response(JSON.stringify({ ok: true, action, result: out }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    if (kind === 'pricing_suggestion') {
      const { data: p } = await supa.from('projects').select('*').eq('id', source_id).single();
      if (!p) return new Response(JSON.stringify({ error: 'not_found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      const { data: hist } = await supa.from('projects')
        .select('title, forecast_value, probability, pipeline_stage')
        .not('forecast_value', 'is', null).order('created_at', { ascending: false }).limit(20);
      const prompt = `Projeto atual:
${JSON.stringify({ title: p.title, subtitle: p.subtitle, stage: p.pipeline_stage, current_value: p.forecast_value }, null, 2)}

Histórico:
${JSON.stringify(hist || [], null, 2)}

Retorne JSON: { "suggested_value_brl": número, "probability": 0-100, "expected_close_days": número, "reasoning": "...", "confidence": 0-100 }`;
      const out = await ai(prompt);
      const { data: action } = await supa.from('ai_ops_actions').insert({
        kind: 'pricing_suggestion', source_entity: 'project', source_id, input: { project: { id: p.id, title: p.title } },
        output: out, confidence: out?.confidence || 0,
        status: apply ? 'applied' : 'pending',
        applied_by: apply ? u.user.id : null, applied_at: apply ? new Date().toISOString() : null,
      }).select().single();
      if (apply && out?.suggested_value_brl) {
        await supa.from('projects').update({
          forecast_value: out.suggested_value_brl,
          probability: out.probability || p.probability,
        }).eq('id', source_id);
      }
      return new Response(JSON.stringify({ ok: true, action, result: out }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    return new Response(JSON.stringify({ error: 'unknown_kind' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
