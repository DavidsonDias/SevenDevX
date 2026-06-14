// Edge Function: gsc-insights
// Consulta Google Search Console via Lovable Connector Gateway.
// Retorna queries, páginas, cliques, impressões, CTR e posição média.

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';

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

  const headers = {
    Authorization: `Bearer ${LOVABLE_API_KEY}`,
    'X-Connection-Api-Key': GSC_KEY,
    'Content-Type': 'application/json',
  };

  try {
    const body = await req.json().catch(() => ({}));
    const action = body.action ?? 'overview';
    const site = body.site ?? 'https://www.sevendevx.com/';
    const days = Number(body.days ?? 28);
    const dim = body.dimension ?? 'query'; // query | page | country | device

    if (action === 'sites') {
      const r = await fetch(`${GATEWAY}/webmasters/v3/sites`, { headers });
      const data = await r.json();
      return new Response(JSON.stringify(data), {
        status: r.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Overview / search analytics
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
    const data = await r.json();

    return new Response(JSON.stringify({ site, days, dimension: dim, ...data }), {
      status: r.status,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    return new Response(
      JSON.stringify({ error: String((err as Error).message ?? err) }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } },
    );
  }
});
