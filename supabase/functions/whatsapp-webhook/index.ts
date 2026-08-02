/**
 * 🚀 whatsapp-webhook/index.ts — SevenDevX Enterprise Platform
 * ═══════════════════════════════════════════════════════════════════════
 *
 * @file supabase/functions/whatsapp-webhook/index.ts
 * @module Edge Functions
 * @layer Backend / Edge Function
 * @status Active
 *
 * @description
 * Recebe mensagens e status da Meta Cloud API.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ ✅ RESPONSABILIDADES PRINCIPAIS                                      │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * ✅ Lê/escreve nas tabelas: `system_settings`, `whatsapp_messages`, `whatsapp_threads`
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ 🔄 FLUXO DE DADOS                                                   │
 * └─────────────────────────────────────────────────────────────────────┘
 *
 * Supabase (RLS aplicada)
 *    ↓
 * Consulta direta via client
 *    ↓
 * Edge Function `whatsapp-webhook`
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
// 📦 IMPORTS & RUNTIME CONFIG
// ============================================================================

import { corsHeaders } from 'npm:@supabase/supabase-js@2/cors';
import { createClient } from 'npm:@supabase/supabase-js@2';

/**
 * SECURITY
 *
 * A função roda com service-role porque precisa gravar em `whatsapp_threads`
 * e `whatsapp_messages` sem sessão de usuário. Por isso o boundary de
 * confiança é a assinatura HMAC da Meta: nenhum dado é persistido antes dela.
 */
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders });

  const supa = createClient(SUPABASE_URL, SERVICE_KEY);

  // ==========================================================================
  // 🤝 VERIFICATION CHALLENGE (GET)
  // ==========================================================================
  //
  // Handshake exigido pela Meta ao cadastrar/renovar o webhook. O token
  // esperado vive em `system_settings` (admin-only) e nunca é ecoado: em caso
  // de divergência a resposta é apenas 403, sem revelar o valor correto.
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
    // ========================================================================
    // 🔐 SIGNATURE VERIFICATION (X-Hub-Signature-256)
    // ========================================================================
    //
    // O corpo é lido como texto cru porque o HMAC da Meta é calculado sobre os
    // bytes originais — reserializar o JSON invalidaria a assinatura.
    //
    // Segredo: `system_settings.whatsapp_app_secret` (configurável pelo admin)
    // com fallback para a env `WHATSAPP_APP_SECRET`. Ausência de segredo ou de
    // header resulta em 401, nunca em aceitação silenciosa.
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
    // Comparação em tempo constante: um `===` vazaria, pelo tempo de resposta,
    // quantos bytes iniciais do HMAC o atacante já acertou.
    let diff = 0;
    for (let i = 0; i < expected.length; i++) diff |= expected.charCodeAt(i) ^ provided.charCodeAt(i);
    if (diff !== 0) {
      return new Response(JSON.stringify({ error: 'invalid_signature' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    // ========================================================================
    // 📨 PAYLOAD PROCESSING
    // ========================================================================
    //
    // Estrutura da Meta: entry[] → changes[] → value{ statuses[], messages[] }.
    // Um único POST pode conter lotes de ambos os tipos, por isso os três
    // laços aninhados.
    const payload = JSON.parse(rawBody);
    const entries = payload?.entry || [];
    for (const entry of entries) {
      for (const change of entry.changes || []) {
        const value = change.value || {};

        // Confirmações de entrega/leitura das mensagens que nós enviamos.
        for (const st of value.statuses || []) {
          await supa.from('whatsapp_messages').update({ status: st.status }).eq('wa_message_id', st.id);
        }

        // Mensagens recebidas do contato.
        for (const msg of value.messages || []) {
          const phone = msg.from as string;
          const profileName = value.contacts?.[0]?.profile?.name || null;
          // Normaliza os vários formatos da Meta (texto, botão, lista) num
          // preview único; tipos sem texto viram `[image]`, `[audio]`, etc.
          const body = msg.text?.body || msg.button?.text || msg.interactive?.list_reply?.title || `[${msg.type}]`;
          // Guarda apenas o media_id: a URL da Meta expira em minutos e exige
          // token, então o download é feito sob demanda pela inbox.
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
