// Incident notifier — posts incident summary to Discord/Slack webhooks stored in system_settings.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

const SEV_COLOR: Record<string, number> = { critical: 0xef4444, high: 0xf97316, medium: 0xeab308, low: 0x3b82f6 };

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const body = await req.json();
    const inc = body.incident || body;
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: settings } = await supa.from('system_settings').select('key,value').in('key', ['discord_webhook_url', 'slack_webhook_url']);
    const map: Record<string, string> = {};
    for (const r of settings || []) map[r.key] = typeof r.value === 'string' ? r.value : (r.value?.url ?? '');

    const sev = (inc.severity || 'medium').toLowerCase();
    const title = `🚨 ${sev.toUpperCase()} · ${inc.title || 'Novo incident'}`;
    const desc = inc.description || inc.impact || 'Incident aberto pelo SevenOS.';
    const url = `https://sevendevx.lovable.app/admin/incidents`;
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
