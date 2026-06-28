// AI Contract Summarizer — analisa texto longo de contrato e devolve resumo + riscos + checklist.
// Admin only. Usa Lovable AI Gateway (Gemini Flash).
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

const SYSTEM = `Você é um advogado sênior especializado em contratos de tecnologia (desenvolvimento de software, SaaS, licenciamento, NDA). Analise o contrato fornecido e retorne APENAS JSON válido com a seguinte estrutura:
{
  "tldr": "resumo em 2-3 linhas",
  "parties": ["parte 1", "parte 2"],
  "object": "objeto do contrato em uma linha",
  "value_brl": número ou null,
  "term": "vigência (ex: 12 meses, indeterminado)",
  "payment_terms": "condições de pagamento",
  "key_clauses": [{"title":"...", "summary":"..."}],
  "risks": [{"severity":"high|medium|low","title":"...","detail":"...","clause_ref":"..."}],
  "missing": ["cláusulas/proteções faltando ou recomendadas"],
  "checklist_before_sign": ["item 1", "item 2"],
  "score": 0-100,
  "confidence": 0-100
}
Seja direto, técnico, em português BR. Não invente cláusulas.`;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const auth = req.headers.get('Authorization') || '';
    if (!auth.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const uc = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, { global: { headers: { Authorization: auth } } });
    const { data: u } = await uc.auth.getUser();
    if (!u?.user) return new Response(JSON.stringify({ error: 'unauthorized' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const { data: isAdmin } = await uc.rpc('has_role', { _user_id: u.user.id, _role: 'admin' });
    if (!isAdmin) return new Response(JSON.stringify({ error: 'forbidden' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const body = await req.json().catch(() => ({}));
    const text: string = (body?.text || '').toString();
    if (!text || text.length < 80) {
      return new Response(JSON.stringify({ error: 'text_too_short' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const truncated = text.length > 40000 ? text.slice(0, 40000) : text;

    const r = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: SYSTEM },
          { role: 'user', content: `Contrato:\n\n${truncated}` },
        ],
        response_format: { type: 'json_object' },
      }),
    });
    if (r.status === 429) return new Response(JSON.stringify({ error: 'rate_limit' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (r.status === 402) return new Response(JSON.stringify({ error: 'payment_required' }), { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    if (!r.ok) return new Response(JSON.stringify({ error: 'ai_failed', status: r.status }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    const j = await r.json();
    const content = j?.choices?.[0]?.message?.content || '{}';
    let parsed: any = {};
    try { parsed = JSON.parse(content); } catch { parsed = { raw: content }; }

    return new Response(JSON.stringify({ ok: true, analysis: parsed, truncated: text.length > 40000 }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'unknown' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
