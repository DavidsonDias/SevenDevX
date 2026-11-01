import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import path from 'node:path';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';

test('login waits for MFA, rejects invalid OTP and retains the requested destination after confirmation',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://www.sevendevx.com/auth',pretendToBeVisual:true});
 for(const key of ['window','document','navigator','HTMLElement','Element','Event','MutationObserver'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const fixture=path.resolve('src/contexts/AuthContext.tsx');
 const result=await build({stdin:{contents:`export {default as Auth} from './src/pages/Auth';export {fixture} from './src/contexts/AuthContext';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},loader:{'.css':'empty'},plugins:[{name:'auth-fixture',setup(b){
 b.onLoad({filter:/AuthContext\.tsx$/},()=>({loader:'js',contents:`export const fixture={level:'aal1',required:true,fail:false,verifyError:true,verifies:0};export const useAuthContext=()=>({user:{id:'test'},session:{user:{id:'test'},access_token:'fixture-token'},isLoading:false,signOut:async()=>{}});`}));
 b.onLoad({filter:/integrations[\\/]supabase[\\/]client\.ts$/},()=>({loader:'js',contents:`import {fixture} from ${JSON.stringify(fixture)};export const supabase={auth:{mfa:{getAuthenticatorAssuranceLevel:async()=>{if(fixture.fail)throw Error('offline');return {data:{currentLevel:fixture.level,nextLevel:fixture.required?'aal2':'aal1'}}},listFactors:async()=>({data:{totp:[{id:'totp',status:'verified'}]}}),challengeAndVerify:async()=>{fixture.verifies++;if(fixture.verifyError)return {error:Error('bad code')};fixture.level='aal2';return {error:null}}}}};`}));
 b.onLoad({filter:/usePublicCopy\.ts$/},()=>({loader:'js',contents:'export const usePublicCopy=()=>({copy:value=>value});'}));
 b.onLoad({filter:/use-toast\.ts$/},()=>({loader:'js',contents:'export const useToast=()=>({toast(){}});'}));
 b.onLoad({filter:/SEOHead\.tsx$/},()=>({loader:'js',contents:'export default function SEO(){return null}'}));
 }}]});
 const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {MemoryRouter,Routes,Route}=await import('react-router-dom');const {createRoot}=await import('react-dom/client');
 const render=()=>React.createElement(MemoryRouter,{initialEntries:['/auth?redirect=%2Fadmin%2Fprojects%3Ftab%3Dactive'],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(Routes,null,React.createElement(Route,{path:'/auth',element:React.createElement(module.exports.Auth)}),React.createElement(Route,{path:'/admin/projects',element:React.createElement('h1',null,'Requested project screen')}),React.createElement(Route,{path:'/',element:React.createElement('h1',null,'Public home')})));
 let root=createRoot(document.getElementById('root'));
 try{
 await act(async()=>{root.render(render());await new Promise(r=>setTimeout(r,20));});
 assert.match(document.body.textContent,/Confirme seu autenticador/);assert.doesNotMatch(document.body.textContent,/Requested project screen|Public home/);
 const input=document.getElementById('login-mfa');
 await act(()=>{Object.getOwnPropertyDescriptor(dom.window.HTMLInputElement.prototype,'value').set.call(input,'123456');input.dispatchEvent(new Event('input',{bubbles:true}));});
 await act(async()=>{document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,10));});
 assert.equal(module.exports.fixture.verifies,1);assert.match(document.body.textContent,/Código inválido/);assert.doesNotMatch(document.body.textContent,/Requested project screen/);
 module.exports.fixture.verifyError=false;
 await act(async()=>{document.querySelector('form').dispatchEvent(new Event('submit',{bubbles:true,cancelable:true}));await new Promise(r=>setTimeout(r,20));});
 assert.match(document.body.textContent,/Requested project screen/);
 await act(()=>root.unmount());module.exports.fixture.fail=true;
 root=createRoot(document.getElementById('root'));
 await act(async()=>{root.render(render());await new Promise(r=>setTimeout(r,20));});
 assert.match(document.body.textContent,/Não foi possível verificar/);assert.doesNotMatch(document.body.textContent,/Requested project screen|Public home/);
 }finally{await act(()=>root.unmount());dom.window.close();}
});
