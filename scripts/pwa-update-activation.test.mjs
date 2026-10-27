import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import ts from "typescript";
import {createRequire} from "node:module";
const require=createRequire(import.meta.url);
function fixture({workerState="installed",allowed=true}={}){
 let dirty=false,reloads=0,posts=0;const listeners={},effects=[],timers=[],messages=[];let index=0;
 const worker={state:workerState,postMessage:()=>posts++};
 const registration={waiting:worker,addEventListener(){},removeEventListener(){}};
 const react={useRef:value=>({current:value}),useState:value=>{const i=index++;return [i===2?true:i===3?worker:value,next=>messages.push({index:i,value:next})];},useEffect:fn=>effects.push(fn)};
 const compiled=ts.transpileModule(fs.readFileSync("src/components/PWAUpdatePrompt.tsx","utf8"),{compilerOptions:{target:ts.ScriptTarget.ES2022,module:ts.ModuleKind.CommonJS,jsx:ts.JsxEmit.ReactJSX}}).outputText;
 const exports={};
 const win={location:{hostname:"www.sevendevx.com",reload:()=>reloads++}};win.self=win;win.top=win;
 const navigator={serviceWorker:{controller:{},getRegistration:async()=>registration,addEventListener:(event,fn)=>{listeners[event]=fn;},removeEventListener(){}}};
 new Function("exports","require","window","navigator","setTimeout","clearTimeout",compiled)(exports,name=>name==="react"?react:name==="@/lib/pwaUpdateSafety"?{canApplyPwaUpdate:async()=>allowed}:name==="@/lib/unsavedChanges"?{hasUnsavedEdits:()=>dirty}:name==="framer-motion"?{motion:{div:"div"},AnimatePresence:"div"}:require(name),win,navigator,(fn)=>{timers.push(fn);return timers.length;},()=>{});
 const tree=exports.default();for(const effect of effects)effect();
 function find(node){if(!node||typeof node!=="object")return;if(node.type==="button"&&node.props?.onClick?.name==="apply")return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child);if(found)return found;}}
 const button=find(tree);assert.ok(button,"Update action is rendered");
 return {apply:button.props.onClick,change:()=>listeners.controllerchange(),dirty:()=>{dirty=true;},timeout:()=>timers.forEach(fn=>fn()),reloads:()=>reloads,posts:()=>posts,messages};
}
test("Explicit approval activates a waiting worker and reloads only when controller changes",async()=>{const f=fixture();await f.apply();assert.equal(f.posts(),1);assert.equal(f.reloads(),0);f.change();assert.equal(f.reloads(),1);});
test("An already activated worker cannot leave the update button waiting for a past controller event",async()=>{const f=fixture({workerState:"activated"});await f.apply();assert.equal(f.posts(),0);assert.equal(f.reloads(),1);});
test("Open edits reject update; edits made during activation still prevent reload",async()=>{const denied=fixture({allowed:false});await denied.apply();assert.equal(denied.posts(),0);assert.equal(denied.reloads(),0);const f=fixture();await f.apply();f.dirty();f.change();assert.equal(f.reloads(),0);});
test("A stalled activation releases the button with a retry message instead of forcing a reload",async()=>{const f=fixture();await f.apply();f.timeout();assert.equal(f.reloads(),0);assert.ok(f.messages.some(m=>m.index===0&&m.value===false));assert.ok(f.messages.some(m=>typeof m.value==="string"&&m.value.includes("ainda não confirmou")));});
