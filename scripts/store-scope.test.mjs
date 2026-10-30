import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import path from 'node:path';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';
async function fixture(){
 const result=await build({entryPoints:['src/components/StoreScopeBuilder.tsx'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},loader:{'.css':'empty'},plugins:[{name:'boundaries',setup(b){b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"export const useLanguage=()=>({language:'pt'});"}));b.onLoad({filter:/usePublicCopy\.ts$/},()=>({loader:'js',contents:'export const usePublicCopy=()=>({copy:value=>value});'}));}}]});
 const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const dom=new JSDOM('<div id="root"></div>',{url:'https://www.sevendevx.com/store',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','navigator','HTMLElement','Element','Event','MutationObserver'])Object.defineProperty(globalThis,key,{configurable:true,value:w[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=callback=>{callback();return 1;};w.HTMLElement.prototype.scrollIntoView=function(){};
 const {createRoot}=await import('react-dom/client');const root=createRoot(w.document.getElementById('root'));return{w,render:props=>act(()=>root.render(React.createElement(module.exports.default,props))),change:fn=>act(fn),close:async()=>{await act(()=>root.unmount());w.close();}};
}
const plans=[{id:'landing',name:'Landing',price:'A partir de R$997',delivery:'Até7dias',features:[]},{id:'custom',name:'Custom',price:'Sob consulta',delivery:'Sob estimativa',features:[]}];
const services=[{id:'consulting',title:'Consultoria',description:'Diagnóstico',price:'R$497'},{id:'maintenance',title:'Manutenção',description:'Suporte',price:'R$297/mês'}];
test('scope requires a plan, reviews locally, keeps recurring prices separate, and only contacts on explicit action',async()=>{
 const f=await fixture();const calls=[];const props={plans,services,onContact:value=>calls.push(value)};
 try{await f.render(props);assert.match(f.w.document.querySelector('.store-scope-summary').textContent,/Escolha um plano/);assert.equal(f.w.document.querySelector('.store-scope-primary'),null);
 await f.change(()=>{const select=f.w.document.querySelector('select');select.value='landing';select.dispatchEvent(new f.w.Event('change',{bubbles:true}));});
 await f.change(()=>f.w.document.querySelectorAll('.store-extra-list button')[1].click());assert.equal(calls.length,0);
 await f.change(()=>f.w.document.querySelector('.store-scope-primary').click());assert.match(f.w.document.querySelector('#scope-summary-title').textContent,/Revise/);assert.equal(calls.length,0);assert.equal(f.w.document.activeElement.id,'scope-summary-title');
 await f.change(()=>f.w.document.querySelector('.store-scope-primary').click());assert.equal(calls.length,1);assert.match(calls[0],/Landing/);assert.match(calls[0],/R\$297\/mês/);assert.doesNotMatch(calls[0],/1294|1.294/);
 await f.change(()=>f.w.document.querySelector('.store-scope-edit').click());assert.equal(f.w.document.querySelectorAll('.store-extra-list [aria-pressed=true]').length,1);
 }finally{await f.close();}
});
test('incoming plan and repeated service requests preserve extras without duplicates',async()=>{
 const f=await fixture();const props={plans,services,onContact:()=>{}};
 try{await f.render({...props,initialPlanId:'custom',initialPlanRevision:1,requestedService:{id:'maintenance',nonce:1}});assert.equal(f.w.document.querySelector('select').value,'custom');assert.equal(f.w.document.querySelectorAll('.store-extra-list [aria-pressed=true]').length,1);
 await f.render({...props,initialPlanId:'landing',initialPlanRevision:2,requestedService:{id:'maintenance',nonce:2}});assert.equal(f.w.document.querySelector('select').value,'landing');assert.equal(f.w.document.querySelectorAll('.store-extra-list [aria-pressed=true]').length,1);
 await f.change(()=>{const select=f.w.document.querySelector('select');select.value='custom';select.dispatchEvent(new f.w.Event('change',{bubbles:true}));});
 await f.render({...props,initialPlanId:'landing',initialPlanRevision:3,requestedService:{id:'maintenance',nonce:3}});assert.equal(f.w.document.querySelector('select').value,'landing');assert.equal(f.w.document.querySelectorAll('.store-extra-list [aria-pressed=true]').length,1);
 }finally{await f.close();}
});
