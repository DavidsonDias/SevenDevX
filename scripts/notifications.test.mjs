import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";
function load(file) {const out=ts.transpileModule(fs.readFileSync(file,"utf8"),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;const exports={};new Function("exports",out)(exports);return exports;}
const policy=load("supabase/functions/_shared/push-policy.ts");
const timeout=load("src/lib/push-timeout.ts");
const links=load("src/lib/notification-links.ts");
test("Push endpoints reject SSRF, credentials, alternate ports, query-host confusion and fragments",()=>{
 for(const endpoint of ["http://fcm.googleapis.com/a","https://localhost/a","https://127.0.0.1/a","https://fcm.googleapis.com.evil.test/a","https://evil.test/?fcm.googleapis.com","https://u:p@fcm.googleapis.com/a","https://fcm.googleapis.com:444/a","https://fcm.googleapis.com/a#secret","https://[::1]/a",null,{}])assert.equal(policy.validPushEndpoint(endpoint),false,JSON.stringify(endpoint));
 for(const endpoint of ["https://fcm.googleapis.com/fcm/send/example","https://updates.push.services.mozilla.com/wpush/v2/example","https://web.push.apple.com/Qexample","https://wns2-par02p.notify.windows.com/w/?token=example"])assert.equal(policy.validPushEndpoint(endpoint),true,endpoint);
});
test("Only internal admin links are accepted, consistently across browser and server",()=>{
 for(const target of ["https://evil.test","//evil.test","/admin/../../evil","/admin\\evil.test","javascript:alert(1)","/auth?redirect=https://evil.test",null]){
  assert.equal(links.notificationPath(target),"/admin/notifications");assert.equal(policy.safeNotificationPath(target),"/admin/notifications");
 }
 for(const target of ["/admin","/admin/projects/123","/admin/contact-center?id=123"])assert.equal(links.notificationPath(target),target);
});
test("Retries are bounded, permanent errors never retry, expired subscriptions are pruned",()=>{
 for(const status of [0,408,429,500,503]){assert.equal(policy.retryDecision(status,1).retry,true);assert.equal(policy.retryDecision(status,3).retry,false);}
 for(const status of [400,401,403,413])assert.equal(policy.retryDecision(status,1).state,"failed");
 for(const status of [404,410])assert.equal(policy.retryDecision(status,1).state,"expired");
});
const swSource=fs.readFileSync("src/sw.ts","utf8");
const pushSource=swSource.slice(swSource.indexOf("const pushUuid"),swSource.indexOf('self.addEventListener("sync"'));
async function worker(overrides={}){
 const handlers={},shown=[],fetches=[],opened=[];
 const context={URL,AbortSignal,console,Promise,setTimeout,clearTimeout,fetch:async(url,options)=>{fetches.push({url,body:JSON.parse(options.body)});return {ok:true,status:200};},self:{location:{origin:"https://www.sevendevx.com"},registration:{showNotification:async(title,options)=>{shown.push({title,...options});}},clients:{matchAll:async()=>[],openWindow:async url=>{opened.push(url);}},addEventListener:(type,fn)=>{handlers[type]=fn;}},...overrides};
 vm.runInNewContext(ts.transpileModule(pushSource,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText,context);
 return {handlers,shown,fetches,opened};
}
const notice="aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa",delivery="bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb",token="cccccccc-cccc-4ccc-8ccc-cccccccccccc";
test("SW displays private generic content first, acknowledges delivery, and deduplicates by notice",async()=>{
 const w=await worker();let task;
 w.handlers.push({data:{json:()=>({title:"Sensitive client",body:"Private contact",url:"https://evil.test",notificationId:notice,deliveryId:delivery,receiptToken:token})},waitUntil:p=>{task=p;}});await task;
 assert.equal(w.shown.length,1);assert.equal(w.shown[0].title,"SevenDevX · SevenOS");assert.ok(!JSON.stringify(w.shown).includes("Sensitive client"));assert.equal(w.shown[0].tag,`sevenos-${notice}`);assert.equal(w.shown[0].data.url,`/admin/notifications/open/${notice}`);assert.equal(w.fetches.length,1);assert.equal(w.fetches[0].body.token,token);
});
test("SW shows notification even if receipt transport fails, with bounded attempts",async()=>{
 let attempts=0;const w=await worker({fetch:async()=>{attempts++;throw new Error("offline");}});let task;
 w.handlers.push({data:{json:()=>({notificationId:notice,deliveryId:delivery,receiptToken:token})},waitUntil:p=>{task=p;}});await task;assert.equal(w.shown.length,1);assert.equal(attempts,3);
});
test("Click rejects external targets and preserves existing editors",async()=>{
 const w=await worker();let task,closed=false;
 w.handlers.notificationclick({notification:{data:{url:"https://evil.test"},close:()=>{closed=true;}},waitUntil:p=>{task=p;}});await task;assert.equal(closed,true);assert.equal(w.opened[0],"https://www.sevendevx.com/admin/notifications");
});

test("SW click uses the authorized owned-notification resolver", async()=>{
 const w=await worker();let task;
 w.handlers.notificationclick({notification:{data:{url:`/admin/notifications/open/${notice}`,deliveryId:delivery,receiptToken:token},close(){}},waitUntil:p=>{task=p;}});await task;
 assert.equal(w.opened[0],`https://www.sevendevx.com/admin/notifications/open/${notice}`);assert.equal(w.fetches[0].body.clicked,true);
});
test("A successful display is required before a receipt can be sent", async()=>{
 const events={};let receipts=0;const w=await worker({fetch:async()=>{receipts++;return {ok:true,status:200};},self:{location:{origin:"https://www.sevendevx.com"},registration:{showNotification:async()=>{throw new Error("permission revoked");}},addEventListener:(type,fn)=>{events[type]=fn;}}});let task;
 events.push({data:{json:()=>({notificationId:notice,deliveryId:delivery,receiptToken:token})},waitUntil:p=>{task=p;}});await assert.rejects(task,/permission revoked/);assert.equal(receipts,0);
});

test("Permission timeout reports unanswered browser prompts and releases activation",async()=>{
 await assert.rejects(timeout.pushTimeout(new Promise(()=>{}),5,"Permission unanswered"),/Permission unanswered/);
 assert.equal(await timeout.pushTimeout(Promise.resolve("granted"),100,"unexpected"),"granted");
 await assert.rejects(timeout.pushTimeout(Promise.reject(new Error("denied")),100,"unexpected"),/denied/);
});
