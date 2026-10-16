// Anonymous chat: public project key is routing, not user authentication.
// A server-issued capability controls each conversation; only its SHA256 is stored.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
import { openAIRequest, textModel } from '../_shared/openai.ts';
const corsHeaders={
 'Access-Control-Allow-Origin':'*',
 'Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type',
 'Access-Control-Expose-Headers':'X-Conversation-Id, X-Conversation-Token, Retry-After',
};
const reply=(status:number,error:string,extra:Record<string,string>={})=>new Response(JSON.stringify({error}),{status,headers:{...corsHeaders,'Content-Type':'application/json',...extra}});
const SYSTEM_PROMPT = `Você é a 7AI, assistente virtual inteligente da SevenDevX - uma empresa de desenvolvimento web e software de alta performance.

📋 SOBRE A SEVENDEVX:
- Somos especializados em desenvolvimento web, aplicativos, sistemas empresariais e consultoria em tecnologia
- Trabalhamos com React, TypeScript, Node.js, Python, e tecnologias cloud
- Oferecemos serviços de: Sites institucionais, E-commerce, Sistemas ERP, Apps móveis, Consultoria técnica
- Localização: Belo Horizonte, MG - Brasil
- Contato: contato@sevendevx.com | WhatsApp: +55 31 98474-0625

🎯 SUAS DIRETRIZES:
1. Seja profissional, amigável e prestativo
2. Responda em português brasileiro
3. Se não souber algo específico, encaminhe para contato humano
4. Destaque nossos diferenciais: qualidade, prazo e suporte
5. Para orçamentos, colete: nome, email, tipo de projeto, prazo desejado
6. Mantenha respostas concisas (máx 3 parágrafos)
7. Use emojis moderadamente para tornar a conversa mais amigável

🚫 NÃO FAÇA:
- Não invente informações sobre preços específicos
- Não prometa prazos sem consulta
- Não compartilhe dados de outros clientes`;
async function readBody(req:Request){
 if(Number(req.headers.get('content-length'))>65536)throw new Error('too_large');
 const reader=req.body?.getReader();if(!reader)throw new Error('invalid_body');
 const decoder=new TextDecoder();let size=0,text='';
 try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>65536){await reader.cancel();throw new Error('too_large');}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}
 finally{reader.releaseLock();}
 return JSON.parse(text);
}
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return reply(405,'POST required');
 const supplied=req.headers.get('apikey')||req.headers.get('authorization')?.replace(/^Bearer /,'');
 let keys:unknown[]=[];try{keys=Object.values(JSON.parse(Deno.env.get('SUPABASE_PUBLISHABLE_KEYS')||'{}'));}catch{/* fail closed */}
 const allowed=[Deno.env.get('SUPABASE_ANON_KEY'),...keys].filter(k=>typeof k==='string'&&k.length>0);
 if(!supplied||!allowed.includes(supplied))return reply(401,'invalid API key');
 let input:any;try{input=await readBody(req);}catch(error){return reply(error instanceof Error&&error.message==='too_large'?413:400,'Requisição inválida');}
 const messages=input?.messages;
 if(!Array.isArray(messages)||!messages.length||messages.length>30||messages.some(m=>!m||!['user','assistant'].includes(m.role)||typeof m.content!=='string'||!m.content.trim()||m.content.length>4000)||messages.reduce((n,m)=>n+m.content.length,0)>30000||messages.at(-1)?.role!=='user')return reply(400,'Mensagens inválidas');
 const id=input.conversationId??null;
 if(id!==null&&(typeof id!=='string'||! /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)))return reply(400,'Conversa inválida');
 if(id!==null&&(typeof input.conversationToken!=='string'||! /^[0-9a-f]{64}$/.test(input.conversationToken)))return reply(403,'Conversa inválida');
 const visitor=typeof input.visitorId==='string'&&input.visitorId.length>0&&input.visitorId.length<=64?input.visitorId:'anonymous';
 if(!Deno.env.get('OPENAI_API_KEY'))return reply(503,'Assistente temporariamente indisponível');
 try{
  const token=id?input.conversationToken:Array.from(crypto.getRandomValues(new Uint8Array(32)),b=>b.toString(16).padStart(2,'0')).join('');
  const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(token));
  const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
  const sb=createClient(Deno.env.get('SUPABASE_URL')!,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:reservation,error:reserveError}=await sb.rpc('reserve_public_chat',{_conversation_id:id,_token_hash:hash,_visitor_id:visitor});
  if(reserveError)throw new Error('reservation_failed');
  if(reservation?.allowed!==true){
   if(reservation?.reason==='invalid_conversation')return reply(403,'Conversa inválida');
   if(reservation?.reason==='rate_limited')return reply(429,'Limite de solicitações atingido. Tente mais tarde.',{'Retry-After':String(Math.min(86400,Math.max(1,Number(reservation.retry_after)||60)))});
   throw new Error('invalid_reservation');
  }
  const conversation=reservation.conversation_id;
  if(typeof conversation!=='string')throw new Error('invalid_reservation');
  const {error:saveError}=await sb.from('chat_messages').insert({conversation_id:conversation,role:'user',content:messages.at(-1).content});
  if(saveError)throw new Error('message_persistence_failed');
  const response=await openAIRequest('chat/completions',{method:'POST',body:JSON.stringify({model:textModel(),messages:[{role:'system',content:SYSTEM_PROMPT},...messages.map(m=>({role:m.role,content:m.content}))],stream:true,max_tokens:1024,temperature:0.7})});
  if(!response.ok){
   let code='unknown';try{const body=await response.json();if(typeof body?.error?.code==='string'&&/^[a-z_]{1,80}$/.test(body.error.code))code=body.error.code;}catch{/* no raw body logged */}
   console.warn('ai_chat_provider_error',JSON.stringify({status:response.status,code}));
   if(response.status===429&&!['credit_balance_exhausted','insufficient_quota','billing_hard_limit_reached','organization_spend_limit_exceeded','project_spend_limit_exceeded','organization_usage_limit_exceeded'].includes(code))return reply(429,'Muitas solicitações. Tente mais tarde.',{'Retry-After':'60'});
   return reply(503,'Assistente temporariamente indisponível. Entre em contato pelo WhatsApp: +55 31 98474-0625');
  }
  if(!response.body||!response.headers.get('content-type')?.includes('text/event-stream')){await response.body?.cancel();throw new Error('invalid_stream');}
  return new Response(response.body,{headers:{...corsHeaders,'Content-Type':'text/event-stream','Cache-Control':'no-store','X-Conversation-Id':conversation,'X-Conversation-Token':token}});
 }catch{console.warn('ai_chat_request_failed');return reply(503,'Assistente temporariamente indisponível');}
});
