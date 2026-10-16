import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const code=ts.transpileModule(fs.readFileSync(new URL('../supabase/functions/openai-test/index.ts',import.meta.url),'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
function harness({role=true,roleError=null,authError=null,authThrows=false,user={id:'synthetic-user'},providerStatus=200,key=true}={}){
 let handler;const calls=[];
 const env={SUPABASE_URL:'https://synthetic.invalid',SUPABASE_SERVICE_ROLE_KEY:'synthetic-service-key',SUPABASE_ANON_KEY:'synthetic-public-key',SUPABASE_SECRET_KEYS:JSON.stringify({default:'synthetic-opaque-key'}),OPENAI_API_KEY:key?'synthetic-provider-key':''};
 const require=name=>name.includes('supabase-js')?{createClient:(url,publicKey,options)=>{assert.equal(publicKey,'synthetic-public-key');assert.equal(options.global.headers.Authorization,'Bearer synthetic-jwt');return {auth:{getUser:async()=>{calls.push('user');if(authThrows)throw Error('Auth unavailable');return {data:{user},error:authError};}},rpc:async(name,args)=>{calls.push('role');assert.equal(name,'has_role');assert.deepEqual(args,{_user_id:'synthetic-user',_role:'admin'});return {data:role,error:roleError};}};}}
 :{textModel:()=> 'synthetic-text',imageModel:()=> 'synthetic-image',openAIRequest:async(path,init)=>{calls.push('provider');assert.equal(path,'models');assert.equal(init.method,'GET');return Response.json({data:[{id:'synthetic-text'},{id:'synthetic-image'}]},{status:providerStatus});}};
 new Function('require','exports','Deno',code)(require,{}, {env:{get:name=>env[name]},serve:fn=>{handler=fn;}});
 return {calls,run:(headers={},method='POST')=>handler(new Request('https://synthetic.invalid/diagnostic',{method,headers}))};
}
test('missing, malformed and publishable credentials do not call provider',async()=>{for(const headers of [{},{Authorization:'synthetic-jwt'},{apikey:'synthetic-public-key'}]){const h=harness();assert.equal((await h.run(headers)).status,401);assert.ok(!h.calls.includes('provider'));}});
test('admin/AAL guard refusal and RPC errors fail closed',async()=>{for(const options of [{role:false},{role:true,roleError:{message:'RPC failed'}},{role:'admin'}]){const h=harness(options);assert.equal((await h.run({Authorization:'Bearer synthetic-jwt'})).status,401);assert.ok(!h.calls.includes('provider'));}});
test('invalid and unavailable Auth fail closed',async()=>{for(const options of [{user:null},{authError:{message:'expired'}},{authThrows:true}]){const h=harness(options);assert.equal((await h.run({Authorization:'Bearer synthetic-jwt'})).status,401);assert.ok(!h.calls.includes('provider'));}});
test('validated admin/AAL guard reaches read-only model listing',async()=>{const h=harness();const r=await h.run({Authorization:'Bearer synthetic-jwt'});assert.equal(r.status,200);assert.equal((await r.json()).generated_content,false);assert.deepEqual(h.calls,['user','role','provider']);});
test('existing trusted backend credentials remain supported',async()=>{for(const headers of [{Authorization:'Bearer synthetic-service-key'},{apikey:'synthetic-opaque-key'}]){const h=harness();assert.equal((await h.run(headers)).status,200);assert.deepEqual(h.calls,['provider']);}});
test('provider refusal and missing key never report success',async()=>{let h=harness({providerStatus:401});assert.equal((await h.run({Authorization:'Bearer synthetic-jwt'})).status,502);h=harness({key:false});assert.equal((await h.run({Authorization:'Bearer synthetic-jwt'})).status,503);assert.ok(!h.calls.includes('provider'));});
test('methods and preflight do not call provider',async()=>{for(const [method,status] of [['GET',405],['OPTIONS',200]]){const h=harness();assert.equal((await h.run({},method)).status,status);assert.equal(h.calls.length,0);}});
