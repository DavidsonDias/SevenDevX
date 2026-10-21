import { createClient as sdkClient } from 'npm:@supabase/supabase-js@2.49.1';
import { adminContext, corsHeaders, failure, IntegrationError } from './integration-auth.ts';
// Query errors must not silently turn failed reads/writes into successful operations.
export const createClient = ((...args: Parameters<typeof sdkClient>) => {
  const client = sdkClient(...args);
  const checked = (query: any): any => new Proxy(query,{get(target,key) {
    if(key==='then') return (resolve: any,reject: any) => Promise.resolve(target).then((result:any)=>{if(result.error) throw new Error('Integration database operation failed');return result;}).then(resolve,reject);
    const value=Reflect.get(target,key,target);
    return typeof value==='function' ? (...params:any[]) => {const next=value.apply(target,params);return next && typeof next.then==='function'?checked(next):next;} : value;
  }});
  return new Proxy(client,{get(target,key) {if(key==='from'||key==='rpc') return (...params:any[])=>checked((target[key] as Function).apply(target,params));return Reflect.get(target,key,target);}});
}) as typeof sdkClient;
export function serveIntegration(handler: (req: Request) => Promise<Response>, options: { internalOnly?: boolean; adminOnly?: boolean } = {}) {
  Deno.serve(async req => {
    if(req.method==='OPTIONS') return new Response(null,{headers:corsHeaders});
    try {
      if(req.method!=='POST') throw new IntegrationError('method_not_allowed',405,'Use POST.');
      const key=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY'), cron=Deno.env.get('CRON_SECRET');
      const auth=req.headers.get('Authorization')||'';
      const internal=(!options.adminOnly && !!key && auth===`Bearer ${key}`) || (!options.adminOnly && options.internalOnly && !!cron && auth===`Bearer ${cron}`);
      if(!internal) {if(options.internalOnly)throw new IntegrationError('unauthorized',401,'Acesso reservado ao agendador.');await adminContext(req);}
      const probe=req.clone().body?.getReader(); let bytes=0;
      if(probe) try {while(true){const {value,done}=await probe.read();if(done)break;bytes+=value.length;if(bytes>262144){void probe.cancel();throw new IntegrationError('body_too_large',413,'Requisição muito grande.');}}}finally{probe.releaseLock();}
      return await handler(req);
    } catch(e) {return failure(e);}
  });
}
