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
    const payload = await req.json();
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
