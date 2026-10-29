import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {build} from 'esbuild';
import {JSDOM} from 'jsdom';

test('mobile home paints before app evaluation; desktop and other entries start immediately',async()=>{
 const compiled=await build({entryPoints:['src/main.tsx'],bundle:true,write:false,format:'iife',platform:'browser',
  plugins:[{name:'test-boundaries',setup(b){
   b.onLoad({filter:/mountApp\.tsx$/},()=>({loader:'js',contents:`const button=document.createElement('button');button.id='app-ready';button.textContent='Application ready';(document.getElementById('public-app-root')||document.getElementById('root')).append(button);`}));
   b.onLoad({filter:/\.css$/},()=>({loader:'js',contents:''}));
  }}]});
 const html=fs.readFileSync('dist/index.html','utf8');
 for(const [width,pathname,painted,deferred] of [[390,'/',true,true],[1280,'/',true,false],[390,'/admin',false,false],[390,'/',false,false]]){
  const dom=new JSDOM(html,{url:'https://www.sevendevx.com'+pathname,runScripts:'outside-only'});
  const {window}=dom;Object.defineProperty(window,'innerWidth',{value:width});
  window.eval(html.match(/<script data-public-first-paint-bootstrap>([\s\S]*?)<\/script>/)[1]);
  if(!painted)window.document.getElementById('public-first-paint-shell')?.remove();
  const title=window.document.querySelector('h1');const frames=[];
  const registrations=[];
  Object.defineProperty(window.navigator,'serviceWorker',{value:{register:async(...args)=>{registrations.push(args);return {};}}});
  window.requestAnimationFrame=callback=>{frames.push(callback);return frames.length;};
  window.eval(compiled.outputFiles[0].text);
  window.eval(fs.readFileSync('public/registerSW.js','utf8'));
  window.dispatchEvent(new window.Event('load'));
  await new Promise(resolve=>setImmediate(resolve));
  assert.equal(!!window.document.getElementById('app-ready'),!deferred,`${width} ${pathname} ${painted}`);
  if(deferred){
   assert.equal(registrations.length,0,'Do not start precaching before essential app modules');
   assert.equal(window.document.querySelector('h1'),title);
   assert.equal(frames.length,1);frames.shift()(0);
   await new Promise(resolve=>setImmediate(resolve));
   assert.equal(window.document.getElementById('app-ready'),null,'First frame remains available for real content');
   assert.equal(frames.length,1);frames.shift()(16);
   await new Promise(resolve=>setImmediate(resolve));
   assert.ok(window.document.getElementById('app-ready'));
   assert.equal(window.document.querySelector('h1'),title);
  }else assert.equal(frames.length,0);
  assert.deepEqual(JSON.parse(JSON.stringify(registrations)),[['/sw.js',{scope:'/'}]],'Keep one registration after application startup');
  dom.window.close();
 }
});

test('initial built entry has no static dependency on the full application',()=>{
 const html=fs.readFileSync('dist/index.html','utf8');
 const entry=html.match(/<script[^>]+src="(\/assets\/[^\"]+\.js)"/)[1];
 const seen=new Set();
 function visit(file){if(seen.has(file))return;seen.add(file);const source=fs.readFileSync(file,'utf8');
  for(const match of source.matchAll(/(?:from|import)\s*["'](\.\/[^"']+\.js)["']/g))visit(path.resolve(path.dirname(file),match[1]));}
 visit(path.resolve('dist'+entry));
 const bytes=[...seen].reduce((sum,file)=>sum+fs.statSync(file).size,0);
 assert.ok(bytes<25000,`Initial static dependency closure: ${bytes} bytes`);
 assert.match(fs.readFileSync('dist/sw.js','utf8'),/mountApp-[A-Za-z0-9_-]+\.js/,'Keep the deferred application module in the PWA offline cache');
});

test('PWA helper stays compatible with an older cached application entry',async()=>{
 const dom=new JSDOM('<!doctype html><body></body>',{url:'https://www.sevendevx.com/',runScripts:'outside-only'});
 const calls=[];
 Object.defineProperty(dom.window.navigator,'serviceWorker',{value:{register:async(...args)=>{calls.push(args);return {};}}});
 dom.window.eval(fs.readFileSync('public/registerSW.js','utf8'));
 dom.window.dispatchEvent(new dom.window.Event('load'));
 await new Promise(resolve=>setImmediate(resolve));
 assert.deepEqual(JSON.parse(JSON.stringify(calls)),[['/sw.js',{scope:'/'}]]);
 dom.window.close();
});
