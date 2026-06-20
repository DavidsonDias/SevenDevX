// 🩺 Health Collector — pinga serviços críticos e salva snapshot.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

async function check(name: string, fn: () => Promise<boolean>): Promise<any> {
  const t0 = Date.now();
  try {
    const ok = await Promise.race([
      fn(),
      new Promise<boolean>((_, rej) => setTimeout(() => rej(new Error('timeout')), 8000)),
    ]);
    return { service_name: name, status: ok ? 'up' : 'down', latency_ms: Date.now() - t0 };
  } catch (e: any) {
    return { service_name: name, status: 'down', latency_ms: Date.now() - t0, error: e?.message?.slice(0, 200) };
  }
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);

    const checks = await Promise.all([
      check('database', async () => {
        const { error } = await supa.from('system_settings').select('key').limit(1);
        return !error;
      }),
      check('edge_functions', async () => {
        const r = await fetch(`${SUPABASE_URL}/functions/v1/push-public-key`);
        return r.status < 500;
      }),
      check('ai_gateway', async () => {
        if (!LOVABLE_API_KEY) return false;
        const r = await fetch('https://ai.gateway.lovable.dev/v1/models', {
          headers: { Authorization: `Bearer ${LOVABLE_API_KEY}` },
        });
        return r.ok;
      }),
      check('storage', async () => {
        const { error } = await supa.storage.from('attachments').list('', { limit: 1 });
        return !error;
      }),
    ]);

    await supa.from('service_health_snapshots').insert(checks);

    // auto-create incident on consecutive down (last 2 snapshots)
    for (const c of checks) {
      if (c.status === 'down') {
        const { data: prev } = await supa
          .from('service_health_snapshots')
          .select('status')
          .eq('service_name', c.service_name)
          .order('checked_at', { ascending: false })
          .limit(3);
        if (prev && prev.length >= 2 && prev[1]?.status === 'down') {
          await supa.from('notifications').insert({
            user_id: null,
            type: 'incident.detected',
            title: `Serviço fora do ar: ${c.service_name}`,
            body: c.error ?? 'Downtime detectado em 2 checagens consecutivas',
            url: '/admin/system-health',
            severity: 'error',
            payload: c,
          });
        }
      }
    }

    return new Response(JSON.stringify({ ok: true, checks }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
