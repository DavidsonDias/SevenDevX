/**
 * ⚡ gsc-insights/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/gsc-insights/index.ts
 * @module SEO
 *
 * @description
 * Insights de desempenho do Google Search Console.
 *
 * @security
 * JWT + role admin. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Google Search Console
 *
 * @remarks
 * Dados agregados; sem PII.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// Edge Function: gsc-insights
// Consulta Google Search Console via Lovable Connector Gateway.
// Retorna queries, páginas, cliques, impressões, CTR e posição média.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const GATEWAY = 'https://connector-gateway.lovable.dev/google_search_console';

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
  const GSC_KEY = Deno.env.get('GOOGLE_SEARCH_CONSOLE_API_KEY');

  if (!LOVABLE_API_KEY || !GSC_KEY) {
    return new Response(
      JSON.stringify({ error: 'Missing LOVABLE_API_KEY or GOOGLE_SEARCH_CONSOLE_API_KEY' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }

  const json = (data: unknown, status = 200) =>
    new Response(JSON.stringify(data), {
      status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  // Admin auth guard
  const authHeader = req.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return json({ error: 'unauthorized' }, 401);
  const SB_URL = Deno.env.get('SUPABASE_URL')!;
  const SB_ANON = Deno.env.get('SUPABASE_ANON_KEY')!;
  const userClient = createClient(SB_URL, SB_ANON, { global: { headers: { Authorization: authHeader } } });
  const { data: userData } = await userClient.auth.getUser();
  if (!userData?.user) return json({ error: 'unauthorized' }, 401);
  const { data: isAdmin } = await userClient.rpc('has_role', { _user_id: userData.user.id, _role: 'admin' });
  if (!isAdmin) return json({ error: 'forbidden' }, 403);

  const headers = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': GSC_KEY,
    'Content-Type': 'application/json',
  };


  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? 'overview';
    const site = body.site ?? 'sc-domain:sevendevx.com';
    const days = Number(body.days ?? 28);
    const dim = body.dimension ?? 'query'; // query | page | country | device

    if (action === 'sites') {
      const r = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
      const data = await r.json().catch(() => ({}));
      // Sempre 200 para o cliente; status real vai no body para o painel exibir.
      return json({ ok: r.ok, gsc_status: r.status, ...data });
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);

    const url = `${GATEWAY}/webmasters/v3/sites/${encodeURIComponent(site)}/searchAnalytics/query`;
    const payload = {
      startDate: fmt(start),
      endDate: fmt(end),
      dimensions: [dim],
      rowLimit: 50,
    };

    const r = await fetch(url, { method: 'POST', headers, body: JSON.stringify(payload) });
    const data = await r.json().catch(() => ({}));

    return json({
      ok: r.ok,
      gsc_status: r.status,
      site,
      days,
      dimension: dim,
      ...data,
      ...(r.ok ? {} : { error: (data as any)?.error?.message || `GSC retornou ${r.status}` }),
    });
  } catch (err) {
    return json({ ok: false, error: String((err as Error).message ?? err) }, 200);
  }
});
