import test from 'node:test';
import assert from 'node:assert/strict';
import {build} from 'esbuild';
import {createRequire} from 'node:module';
import path from 'node:path';
import fs from 'node:fs';
import React,{act} from 'react';
import {JSDOM} from 'jsdom';

test('dedicated contact retains details, requires confirmation and sends one sanitized payload through the existing hook',async()=>{
 const dom=new JSDOM('<div id="root"></div>',{url:'https://www.sevendevx.com/contact',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','navigator','HTMLElement','Element','Event','MutationObserver'])Object.defineProperty(globalThis,key,{configurable:true,value:w[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;globalThis.requestAnimationFrame=callback=>{callback();return 1;};w.HTMLElement.prototype.scrollIntoView=function(){};
 const result=await build({stdin:{contents:`export {default as Contact} from './src/components/ContactMultiStep'; export {calls} from './src/hooks/useContacts';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},loader:{'.css':'empty','.webp':'dataurl','.svg':'dataurl'},plugins:[{name:'no-network-fixture',setup(b){
 b.onLoad({filter:/useContacts\.ts$/},()=>({loader:'js',contents:'export const calls=[];export const useContacts=()=>({isSubmitting:false,saveAndOpenWhatsApp:async(...args)=>{calls.push(args)}});'}));
 b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"import {translations} from './translations';export const useLanguage=()=>({language:'pt',t:translations.pt});"}));
 b.onLoad({filter:/usePublicCopy\.ts$/},()=>({loader:'js',contents:'export const usePublicCopy=()=>({copy:value=>value});'}));
 b.onLoad({filter:/use-toast\.ts$/},()=>({loader:'js',contents:'export const useToast=()=>({toast(){}});'}));
 b.onLoad({filter:/ContactGuide\.tsx$/},()=>({loader:'js',contents:'export default function Guide(){return null}'}));
 b.onResolve({filter:/^react(?:\/.*)?$/},args=>({path:args.path,external:true}));
 b.onResolve({filter:/^framer-motion$/},()=>({path:'motion',namespace:'fixture'}));
 b.onLoad({filter:/.*/,namespace:'fixture'},()=>({loader:'js',contents:`import React from 'react';const cache={};export const motion=new Proxy({}, {get:(_,tag)=>cache[tag]??=(React.forwardRef(({children,initial,animate,exit,transition,whileInView,viewport,...props},ref)=>React.createElement(tag,{...props,ref},children)))});export const AnimatePresence=({children})=>children;`}));
 b.onLoad({filter:/ui[\\/]checkbox\.tsx$/},()=>({loader:'jsx',contents:`import React from 'react';export const Checkbox=({onCheckedChange,checked,...props})=><input type="checkbox" checked={checked} onChange={e=>onCheckedChange(e.target.checked)} {...props}/>;`}));
 }}]});
 const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {MemoryRouter}=await import('react-router-dom');
 const {createRoot}=await import('react-dom/client');const root=createRoot(w.document.getElementById('root'));
 const click=async text=>act(()=>[...w.document.querySelectorAll('button')].find(b=>b.textContent.trim()===text).click());
 const fill=async(id,value)=>act(()=>{const el=w.document.getElementById(id);const proto=el.tagName==='SELECT'?w.HTMLSelectElement.prototype:el.tagName==='TEXTAREA'?w.HTMLTextAreaElement.prototype:w.HTMLInputElement.prototype;Object.getOwnPropertyDescriptor(proto,'value').set.call(el,value);el.dispatchEvent(new w.Event(el.tagName==='SELECT'?'change':'input',{bubbles:true}));});
 try{
 await act(()=>root.render(React.createElement(MemoryRouter,{future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(module.exports.Contact))));
 await click('Próximo');assert.equal(w.document.querySelectorAll('[aria-invalid=true]').length,3);assert.equal(module.exports.calls.length,0);
 await fill('name','Teste Fictício');await fill('phone','31900000000');await fill('email','test@example.com');await click('Próximo');
 await fill('projectType','Site Institucional');await fill('message','<b>Projeto fictício</b> para teste local.');await click('Próximo');
 assert.match(w.document.querySelector('.contact-review-message').textContent,/Projeto fictício/);
 await click('Editar projeto');assert.equal(w.document.getElementById('message').value,'<b>Projeto fictício</b> para teste local.');await click('Próximo');
 await act(async()=>{w.document.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await Promise.resolve();});assert.equal(module.exports.calls.length,0);
 await act(()=>{w.document.getElementById('confirmacao').click();w.document.getElementById('politica').click();});
 await act(async()=>{w.document.querySelector('form').dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));await Promise.resolve();});
 assert.equal(module.exports.calls.length,1);const [data,message]=module.exports.calls[0];assert.equal(data.email,'test@example.com');assert.equal(data.source,'multi_step_form');assert.equal(data.message,'Projeto fictício para teste local.');assert.match(message,/Projeto fictício/);assert.doesNotMatch(message,/<b>/);assert.equal(w.document.getElementById('name').value,'');
 }finally{await act(()=>root.unmount());w.close();}
});

test('contact is lazy routed with legacy hash redirect; homepage only offers a callout',()=>{
 const router=fs.readFileSync('src/app/Router.tsx','utf8');assert.match(router,/path="\/contact" element={<ContactPage/);assert.match(router,/location\.hash === "#contact"/);assert.match(router,/Navigate to={`\/contact\$\{location.search\}`}/);
 const home=fs.readFileSync('src/pages/Home.tsx','utf8');assert.match(home,/<ContactCallout \/>/);assert.doesNotMatch(home,/import\("@\/components\/ContactMultiStep"\)/);
 assert.match(fs.readFileSync('src/components/ContactMultiStep.tsx','utf8'),/contact-background\.webp/);
});
