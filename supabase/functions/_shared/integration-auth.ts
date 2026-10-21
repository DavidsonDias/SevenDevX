import { createClient } from 'npm:@supabase/supabase-js@2.49.1';
export const corsHeaders = {
  'Access-Control-Allow-Origin': 'https://www.sevendevx.com',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Vary': 'Origin',
};
export class IntegrationError extends Error {
  constructor(public code: string, public status: number, message: string) { super(message); }
}
export function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { ...corsHeaders, 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
}
export function failure(e: unknown) {
  return e instanceof IntegrationError ? json({ ok: false, code: e.code, error: e.message }, e.status)
    : json({ ok: false, code: 'integration_failed', error: 'Não foi possível concluir a integração. Tente novamente.' }, 500);
}
export async function requestBody(req: Request) {
  if (req.method !== 'POST') throw new IntegrationError('method_not_allowed', 405, 'Use POST.');
  const reader = req.body?.getReader();
  if (!reader) throw new IntegrationError('invalid_json', 400, 'Informe uma requisição JSON.');
  const chunks: Uint8Array[] = []; let size = 0;
  try { while (true) { const {done,value} = await reader.read(); if (done) break; size += value.length;
    if (size > 16384) { await reader.cancel(); throw new IntegrationError('body_too_large',413,'Requisição muito grande.'); } chunks.push(value); }
  } finally { reader.releaseLock(); }
  try { const bytes = new Uint8Array(size); let offset=0; for (const c of chunks) { bytes.set(c,offset); offset+=c.length; }
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== 'object' || Array.isArray(body)) throw new Error(); return body;
  } catch { throw new IntegrationError('invalid_json',400,'Informe um objeto JSON válido.'); }
}
export async function adminContext(req: Request) {
  const authorization = req.headers.get('Authorization') || '';
  if (!/^Bearer \S+$/.test(authorization)) throw new IntegrationError('unauthorized',401,'Entre novamente para continuar.');
  const url = Deno.env.get('SUPABASE_URL')!;
  const client = createClient(url,Deno.env.get('SUPABASE_ANON_KEY')!,{global:{headers:{Authorization:authorization}},auth:{persistSession:false,autoRefreshToken:false}});
  const {data,error} = await client.auth.getUser();
  if (error || !data.user) throw new IntegrationError('unauthorized',401,'Entre novamente para continuar.');
  const role = await client.rpc('has_role',{_user_id:data.user.id,_role:'admin'});
  if (role.error || role.data !== true) throw new IntegrationError('forbidden',403,'É necessário acesso administrativo e a verificação de segurança da conta.');
  const db=createClient(url,Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,{auth:{persistSession:false,autoRefreshToken:false}});
  return {user:data.user,db};
}
export const CALLBACK = 'https://www.sevendevx.com/oauth/callback';
export const GSC_SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly';
const google = {authorize:'https://accounts.google.com/o/oauth2/v2/auth', token:'https://oauth2.googleapis.com/token', client:'GOOGLE_OAUTH_CLIENT_ID', secret:'GOOGLE_OAUTH_CLIENT_SECRET', profile:'https://www.googleapis.com/oauth2/v3/userinfo', pkce:true};
export const PROVIDERS = {
  google: {...google, scopes:'openid email profile https://www.googleapis.com/auth/drive.readonly'},
  google_search_console: {...google, scopes:`openid email profile ${GSC_SCOPE}`},
  github:{authorize:'https://github.com/login/oauth/authorize',token:'https://github.com/login/oauth/access_token',client:'GITHUB_OAUTH_CLIENT_ID',secret:'GITHUB_OAUTH_CLIENT_SECRET',profile:'https://api.github.com/user',pkce:false,scopes:'read:user repo'},
  slack:{authorize:'https://slack.com/oauth/v2/authorize',token:'https://slack.com/api/oauth.v2.access',client:'SLACK_CLIENT_ID',secret:'SLACK_CLIENT_SECRET',profile:'',pkce:false,scopes:'chat:write,channels:read,users:read'},
  notion:{authorize:'https://api.notion.com/v1/oauth/authorize',token:'https://api.notion.com/v1/oauth/token',client:'NOTION_OAUTH_CLIENT_ID',secret:'NOTION_OAUTH_CLIENT_SECRET',profile:'',pkce:false,scopes:''},
};
export function providerConfig(provider: unknown) {
  if (typeof provider !== 'string' || !Object.hasOwn(PROVIDERS,provider)) throw new IntegrationError('unsupported_provider',400,'Provedor não suportado.');
  return PROVIDERS[provider as keyof typeof PROVIDERS];
}
export function b64url(bytes: Uint8Array) { return btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,''); }
export async function providerFetch(url: string, init: RequestInit = {}) {
  return await fetch(url,{...init,redirect:'error',signal:AbortSignal.timeout(12000)});
}
