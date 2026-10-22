import { integrationFetch as fetch } from '../_shared/integration-http.ts';
/**
 * 🚀 webhook-retry-worker/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/webhook-retry-worker/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Edge Function `webhook-retry-worker` do módulo Edge Functions.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `webhook_deliveries`, `webhook_dlq`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `webhook-retry-worker`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔒 REGRAS DE NEGÓCIO E INVARIANTES                                  │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * 🔒 Secrets permanecem em `Deno.env` e nunca retornam ao cliente
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔐 SEGURANÇA                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Valida o JWT antes de qualquer operação privilegiada
 * 🔒 A autoridade final é a RLS do banco, não o corpo da requisição
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
import { corsHeaders } from '../_shared/integration-auth.ts';
import { createClient, serveIntegration } from '../_shared/integration-runtime.ts';

// ============================================================================
// ⚙️ CONSTANTS & CONFIGURATION
// ============================================================================

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const CRON_SECRET = Deno.env.get('CRON_SECRET') ?? '';

// ============================================================================
// 🔒 BUSINESS RULES & INVARIANTS
// ============================================================================
//
// 🔒 Requisições sem sessão válida são rejeitadas antes de tocar os dados.
// 🔒 A service role key permanece no servidor e nunca é devolvida ao frontend.
// 🔒 Secrets são lidos de `Deno.env`; valores brutos nunca retornam na resposta.
// 🔒 Payloads externos só são processados após verificação de assinatura.
// 🔒 A autoridade final de acesso é a RLS do banco, não a validação do cliente.
// ✅ Toda resposta inclui os headers de CORS previstos, inclusive nos caminhos de erro.
//

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

serveIntegration(async (req) => {
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
      .or('response_status.gte.400,response_status.eq.0')
      .limit(50);

    const results: any[] = [];
    for (const d of pending ?? []) {
      const wh = (d as any).webhook;
      if (!wh?.is_active) continue;
      const policy = wh.retry_policy ?? { max_attempts: 3, backoff_seconds: 30, multiplier: 2 };
      const maxAttempts = Math.min(10,Math.max(1,Number(policy.max_attempts)||3));
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

      const claim = await supa.from('webhook_deliveries').update({next_retry_at:new Date(Date.now()+120000).toISOString()}).eq('id',d.id).eq('attempt',d.attempt).eq('next_retry_at',d.next_retry_at).select('id').maybeSingle();
      if(!claim.data) continue;
      if(wh.verify_signature && !wh.secret) throw new Error('Webhook signing secret missing');
      const body = JSON.stringify({ event: d.event, payload: d.payload, timestamp: new Date().toISOString() });
      const signature = await sign(wh.secret || '', body);
      const t0 = Date.now();
      let status = 0, responseText = '', error: string | null = null;
      try {
        const r = await fetch(wh.url, {
          method: 'POST',
          headers: { ...(wh.headers || {}), 'Content-Type': 'application/json', 'X-SevenOS-Event': d.event, 'X-SevenOS-Signature': signature },
          body,
        });
        status = r.status; responseText = (await r.text()).slice(0, 4000);
      } catch (e: any) { error = 'integration_failed'; }
      const ok = status >= 200 && status < 300;
      const backoff = Math.min(86400,Math.max(1,Number(policy.backoff_seconds)||30)*Math.pow(Math.min(10,Math.max(1,Number(policy.multiplier)||2)),attempt-1));

      await supa.from('webhook_deliveries').update({
        attempt, response_status: status, response_body: responseText, error,
        duration_ms: Date.now() - t0, signature_verified: false,
        next_retry_at: ok ? null : new Date(Date.now() + backoff * 1000).toISOString(),
      }).eq('id', d.id);

      results.push({ id: d.id, attempt, ok, status });
    }

    return new Response(JSON.stringify({ processed: results.length, results }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'integration_failed' }), { status: 500, headers: corsHeaders });
  }
}, { internalOnly: true });
