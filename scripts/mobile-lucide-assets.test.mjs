import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createRequire} from 'node:module';
import {build} from 'esbuild';
import {icons} from 'lucide-react';
import React, {act} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {JSDOM} from 'jsdom';

test('individual Lucide assets preserve the complete installed catalogue and exact paths',()=>{
 const catalog=JSON.parse(fs.readFileSync('src/data/lucideIconAssets.json','utf8'));
 assert.equal(catalog.version,JSON.parse(fs.readFileSync('node_modules/lucide-react/package.json','utf8')).version);
 assert.deepEqual(catalog.names,Object.fromEntries(Object.entries(icons).map(([name,Icon])=>[name,Icon.displayName||name])));
 for(const name of Object.values(catalog.names))assert.ok(fs.existsSync(`dist/lucide-icons/${catalog.version}/${name}.svg`),name);
 for(const name of ['Code','ArrowRight','Globe','Github','Rocket']){
  const original=renderToStaticMarkup(React.createElement(icons[name])).match(/<svg\b[^>]*>([\s\S]*)<\/svg>/)[1];
  const asset=fs.readFileSync(`dist/lucide-icons/${catalog.version}/${catalog.names[name]}.svg`,'utf8');
  assert.equal(asset.match(/<g id="icon">([\s\S]*)<\/g>/)[1],original);
 }
 assert.ok(!fs.readFileSync('dist/sw.js','utf8').includes('lucide-icons/'),'Do not download every unused SVG during installation');
});

test('SVG resolver preserves icon props and child content, with a visible offline fallback',async()=>{
 const compiled=await build({entryPoints:['src/components/ui/MobileLucideIconRender.tsx'],bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')}});
 const module={exports:{}};
 new Function('module','exports','require',compiled.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
 const {resolveLucideIcon}=module.exports;
 const Icon=resolveLucideIcon('arrow-right');
 assert.equal(Icon,resolveLucideIcon('ArrowRight'),'Stable component identity');
 const props={size:36,absoluteStrokeWidth:true,strokeWidth:3,color:'#abc123',className:'custom','aria-label':'Next',children:React.createElement('title',{key:'title'},'Next')};
 const attributes=svg=>Object.fromEntries(svg.getAttributeNames().map(name=>[name,svg.getAttribute(name)]));
 const expected=new JSDOM(renderToStaticMarkup(React.createElement(icons.ArrowRight,props)));
 const actual=new JSDOM(renderToStaticMarkup(React.createElement(Icon,props)));
 assert.deepEqual(attributes(actual.window.document.querySelector('svg')),attributes(expected.window.document.querySelector('svg')));
 assert.equal(actual.window.document.querySelector('svg title').textContent,'Next');
 assert.match(actual.window.document.querySelector('use').getAttribute('href'),/\/ArrowRight\.svg#icon$/);
 const dom=new JSDOM('<div id="test"></div>');
 for(const key of ['window','document','navigator','HTMLElement','Element','Event'])Object.defineProperty(globalThis,key,{configurable:true,value:dom.window[key]});
 globalThis.IS_REACT_ACT_ENVIRONMENT=true;
 const {createRoot}=await import('react-dom/client');
 const root=createRoot(dom.window.document.getElementById('test'));
 try{
  await act(async()=>root.render(React.createElement(Icon,props)));
  await act(async()=>dom.window.document.querySelector('img').dispatchEvent(new dom.window.Event('error')));
  assert.equal(dom.window.document.querySelector('use'),null);
  const fallback=new JSDOM(renderToStaticMarkup(React.createElement(icons.Code,props)));
  assert.equal(dom.window.document.querySelector('svg').innerHTML,fallback.window.document.querySelector('svg').innerHTML,'Fallback draws the existing Code icon');
  fallback.window.close();
  assert.equal(dom.window.document.querySelector('svg').getAttribute('stroke'),'#abc123');
  await act(async()=>root.unmount());
 }finally{dom.window.close();actual.window.close();expected.window.close();}
});
