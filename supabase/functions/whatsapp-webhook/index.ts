import { createClient } from '../_shared/integration-runtime.ts';
import { corsHeaders, json } from '../_shared/integration-auth.ts';
Deno.serve(async req => {
  if(req.method==='OPTIONS') return new Response(null,{headers:corsHeaders});
  if(!['GET','POST'].includes(req.method)) return json({error:'method_not_allowed'},405);
  try {
    const db=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!);
    if(req.method==='GET') {
      const u=new URL(req.url),r=await db.from('system_settings').select('value').eq('key','whatsapp_verify_token').maybeSingle();
      const expected=typeof r.data?.value==='string'?r.data.value:Deno.env.get('WHATSAPP_VERIFY_TOKEN');
      if(expected && u.searchParams.get('hub.mode')==='subscribe' && u.searchParams.get('hub.verify_token')===expected) return new Response(u.searchParams.get('hub.challenge')||'',{headers:{'Cache-Control':'no-store'}});
      return json({error:'forbidden'},403);
    }
    const signature=req.headers.get('x-hub-signature-256')||'';
    if(!/^sha256=[a-f0-9]{64}$/i.test(signature)) return json({error:'signature_required'},401);
    const r=await db.from('system_settings').select('value').eq('key','whatsapp_app_secret').maybeSingle();
    const secret=typeof r.data?.value==='string'?r.data.value:Deno.env.get('WHATSAPP_APP_SECRET');
    if(!secret) return json({error:'signature_required'},401);
    const reader=req.body?.getReader();if(!reader)return json({error:'invalid_body'},400);
    let size=0;const chunks:Uint8Array[]=[];
    try {while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>262144){await reader.cancel();return json({error:'body_too_large'},413);}chunks.push(value);}}finally{reader.releaseLock();}
    const bytes=new Uint8Array(size);let offset=0;for(const c of chunks){bytes.set(c,offset);offset+=c.length;}
    const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
    const provided=Uint8Array.from(signature.slice(7).match(/../g)!,x=>parseInt(x,16));
    if(!await crypto.subtle.verify('HMAC',key,provided,bytes))return json({error:'invalid_signature'},401);
    const payload=JSON.parse(new TextDecoder().decode(bytes));
    if(payload.object!=='whatsapp_business_account'||!Array.isArray(payload.entry))return json({error:'invalid_payload'},400);
    for(const entry of payload.entry.slice(0,100))for(const change of (Array.isArray(entry.changes)?entry.changes:[]).slice(0,100)) {
      const value=change.value||{};
      for(const st of (Array.isArray(value.statuses)?value.statuses:[]).slice(0,100))if(typeof st.id==='string'&&['sent','delivered','read','failed'].includes(st.status))await db.from('whatsapp_messages').update({status:st.status}).eq('wa_message_id',st.id).eq('direction','out');
      for(const m of (Array.isArray(value.messages)?value.messages:[]).slice(0,100)) {
        if(typeof m.id!=='string'||typeof m.from!=='string'||!/^\d{6,20}$/.test(m.from))continue;
        const text=String(m.text?.body||m.button?.text||m.interactive?.list_reply?.title||`[${m.type}]`).slice(0,10000);
        const profile=typeof value.contacts?.[0]?.profile?.name==='string'?value.contacts[0].profile.name.slice(0,200):null;
        await db.from('whatsapp_threads').upsert({contact_phone:m.from,contact_name:profile},{onConflict:'contact_phone',ignoreDuplicates:true});
        const thread=await db.from('whatsapp_threads').select('id,unread_count').eq('contact_phone',m.from).single();
        const mediaType=['image','audio','video','document'].find(k=>m[k]?.id)??null;
        const inserted=await db.from('whatsapp_messages').upsert({thread_id:thread.data.id,direction:'in',body:text,wa_message_id:m.id,status:'received',media_type:mediaType,media_url:mediaType?m[mediaType].id:null},{onConflict:'wa_message_id',ignoreDuplicates:true}).select('id');
        if(inserted.data?.length)await db.from('whatsapp_threads').update({last_message_at:new Date().toISOString(),last_message_preview:text.slice(0,160),unread_count:(thread.data.unread_count||0)+1,status:'open',...(profile?{contact_name:profile}:{})}).eq('id',thread.data.id);
      }
    }
    return json({ok:true});
  } catch {return json({error:'webhook_processing_failed'},500);}
});
