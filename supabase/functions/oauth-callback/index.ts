import { adminContext, CALLBACK, corsHeaders, failure, IntegrationError, json, providerConfig, providerFetch, requestBody } from '../_shared/integration-auth.ts';
Deno.serve(async req => {
  if(req.method==='OPTIONS') return new Response(null,{headers:corsHeaders});
  try {
    const {user,db}=await adminContext(req); const body=await requestBody(req); const conf=providerConfig(body.provider);
    if(body.redirect_uri!==CALLBACK || typeof body.code!=='string' || !body.code || body.code.length>4096 || typeof body.state!=='string' || !/^[A-Za-z0-9_-]{32}$/.test(body.state)) throw new IntegrationError('invalid_callback',400,'Retorno OAuth inválido. Inicie uma nova conexão.');
    const clientId=Deno.env.get(conf.client), secret=Deno.env.get(conf.secret);
    if(!clientId||!secret) throw new IntegrationError('missing_credentials',503,'As credenciais OAuth deste provedor não foram configuradas.');
    const pending=await db.from('oauth_connections').select('id,raw_profile,created_at').eq('user_id',user.id).eq('provider',body.provider).eq('status','pending').eq('raw_profile->>state',body.state).gte('created_at',new Date(Date.now()-600000).toISOString()).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(pending.error) throw pending.error;
    if(!pending.data || pending.data.raw_profile?.redirect_uri!==CALLBACK) throw new IntegrationError('state_mismatch',400,'Conexão expirada ou inválida. Inicie novamente.');
    const claim=await db.from('oauth_connections').update({status:'exchanging'}).eq('id',pending.data.id).eq('user_id',user.id).eq('status','pending').select('id').maybeSingle();
    if(claim.error) throw claim.error;
    if(!claim.data) throw new IntegrationError('already_consumed',409,'Este retorno já foi utilizado.');
    const form=new URLSearchParams({client_id:clientId,client_secret:secret,code:body.code,redirect_uri:CALLBACK,grant_type:'authorization_code'});
    if(conf.pkce) { const v=pending.data.raw_profile?.code_verifier; if(typeof v!=='string'||!v) throw new IntegrationError('invalid_pkce',400,'Inicie uma nova conexão.'); form.set('code_verifier',v); }
    const response=await providerFetch(conf.token,body.provider==='notion'?{method:'POST',headers:{Authorization:`Basic ${btoa(`${clientId}:${secret}`)}`,'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({grant_type:'authorization_code',code:body.code,redirect_uri:CALLBACK})}:{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded',Accept:'application/json'},body:form});
    const tok=await response.json();
    if(!response.ok || tok.error || typeof tok.access_token!=='string' || !tok.access_token) throw new IntegrationError('token_exchange_failed',400,'O provedor recusou a conexão. Inicie novamente.');
    let profile: Record<string,any>={};
    if(conf.profile) { const pr=await providerFetch(conf.profile,{headers:{Authorization:`Bearer ${tok.access_token}`,Accept:'application/json'}}); if(!pr.ok) throw new IntegrationError('profile_failed',502,'Não foi possível validar a conta no provedor.'); profile=await pr.json(); }
    else if(body.provider==='slack') profile={team:tok.team,authed_user:tok.authed_user};
    else profile={workspace_id:tok.workspace_id,workspace_name:tok.workspace_name,bot_id:tok.bot_id};
    const email=profile.email||profile.login||profile.authed_user?.id||profile.workspace_id;
    if(typeof email!=='string'||!email) throw new IntegrationError('profile_failed',502,'O provedor não identificou a conta.');
    const previous=await db.from('oauth_connections').select('refresh_token').eq('user_id',user.id).eq('provider',body.provider).eq('account_email',email).eq('status','active').maybeSingle();
    if(previous.error) throw previous.error;
    const expiry=Number(tok.expires_in);
    const result=await db.from('oauth_connections').upsert({user_id:user.id,provider:body.provider,account_email:email,account_name:profile.name||profile.login||profile.team?.name||profile.workspace_name||body.provider,account_avatar:profile.avatar_url||profile.picture||null,scopes:typeof tok.scope==='string'?tok.scope.split(/[ ,]+/):conf.scopes.split(/[ ,]+/).filter(Boolean),access_token:tok.access_token,refresh_token:tok.refresh_token||previous.data?.refresh_token||null,token_type:'Bearer',expires_at:Number.isFinite(expiry)&&expiry>0?new Date(Date.now()+expiry*1000).toISOString():null,raw_profile:profile,status:'active',last_refreshed_at:new Date().toISOString()},{onConflict:'user_id,provider,account_email'}).select('id,account_email,account_name').single();
    if(result.error) throw result.error;
    const consumed=await db.from('oauth_connections').update({status:'consumed',raw_profile:{}}).eq('id',pending.data.id).eq('user_id',user.id).eq('status','exchanging');
    if(consumed.error) throw consumed.error;
    return json({ok:true,connection:result.data});
  } catch(e) { return failure(e); }
});
