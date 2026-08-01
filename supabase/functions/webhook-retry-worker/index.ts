// ============================================================================
// 📦 IMPORTS
// ============================================================================

/**
 * ⚡ webhook-retry-worker/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/webhook-retry-worker/index.ts
 * @module Webhooks
 *
 * @description
 * Reprocessa entregas na dead-letter queue.
 *
 * @security
 * Token de job. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Endpoints externos
 *
 * @remarks
 * Reprocessamento pode duplicar entrega: consumidores devem ser idempotentes.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// 🔁 Webhook Retry Worker — varre deliveries pendentes, redispara via webhook-dispatch, ou move pra DLQ.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

// ============================================================================
// 🧠 BUSINESS LOGIC
// ============================================================================

async function sign(secret: string, body: string): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(body));
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('');
}

// ============================================================================
// 🌐 REQUEST HANDLER
// ============================================================================

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });
  const auth = req.headers.get('Authorization') || '';
  const provided = auth.replace(/^Bearer\s+/i, '');
  const okAuth = (CRON_SECRET && provided === CRON_SECRET) || (SERVICE_KEY && provided === SERVICE_KEY);
  if (!okAuth) {
    return new Response(JSON.stringify({ error: 'unauthorized' }), {
      status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
  try {
    const supa = createClient(SUPABASE_URL, SERVICE_KEY);
    const { data: pending } = await supa
      .from('webhook_deliveries')
      .select('*, webhook:webhooks(*)')
      .lte('next_retry_at', new Date().toISOString())
      .eq('is_dead_letter', false)
      .gte('response_status', 400)
      .limit(50);

    const results: any[] = [];
    for (const d of pending ?? []) {
      const wh = (d as any).webhook;
      if (!wh?.is_active) continue;
      const policy = wh.retry_policy ?? { max_attempts: 3, backoff_seconds: 30, multiplier: 2 };
      const maxAttempts = policy.max_attempts ?? 3;
      const attempt = (d.attempt ?? 1) + 1;

      if (attempt > maxAttempts) {
        await supa.from('webhook_deliveries').update({ is_dead_letter: true, next_retry_at: null }).eq('id', d.id);
        await supa.from('webhook_dlq').insert({
          webhook_id: wh.id, delivery_id: d.id, event: d.event, payload: d.payload,
          last_error: d.error, attempts: attempt - 1,
        });
        results.push({ id: d.id, moved_to_dlq: true });
        continue;
      }

      const body = JSON.stringify({ event: d.event, payload: d.payload, timestamp: new Date().toISOString() });
      const signature = await sign(wh.secret || '', body);
      const t0 = Date.now();
      let status = 0, responseText = '', error: string | null = null;
      try {
        const r = await fetch(wh.url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-SevenOS-Event': d.event, 'X-SevenOS-Signature': signature, ...(wh.headers || {}) },
          body,
        });
        status = r.status; responseText = (await r.text()).slice(0, 4000);
      } catch (e: any) { error = e?.message ?? 'fetch_failed'; }
      const ok = status >= 200 && status < 300;
      const backoff = (policy.backoff_seconds ?? 30) * Math.pow(policy.multiplier ?? 2, attempt - 1);

      await supa.from('webhook_deliveries').update({
        attempt, response_status: status, response_body: responseText, error,
        duration_ms: Date.now() - t0, signature_verified: true,
        next_retry_at: ok ? null : new Date(Date.now() + backoff * 1000).toISOString(),
      }).eq('id', d.id);

      results.push({ id: d.id, attempt, ok, status });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'error' }), { status: 500, headers: corsHeaders });
  }
});
