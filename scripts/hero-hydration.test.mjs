import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React, {act} from 'react';

test('home hydration preserves its first H1, survives StrictMode, changes language and cleans up',async()=>{
 const html=fs.readFileSync('dist/index.html','utf8');
 const dom=new JSDOM(html,{url:'https://www.sevendevx.com/',runScripts:'outside-only',pretendToBeVisual:true});
 const {window}=dom;
 Object.defineProperty(window,'innerWidth',{value:390});
 window.localStorage.setItem('sevendevx-language','en');
 window.eval(html.match(/<script data-public-first-paint-bootstrap>([\s\S]*?)<\/script>/)[1]);
 for(const key of ['window','document','navigator','HTMLElement','SVGElement','Element','Event','MutationObserver'])
  Object.defineProperty(globalThis,key,{configurable:true,value:window[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
 globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
 globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
 globalThis.IntersectionObserver=class{observe(){} disconnect(){}};
 const poster=html.match(/src="(\/assets\/hero-tech-workspace[^\"]+\.webp)"/)[1];
 const compiled=await build({stdin:{contents:`export {default as Hero} from './src/components/Hero';
  export {LanguageSnapshotProvider} from './src/i18n/LanguageContext';
  export {translations} from './src/i18n/translations';`,resolveDir:process.cwd(),loader:'tsx'},
  bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',
  alias:{'@':path.resolve('src')},plugins:[{name:'poster',setup(b){b.onLoad({filter:/hero-tech-workspace\.webp$/},()=>({contents:`export default ${JSON.stringify(poster)}`,loader:'js'}));b.onLoad({filter:/hero-tech-workspace-mobile\.webp$/},()=>({contents:'export default "/mobile-poster.webp"',loader:'js'}));}}]});
 const module={exports:{}};
 new Function('module','exports','require',compiled.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {Hero,LanguageSnapshotProvider,translations}=module.exports;
 const {createRoot}=await import('react-dom/client');
 const root=createRoot(window.document.getElementById('public-app-root'));
 const h1=window.document.querySelector('h1');
 const video=window.document.querySelector('video');
 assert.equal(video,null,'The existing image owns first paint; video mounts only when ready');
 const shellParent=window.document.getElementById('public-first-paint-shell').parentNode;
 const errors=[];
 const originalError=console.error;
 console.error=(...args)=>errors.push(args.join(' '));
 const view=language=>React.createElement(React.StrictMode,null,
  React.createElement(LanguageSnapshotProvider,{value:{language,t:translations[language],setLanguage(){}}},React.createElement(Hero)));
 try{
  await act(async()=>{root.render(view('en'));});
  assert.equal(window.document.querySelector('h1'),h1,'Hydration must keep the original DOM node');
  assert.equal(window.document.querySelector('video'),video,'Hydration must not mount video before its loading trigger');
  assert.equal(window.document.getElementById('public-first-paint-shell').parentNode,shellParent,'Hydration must not reparent the hero');
  assert.equal(window.document.querySelectorAll('h1').length,1);
  await act(async()=>{root.render(view('es'));});
  assert.equal(window.document.querySelector('h1'),h1,'Language changes update the same node');
  assert.equal(h1.textContent,translations.es.hero.title);
  let scrolled=false;
  const target=window.document.createElement('div');target.id='contact';target.scrollIntoView=()=>{scrolled=true;};window.document.body.append(target);
  await act(async()=>{window.document.querySelector('#public-first-paint-shell button').click();});
  assert.equal(scrolled,true,'Hydrated CTA reaches the contact form');
  await act(async()=>{root.unmount();});
  assert.equal(h1.isConnected,false);
  assert.equal(window.document.getElementById('public-first-paint-shell'),null);
  assert.deepEqual(errors,[],'No mismatch, early-render or nested-unmount warnings');
 }finally{console.error=originalError;dom.window.close();}
});
