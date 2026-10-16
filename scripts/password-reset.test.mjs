import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const source = fs.readFileSync(new URL('../src/pages/ResetPassword.tsx', import.meta.url), 'utf8');
const code = ts.transpileModule(source, {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,jsx:ts.JsxEmit.ReactJSX}}).outputText;
function harness({user={id:'synthetic-user'}, current=user, authError=null, updateError=null, requestError=null, confirmation='Synthetic-Only-Password', busy=false}={}) {
  const calls=[]; const changes=[];
  const states=['synthetic@example.invalid','Synthetic-Only-Password',confirmation,busy,'','',false];let index=0;
  const auth={getUser:async()=>{calls.push('validate');return {data:{user:current},error:authError};},updateUser:async body=>{calls.push(['update',body]);return {error:updateError};}};
  const context={user,isLoading:false,resetPassword:async email=>{calls.push(['request',email]);return {error:requestError};}};
  const jsx=(type,props)=>({type,props}); const exports={};
  const require=name=>name==='react'?{useState:()=>{const i=index++;return [states[i],value=>changes.push([i,value])];}}
    :name==='react/jsx-runtime'?{jsx,jsxs:jsx,Fragment:'fragment'}
    :name==='react-router-dom'?{Link:'link'}
    :name.includes('supabase/client')?{supabase:{auth}}
    :name.includes('AuthContext')?{useAuthContext:()=>context}
    :name.includes('GlassCard')?{default:'card'}:(()=>{throw Error(name);})();
  new Function('require','exports',code)(require,exports);
  const tree=exports.default();
  function find(node){if(!node||typeof node!=='object')return null;if(node.type==='form')return node;for(const child of [node.props?.children].flat(Infinity)){const found=find(child);if(found)return found;}return null;}
  return {calls,changes,submit:()=>find(tree).props.onSubmit({preventDefault(){}})};
}
test('recovery form validates the current server user before updating own password',async()=>{
 const h=harness();await h.submit();assert.equal(h.calls[0],'validate');assert.deepEqual(h.calls[1],['update',{password:'Synthetic-Only-Password'}]);assert.ok(h.changes.some(([i,v])=>i===6&&v===true));
});
test('expired or changed account cannot update password',async()=>{
 for(const options of [{current:null},{current:{id:'other'}},{authError:{code:'invalid_jwt'}}]){const h=harness(options);await h.submit();assert.deepEqual(h.calls,['validate']);assert.ok(h.changes.some(([i,v])=>i===5&&v.includes('expirou')));}
});
test('mismatched confirmation blocks any request',async()=>{const h=harness({confirmation:'different'});await h.submit();assert.equal(h.calls.length,0);});
test('signed out recovery requests a link without exposing account existence',async()=>{const h=harness({user:null});await h.submit();assert.deepEqual(h.calls,[['request','synthetic@example.invalid']]);assert.ok(h.changes.some(([i,v])=>i===4&&v.includes('Se o email estiver cadastrado')));});
test('provider refusal never reports success',async()=>{const h=harness({updateError:{code:'same_password'}});await h.submit();assert.ok(h.changes.some(([i,v])=>i===5&&v.includes('diferente')));assert.ok(!h.changes.some(([i,v])=>i===6&&v===true));});
