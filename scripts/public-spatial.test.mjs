import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React,{act} from 'react';

async function fixture(component,{reduced=true,saveData=false,short=false}={}){
 const compiled=await build({entryPoints:[`src/components/${component}.tsx`],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},loader:{'.css':'empty','.svg':'dataurl'},plugins:[{name:'test-boundaries',setup(b){
  b.onLoad({filter:/publicExperienceCopy\.ts$/},()=>({loader:'js',contents:`export function useExperienceCopy(){return {gallery:'Project gallery',projects:'PROJECTS',empty:'No projects',compact:'Compact view',spatial:'Back to 3D gallery',previous:'Previous project',next:'Next project',select:'Select project',selectPrefix:'Select',help:'Help',universeLabel:'Universe',skip:'Skip experience',explore:'Explore projects',signature:'SevenDevX',titleOne:'Universe',titleTwo:'Projects',staticNotice:'Static presentation'};}`}));
  b.onLoad({filter:/usePublicCopy\.ts$/},()=>({loader:'js',contents:'export const usePublicCopy=()=>({copy:value=>value});'}));
  b.onResolve({filter:/^react(?:\/.*)?$/},args=>({path:args.path,external:true}));
  b.onResolve({filter:/^framer-motion$/},()=>({path:'motion-boundary',namespace:'test-motion'}));
  b.onLoad({filter:/.*/,namespace:'test-motion'},()=>({loader:'jsx',contents:`import React from 'react';const cache={};export const motion=new Proxy({}, {get(_,tag){return cache[tag] ||= React.forwardRef(({children,initial,animate,exit,variants,custom,transition,...props},ref)=>React.createElement(tag,{...props,ref},children));}});export const AnimatePresence=({children})=>children;`}));
 }}]});
 const module={exports:{}};new Function('module','exports','require',compiled.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const dom=new JSDOM('<div id="root"></div>',{url:'https://www.sevendevx.com/projects-hub',pretendToBeVisual:true});const w=dom.window;
 for(const key of ['window','document','navigator','HTMLElement','SVGElement','Element','Event','MutationObserver','Image'])Object.defineProperty(globalThis,key,{configurable:true,value:w[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 w.matchMedia=query=>({matches:(query.includes('reduced-motion')&&reduced)||(query==='(max-height: 600px)'&&short),addEventListener(){},removeEventListener(){}});
 globalThis.matchMedia=w.matchMedia;globalThis.innerWidth=1280;globalThis.innerHeight=900;globalThis.scrollY=0;
 globalThis.requestAnimationFrame=w.requestAnimationFrame.bind(w);globalThis.cancelAnimationFrame=w.cancelAnimationFrame.bind(w);
 globalThis.IntersectionObserver=class{observe(){}disconnect(){}};
 Object.defineProperty(w.navigator,'connection',{value:Object.assign(new w.EventTarget(),{saveData,effectiveType:'4g'})});
 w.scrollTo=value=>{w.lastScroll=value;};
 const {createRoot}=await import('react-dom/client');const root=createRoot(w.document.getElementById('root'));
 return {w,async render(props){await act(async()=>root.render(React.createElement(module.exports.default,props)));},async change(callback){await act(async()=>callback());},async close(){await act(async()=>root.unmount());dom.window.close();}};
}

test('gallery preserves all choices, card actions, bounds, keyboard navigation and compact view',async()=>{
 const f=await fixture('PublicSpatialCatalog');const {w}=f;
 const props=n=>({items:Array.from({length:n},(_,i)=>({title:'Project '+i,image:'/p.webp'})),children:Array.from({length:n},(_,i)=>React.createElement('article',{key:i},React.createElement('h3',null,'Project '+i),React.createElement('button',{onClick:()=>w.opened=i},'Details')))});
 try{
  await f.render(props(26));assert.equal(w.document.querySelectorAll('option').length,26);
  const next=()=>w.document.querySelector('button[aria-label="Next project"]');const previous=()=>w.document.querySelector('button[aria-label="Previous project"]');
  assert.equal(previous().disabled,true);await f.change(()=>next().click());assert.equal(w.document.querySelector('.spatial-current h3').textContent,'Project 1');
  await f.change(()=>w.document.querySelector('.spatial-current button').click());assert.equal(w.opened,1);
  await f.change(()=>{const select=w.document.querySelector('select');select.value='25';select.dispatchEvent(new w.Event('change',{bubbles:true}));});
  assert.equal(next().disabled,true);assert.equal(w.document.querySelector('.spatial-current h3').textContent,'Project 25');
  await f.change(()=>w.document.querySelector('.spatial-catalog').dispatchEvent(new w.KeyboardEvent('keydown',{key:'ArrowLeft',bubbles:true})));assert.equal(w.document.querySelector('select').value,'24');
  await f.change(()=>w.document.querySelector('.spatial-toolbar>button').click());assert.equal(w.document.querySelectorAll('.spatial-compact article').length,26);
  await f.render(props(3));assert.equal(w.document.querySelector('.spatial-toolbar span').textContent,'01 / 03');
  await f.render(props(0));assert.equal(w.document.querySelector('select'),null);assert.match(w.document.body.textContent,/No projects/);
 }finally{await f.close();}
});

for(const [name,preference] of [['reduced motion',{reduced:true}],['data saver',{reduced:false,saveData:true}],['short landscape viewport',{reduced:false,short:true}]]){
 test(`${name} avoids allocating mosaic and image planes and skips directly to catalogue`,async()=>{
  const f=await fixture('PublicProjectUniverse',preference);const {w}=f;
  try{
   const target=w.document.createElement('section');target.className='spatial-catalog';target.tabIndex=-1;w.document.body.append(target);
   await f.render({projects:[{title:'Real project',image:'/project.webp'}]});
   assert.equal(w.document.querySelector('.universe-space'),null);assert.equal(w.document.querySelectorAll('.universe-tiles img').length,0);assert.ok(w.document.querySelector('.universe-reduced img'));
   await f.change(()=>[...w.document.querySelectorAll('button')].find(b=>b.textContent.includes('Explore projects')).click());
   assert.equal(w.document.activeElement,target);assert.equal(w.lastScroll.behavior,'instant');
  }finally{await f.close();}
 });
}

test('site creation retains sticky-compatible overflow and avoids nested entrance animations',()=>{
 const source=fs.readFileSync('src/pages/geo/CriacaoSitesProfissionais.tsx','utf8');
 assert.match(source,/<main[^>]+overflow-x-clip/);assert.doesNotMatch(source,/<main[^>]+overflow-x-hidden/);
 assert.match(source,/initial=\{false\} animate=\{\{ opacity: 1, y: 0 \}\}/);
});