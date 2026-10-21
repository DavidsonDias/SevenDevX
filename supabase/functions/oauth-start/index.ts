import { adminContext, b64url, CALLBACK, corsHeaders, failure, IntegrationError, json, providerConfig, requestBody } from '../_shared/integration-auth.ts';
Deno.serve(async req => {
  if(req.method==='OPTIONS') return new Response(null,{headers:corsHeaders});
  try {
    const {user,db}=await adminContext(req); const body=await requestBody(req);
    if(body.action==='connections') {
      const result=await db.from('oauth_connections').select('id,provider,account_email,account_name,account_avatar,scopes,expires_at,created_at,status').eq('user_id',user.id).eq('status','active').order('created_at',{ascending:false});
      if(result.error) throw result.error; return json({ok:true,connections:result.data});
    }
    if(body.action==='disconnect') {
      if(typeof body.id!=='string' || !/^[a-f0-9-]{36}$/i.test(body.id)) throw new IntegrationError('invalid_id',400,'Conexão inválida.');
      const result=await db.from('oauth_connections').update({status:'revoked',access_token:null,refresh_token:null,raw_profile:{}}).eq('user_id',user.id).eq('id',body.id).eq('status','active').select('id').maybeSingle();
      if(result.error) throw result.error; if(!result.data) throw new IntegrationError('not_found',404,'Conexão não encontrada.');
      return json({ok:true});
    }
    const conf=providerConfig(body.provider);
    if(body.redirect_uri!==CALLBACK) throw new IntegrationError('invalid_redirect',400,'Use o endereço oficial de produção para conectar a conta.');
    if(body.scopes && body.scopes!==conf.scopes) throw new IntegrationError('invalid_scopes',400,'Os acessos são definidos pelo servidor.');
    const clientId=Deno.env.get(conf.client), clientSecret=Deno.env.get(conf.secret);
    if(!clientId || !clientSecret) return json({ok:false,code:'missing_credentials',error:`Configure ${conf.client} e ${conf.secret} no Supabase antes de conectar.`},503);
    const state=b64url(crypto.getRandomValues(new Uint8Array(24)));
    const verifier=conf.pkce?b64url(crypto.getRandomValues(new Uint8Array(32))):undefined;
    const pending=await db.from('oauth_connections').insert({user_id:user.id,provider:body.provider,status:'pending',raw_profile:{state,code_verifier:verifier,redirect_uri:CALLBACK}});
    if(pending.error) throw pending.error;
    const params=new URLSearchParams({client_id:clientId,redirect_uri:CALLBACK,response_type:'code',scope:conf.scopes,state});
    if(verifier) { params.set('code_challenge',b64url(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(verifier))))); params.set('code_challenge_method','S256'); params.set('access_type','offline'); params.set('prompt','consent'); }
    if(body.provider==='notion') params.set('owner','user');
    return json({ok:true,url:`${conf.authorize}?${params}`,state});
  } catch(e) { return failure(e); }
});
