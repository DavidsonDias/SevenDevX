/**
 * ⚡ whatsapp-webhook/index.ts — SevenOS Edge Function
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/whatsapp-webhook/index.ts
 * @module WhatsApp
 *
 * @description
 * Recebe mensagens e status da Meta Cloud API.
 *
 * @security
 * Assinatura HMAC do payload. Segredos permanecem em Deno.env e nunca são retornados.
 *
 * @external-api
 * Meta Cloud API
 *
 * @remarks
 * Rejeitar qualquer payload cuja assinatura não confira.
 *
 * @see docs/security/EDGE_FUNCTION_SECURITY.md
 * @see supabase/functions/README.md
 * ═══════════════════════════════════════════════════════════════════════
 */
// WhatsApp Business Cloud API webhook receiver + verifier (Meta).
// GET: verification challenge. POST: incoming messages + status updates.
import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supa = createClient(SUPABASE_URL, SERVICE_KEY);

  // Verification challenge
  if (req.method === 'GET') {
    const url = new URL(req.url);
    const mode = url.searchParams.get('hub.mode');
    const token = url.searchParams.get('hub.verify_token');
    const challenge = url.searchParams.get('hub.challenge');
    const { data: setting } = await supa.from('system_settings').select('value').eq('key', 'whatsapp_verify_token').maybeSingle();
    const expected = (setting?.value as any) ? String(setting.value).replace(/"/g, '') : '';
    if (mode === 'subscribe' && token === expected && expected) {
      return new Response(challenge || '', { status: 200 });
    }
    return new Response('forbidden', { status: 403 });
  }

  try {
    // Verify Meta X-Hub-Signature-256 HMAC before trusting the payload
    const rawBody = await req.text();
    const sigHeader = req.headers.get('x-hub-signature-256') || '';
    const { data: appSecretRow } = await supa.from('system_settings').select('value').eq('key', 'whatsapp_app_secret').maybeSingle();
    const appSecret = appSecretRow?.value ? String(appSecretRow.value).replace(/"/g, '') : (Deno.env.get('WHATSAPP_APP_SECRET') ?? '');
    if (!appSecret || !sigHeader.startsWith('sha256=')) {
      return new Response(JSON.stringify({ error: 'signature_required' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const key = await crypto.subtle.importKey(
      'raw', new TextEncoder().encode(appSecret),
      { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
    );
    const macBuf = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(rawBody));
    const expected = Array.from(new Uint8Array(macBuf)).map((b) => b.toString(16).padStart(2, '0')).join('');
    const provided = sigHeader.slice('sha256='.length).toLowerCase();
    if (expected.length !== provided.length) {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    if (diff !== 0) {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const payload = JSON.parse(rawBody);
    const entries = payload?.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};
        // Status updates
        for (const st of value.statuses || []) {
          await supa.from('whatsapp_messages').update({ status: st.status }).eq('wa_message_id', st.id);
        }
        // Incoming messages
        for (const msg of value.messages || []) {
          const phone = msg.from as string;
          const profileName = value.contacts?.[0]?.profile?.name || null;
          const body = msg.text?.body || msg.button?.text || msg.interactive?.list_reply?.title || `[${msg.type}]`;
          const mediaId = msg.image?.id || msg.audio?.id || msg.video?.id || msg.document?.id || null;
          const mediaType = msg.image ? 'image' : msg.audio ? 'audio' : msg.video ? 'video' : msg.document ? 'document' : null;

          // Upsert thread
          const { data: existing } = await supa.from('whatsapp_threads').select('id, unread_count').eq('contact_phone', phone).maybeSingle();
          let threadId = existing?.id;
          if (threadId) {
            await supa.from('whatsapp_threads').update({
              last_message_at: new Date().toISOString(),
              last_message_preview: body.slice(0, 160),
              unread_count: (existing!.unread_count || 0) + 1,
              contact_name: profileName || undefined,
              status: 'open',
            }).eq('id', threadId);
          } else {
            const { data: created } = await supa.from('whatsapp_threads').insert({
              contact_phone: phone,
              contact_name: profileName,
              last_message_preview: body.slice(0, 160),
              unread_count: 1,
            }).select('id').single();
            threadId = created?.id;
          }

          if (threadId) {
            await supa.from('whatsapp_messages').insert({
              thread_id: threadId,
              direction: 'in',
              body,
              media_url: mediaId,
              media_type: mediaType,
              wa_message_id: msg.id,
              status: 'received',
            });
          }
        }
      }
    }
    return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
});
