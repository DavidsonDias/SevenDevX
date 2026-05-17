// Webhook dispatcher: signs payload (HMAC-SHA256), POSTs to webhook URL, logs delivery.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { webhook_id, event, payload, delivery_id } = await req.json();
    if (!webhook_id || !event) {
      return new Response(JSON.stringify({ error: 'missing_params' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const { data: webhook, error: whErr } = await supa.from('webhooks').select('*').eq('id', webhook_id).single();
    if (whErr || !webhook) throw new Error('webhook_not_found');
    if (!webhook.is_active || !webhook.url) throw new Error('webhook_inactive');

    const body = JSON.stringify({ event, payload, timestamp: new Date().toISOString() });
    const signature = await sign(webhook.secret || '', body);
    const headers: Record<string,string> = {
      'Content-Type': 'application/json',
      'X-SevenOS-Event': event,
      'X-SevenOS-Signature': signature,
      ...(webhook.headers || {}),
    };

    const t0 = Date.now();
    let status = 0, responseText = '', error: string | null = null;
    try {
      const resp = await fetch(webhook.url, { method: 'POST', headers, body });
      status = resp.status;
      responseText = (await resp.text()).slice(0, 4000);
    } catch (e: any) {
      error = e?.message || 'fetch_failed';
    }
    const duration = Date.now() - t0;
    const ok = status >= 200 && status < 300;

    await supa.from('webhook_deliveries').insert({
      webhook_id, event, payload, response_status: status, response_body: responseText,
      error, duration_ms: duration, attempt: 1,
    });
    await supa.from('webhooks').update({
      last_delivery_at: new Date().toISOString(),
      success_count: ok ? (webhook.success_count || 0) + 1 : webhook.success_count,
      failure_count: ok ? webhook.failure_count : (webhook.failure_count || 0) + 1,
    }).eq('id', webhook_id);

    return new Response(JSON.stringify({ ok, status, duration_ms: duration, signature }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'internal_error' }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
