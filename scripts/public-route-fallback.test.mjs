import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';
import React, {act, Suspense} from 'react';

test('pending mobile home route keeps first paint visible; desktop and other routes retain the loader',async()=>{
 const compiled=await build({stdin:{contents:`export {default as Fallback} from './src/components/PublicRouteFallback';
 export {LanguageSnapshotProvider} from './src/i18n/LanguageContext';export {translations} from './src/i18n/translations';`,resolveDir:process.cwd(),loader:'tsx'},
 bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},
 plugins:[{name:'logo',setup(b){b.onLoad({filter:/\.svg$/},()=>({loader:'js',contents:'export default "/logo.svg"'}));}}]});
 const module={exports:{}};
 new Function('module','exports','require',compiled.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {Fallback,LanguageSnapshotProvider,translations}=module.exports;
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const [width,pathname,painted,overlay] of [[390,'/',true,false],[1280,'/',true,true],[390,'/admin',false,true],[390,'/',false,true]]){
  const dom=new JSDOM(html,{url:'https://www.sevendevx.com'+pathname,runScripts:'outside-only',pretendToBeVisual:true});
  const {window}=dom;
  Object.defineProperty(window,'innerWidth',{value:width});
  window.eval(html.match(/<script data-public-first-paint-bootstrap>([\s\S]*?)<\/script>/)[1]);
  if(!painted)window.document.getElementById('public-first-paint-shell')?.remove();
  for(const key of ['window','document','navigator','HTMLElement','SVGElement','Element','Event','MutationObserver'])Object.defineProperty(globalThis,key,{configurable:true,value:window[key]});
  globalThis.IS_REACT_ACT_ENVIRONMENT=true;
  window.matchMedia=()=>({matches:false,addListener(){},removeListener(){},addEventListener(){},removeEventListener(){}});
  window.HTMLCanvasElement.prototype.getContext=()=>null;
  globalThis.requestAnimationFrame=window.requestAnimationFrame.bind(window);
  globalThis.cancelAnimationFrame=window.cancelAnimationFrame.bind(window);
  const {createRoot}=await import('react-dom/client');
  const mount=window.document.createElement('div');window.document.body.append(mount);
  const root=createRoot(mount);
  const originalTitle=window.document.querySelector('h1');
  let release,ready=false;
  const pending=new Promise(resolve=>{release=resolve;});
  function Route(){if(!ready)throw pending;return React.createElement('button',null,'Route ready');}
  await act(async()=>root.render(React.createElement(LanguageSnapshotProvider,{value:{language:'en',t:translations.en,setLanguage(){}}},
   React.createElement(Suspense,{fallback:React.createElement(Fallback,{pathname})},React.createElement(Route)))));
  assert.equal(!!mount.querySelector('canvas'),overlay,`${width} ${pathname} ${painted}`);
  if(!overlay){assert.equal(mount.querySelector('[role=status]').className,'sr-only');assert.equal(window.document.querySelector('h1'),originalTitle);}
  ready=true;await act(async()=>{release();await pending;});
  assert.equal(mount.querySelector('button').textContent,'Route ready');
  assert.equal(mount.querySelector('canvas'),null);
  await act(async()=>root.unmount());dom.window.close();
 }
});

test('legacy PWA entry aliases keep query and anchor while leaving admin and valid public routes untouched',async()=>{
 const result=await build({entryPoints:['src/utils/legacyPublicEntry.ts'],bundle:true,write:false,platform:'node',format:'cjs'});const module={exports:{}};new Function('module','exports',result.outputFiles[0].text)(module,module.exports);const {legacyPublicEntry}=module.exports;
 for(const pathname of ['/index.html','/home']){
  assert.equal(legacyPublicEntry({pathname}),'/');
  assert.equal(legacyPublicEntry({pathname,search:'?utm_source=referral&lang=es',hash:'#projects'}),'/?utm_source=referral&lang=es#projects');
  assert.equal(legacyPublicEntry({pathname,search:'?from=old',hash:'#contact'}),'/contact?from=old');
 }
 for(const pathname of ['/','/contact','/services','/admin','/admin/index.html','/index.html/unknown'])assert.equal(legacyPublicEntry({pathname}),null);
 const router=fs.readFileSync('src/app/Router.tsx','utf8');assert.ok(router.includes('legacyPublicEntry(location)'));assert.ok(router.includes('<Navigate to={legacyEntry} replace />'));
});
