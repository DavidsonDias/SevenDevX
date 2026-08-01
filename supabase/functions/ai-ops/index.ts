// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ ai-ops/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/ai-ops/index.ts
 * @module AI Ops
 *
 * @description
 * Operações assistidas por IA sob demanda.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * AI Gateway
 *
 * @remarks
 * Ações sugeridas ficam em ai_ops_actions para revisão humana.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// AI Ops assistant: analyzes recent events/logs/incidents via Lovable AI Gateway. Admin-only.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY')!;

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const authHeader = req.headers.get('Authorization') || '';
    if (!authHeader.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      global: { headers: { Authorization: authHeader } },
    });
    const { data: userData, error: uErr } = await userClient.auth.getUser();
    if (uErr || !userData?.user) {
      return new Response(JSON.stringify({ error: 'unauthorized' }), {
        status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }
    const { data: isAdmin } = await userClient.rpc('has_role', {
      _user_id: userData.user.id, _role: 'admin',
    });
    if (!isAdmin) {
      return new Response(JSON.stringify({ error: 'forbidden' }), {
        status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { question } = await req.json().catch(() => ({}));

    const [eventsR, incR, intR] = await Promise.all([
      supa.from('events').select('type, severity, created_at, payload').order('created_at', { ascending: false }).limit(40),
      supa.from('incidents').select('title, severity, status, created_at').order('created_at', { ascending: false }).limit(10),
      supa.from('integration_providers').select('name, health_status, last_error, is_active').limit(20),
    ]);

    const context = JSON.stringify({
      recent_events: eventsR.data || [],
      open_incidents: (incR.data || []).filter((i: any) => i.status !== 'resolved'),
      integrations: intR.data || [],
    });

    const prompt = `Você é o SevenOS Ops Assistant. Analise o estado operacional e responda objetivamente em português.
Contexto JSON:
${context}

Pergunta do operador: ${question || 'Resuma o estado atual do sistema, destaque alertas e sugira próximas ações.'}

Responda em markdown enxuto com seções: 📊 Status, 🚨 Alertas, ✅ Ações sugeridas.`;

    const resp = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${LOVABLE_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [{ role: 'user', content: prompt }],
      }),
    });
    if (!resp.ok) {
      const txt = await resp.text();
      return new Response(JSON.stringify({ error: 'ai_failed', detail: txt }), { status: 502, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const data = await resp.json();
    const answer = data?.choices?.[0]?.message?.content || 'Sem resposta.';
    return new Response(JSON.stringify({ answer }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'internal_error' }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
