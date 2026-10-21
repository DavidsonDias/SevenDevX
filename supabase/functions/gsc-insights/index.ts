import { adminContext, corsHeaders, failure, GSC_SCOPE, IntegrationError, json, providerFetch, requestBody } from '../_shared/integration-auth.ts';
Deno.serve(async req => {
  if(req.method==='OPTIONS') return new Response(null,{headers:corsHeaders});
  try {
    const {user,db}=await adminContext(req); const body=await requestBody(req);
    if(!['sites','analytics','overview'].includes(body.action??'overview')) throw new IntegrationError('invalid_action',400,'Operação inválida.');
    const days=Number(body.days??28),dimension=body.dimension??'query';
    if(!Number.isInteger(days)||days<1||days>90||!['query','page','country','device'].includes(dimension)) throw new IntegrationError('invalid_query',400,'Período ou dimensão inválidos.');
    if(body.action!=='sites' && (typeof body.site!=='string'||!body.site||body.site.length>2048)) throw new IntegrationError('invalid_site',400,'Selecione uma propriedade do Search Console.');
    const connection=await db.from('oauth_connections').select('id,access_token,refresh_token,expires_at,scopes').eq('user_id',user.id).in('provider',['google_search_console','google']).eq('status','active').contains('scopes',[GSC_SCOPE]).order('created_at',{ascending:false}).limit(1).maybeSingle();
    if(connection.error) throw connection.error;
    const c=connection.data;
    if(!c) return json({ok:false,code:'google_connection_required',error:'Conecte sua conta Google em OAuth Conexões e autorize a leitura do Search Console.'},409);
    let token=c.access_token;
    if(!token || (c.expires_at && Date.parse(c.expires_at)<Date.now()+60000)) {
      const clientId=Deno.env.get('GOOGLE_OAUTH_CLIENT_ID'),secret=Deno.env.get('GOOGLE_OAUTH_CLIENT_SECRET');
      if(!c.refresh_token||!clientId||!secret) throw new IntegrationError('google_reconnect_required',409,'Reconecte a conta Google para renovar a autorização do Search Console.');
      const r=await providerFetch('https://oauth2.googleapis.com/token',{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({client_id:clientId,client_secret:secret,refresh_token:c.refresh_token,grant_type:'refresh_token'})});
      const t=await r.json();
      if(!r.ok||typeof t.access_token!=='string'||!t.access_token) throw new IntegrationError('google_reconnect_required',409,'O Google solicitou uma nova autorização. Reconecte a conta.');
      token=t.access_token;
      const seconds=Number(t.expires_in);
      if(!Number.isFinite(seconds)||seconds<=0) throw new IntegrationError('google_refresh_failed',502,'Resposta de autorização inválida do Google.');
      const saved=await db.from('oauth_connections').update({access_token:token,expires_at:new Date(Date.now()+seconds*1000).toISOString(),last_refreshed_at:new Date().toISOString()}).eq('id',c.id).eq('user_id',user.id).eq('status','active').select('id').maybeSingle();
      if(saved.error) throw saved.error;
      if(!saved.data) throw new IntegrationError('google_reconnect_required',409,'A conexão foi revogada. Reconecte a conta Google.');
    }
    const headers={Authorization:`Bearer ${token}`,'Content-Type':'application/json'};
    const sitesResponse=await providerFetch('https://www.googleapis.com/webmasters/v3/sites',{headers});
    if(!sitesResponse.ok) throw new IntegrationError('google_access_denied',sitesResponse.status===401||sitesResponse.status===403?409:502,'Verifique a autorização Google e se a API Search Console está habilitada.');
    const sites=await sitesResponse.json();
    const entries=Array.isArray(sites.siteEntry)?sites.siteEntry.filter((s:any)=>typeof s.siteUrl==='string'&&s.permissionLevel!=='siteUnverifiedUser').map((s:any)=>({siteUrl:s.siteUrl,permissionLevel:s.permissionLevel})):[];
    if(body.action==='sites') return json({ok:true,siteEntry:entries});
    if(!entries.some((s:{siteUrl:string})=>s.siteUrl===body.site)) throw new IntegrationError('site_not_authorized',403,'A conta Google não possui acesso a esta propriedade.');
    const end=new Date(Date.now()-86400000),start=new Date(end); start.setUTCDate(end.getUTCDate()-days+1);
    const response=await providerFetch(`https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(body.site)}/searchAnalytics/query`,{method:'POST',headers,body:JSON.stringify({startDate:start.toISOString().slice(0,10),endDate:end.toISOString().slice(0,10),dimensions:[dimension],rowLimit:50})});
    if(!response.ok) throw new IntegrationError('google_query_failed',502,'O Google não concluiu a consulta. Verifique a permissão da propriedade e tente novamente.');
    const data=await response.json();
    return json({ok:true,rows:data.rows??[],site:body.site,days,dimension});
  } catch(e) { return failure(e); }
});
