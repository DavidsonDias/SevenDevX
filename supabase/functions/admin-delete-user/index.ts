// Permanent account deletion: admin/MFA, exact target confirmation and atomic database guard.
// Auth deletion removes native sessions by FK cascade; already-issued JWT signatures expire normally.
import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
const corsHeaders={'Access-Control-Allow-Origin':'*','Access-Control-Allow-Headers':'authorization, x-client-info, apikey, content-type'};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:{...corsHeaders,'Content-Type':'application/json','Cache-Control':'no-store'}});
const isProtected=(email?:string|null)=>!!email&&['davidson','sevendevx'].some(p=>email.toLowerCase().includes(p));
Deno.serve(async(req)=>{
 if(req.method==='OPTIONS')return new Response('ok',{headers:corsHeaders});
 if(req.method!=='POST')return json({error:'POST required'},405);
 let deleteStarted=false;
 try{
  const url=Deno.env.get('SUPABASE_URL')!,anon=Deno.env.get('SUPABASE_ANON_KEY')!,key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
  const auth=req.headers.get('Authorization')||'';if(!auth.startsWith('Bearer '))return json({error:'unauthorized'},401);
  const caller=createClient(url,anon,{global:{headers:{Authorization:auth}}});
  const {data:me,error:authError}=await caller.auth.getUser();if(authError||!me?.user)return json({error:'unauthorized'},401);
  const authorized=async()=>{const {data,error}=await caller.rpc('has_role',{_user_id:me.user.id,_role:'admin'});return !error&&data===true;};
  if(!await authorized())return json({error:'forbidden'},403);
  // Bound the payload before JSON parsing; never accept unbounded request streams.
  const reader=req.body?.getReader();if(!reader)return json({error:'Invalid confirmation'},400);
  let size=0,text='';const decoder=new TextDecoder();
  try{for(;;){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>4096){await reader.cancel();return json({error:'Invalid confirmation'},413);}text+=decoder.decode(value,{stream:true});}text+=decoder.decode();}finally{reader.releaseLock();}
  let body:any;try{body=JSON.parse(text);}catch{return json({error:'Invalid confirmation'},400);}
  const id=body?.user_id;
  if(typeof id!=='string'||!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id)||typeof body.confirmation_email!=='string'||body.confirmation_email.length>320)return json({error:'Exact target confirmation required'},400);
  if(id.toLowerCase()===me.user.id.toLowerCase())return json({error:'cannot_delete_self'},400);
  const admin=createClient(url,key,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:target,error:targetError}=await admin.auth.admin.getUserById(id);
  if(targetError||!target?.user)return json({error:'user_not_found'},404);
  if(isProtected(target.user.email))return json({error:'protected_user'},403);
  if(!target.user.email||body.confirmation_email.trim().toLowerCase()!==target.user.email.toLowerCase())return json({error:'Target changed; confirm the current email'},409);
  const {data:ready,error:guardError}=await admin.rpc('admin_delete_guard_ready');
  if(guardError||ready!==true)return json({error:'Deletion safety guard unavailable'},503);
  const {data:audit,error:auditError}=await admin.from('audit_log').insert({
   actor_id:me.user.id,actor_email:me.user.email,table_name:'auth.users',record_id:id,action:'DELETE',
   summary:'Exclusão de usuário solicitada; resultado pendente',diff:{status:'requested',target_email:target.user.email},
  }).select('id').single();
  if(auditError||!audit?.id)return json({error:'Deletion audit persistence failed'},503);
  const record=async(status:string)=>{try{const {data,error}=await admin.from('audit_log').update({summary:status==='deleted'?'Usuário excluído':status==='failed'?'Exclusão recusada ou não executada':'Resultado da exclusão não confirmado',diff:{status,target_email:target.user.email}}).eq('id',audit.id).select('id').maybeSingle();return !error&&!!data;}catch{return false;}};
  if(!await authorized()){await record('failed');return json({error:'forbidden'},403);}
  deleteStarted=true;
  let deletion;
  try{deletion=await admin.auth.admin.deleteUser(id);}catch{await record('unknown');return json({ok:false,error:'Resultado da exclusão não confirmado. Confira a lista de usuários antes de repetir.',deletion_status:'unknown',do_not_retry:true});}
  if(deletion.error){
   if(typeof deletion.error.status!=='number'||deletion.error.status>=500){await record('unknown');return json({ok:false,error:'Resultado da exclusão não confirmado. Confira a lista de usuários antes de repetir.',deletion_status:'unknown',do_not_retry:true});}
   await record('failed');return json({error:'User deletion refused; account may still exist'},409);
  }
  let panelSessionWarning=false;
  try{const {error}=await admin.from('admin_sessions').update({revoked_at:new Date().toISOString()}).eq('user_id',id);panelSessionWarning=!!error;}catch{panelSessionWarning=true;}
  const auditConfirmed=await record('deleted');
  return json({ok:true,deleted_email:target.user.email,audit_warning:!auditConfirmed,panel_session_warning:panelSessionWarning});
 }catch{
  if(deleteStarted)return json({ok:false,error:'Resultado da exclusão não confirmado. Confira a lista de usuários antes de repetir.',deletion_status:'unknown',do_not_retry:true});
  return json({error:'User deletion failed before execution'},503);
 }
});

