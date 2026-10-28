import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import * as icons from 'react-icons/si';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import vm from 'node:vm';
const read=file=>fs.readFileSync(file,'utf8');

test('initial styles preserve the emitted CSS exactly without a blocking stylesheet request',()=>{
 const html=read('dist/index.html');
 const styles=[...html.matchAll(/<style data-initial-styles="([^\"]+)">([\s\S]*?)<\/style>/g)];
 assert.ok(styles.length>0);
 for(const [,file,css] of styles) assert.equal(css,read('dist/'+file));
 assert.doesNotMatch(html,/<link\b[^>]*rel="stylesheet"/);
});

test('built first paint is restricted to home, matches locale selection and never replaces private routes',()=>{
 const html=read('dist/index.html');
 const match=html.match(/<template id="public-first-paint">([\s\S]*?)<\/template><script>([\s\S]*?)<\/script>/);
 assert.ok(match,'Hero generated during the build');
 assert.equal((match[1].match(/<h1\b/g)||[]).length,1);
 assert.match(match[1],/<a href="\/#contact" data-initial-contact/);
 assert.doesNotMatch(match[1],/type="button"/);
 const image=match[1].match(/src="(\/assets\/hero-tech-workspace[^\"]+\.webp)"/);
 assert.ok(image);assert.ok(fs.existsSync('dist'+image[1]));
 const languages=JSON.parse(match[2].match(/var languages=([^\n]+),saved;/)[1]);
 for(const [pathname,saved,browser,expected] of [
  ['/','pt','en-US','pt'],['/','en','pt-BR','en'],['/','es','en-US','es'],
  ['/',null,'es-MX','es'],['/','invalid','fr-FR','pt'],
  ['/admin',null,'en-US',null],['/auth',null,'en-US',null],['/services',null,'en-US',null],
 ]){
  const nodes=['title','subtitle','cta'].map(key=>({textContent:languages.pt[key]}));
  let appended=false,removed=false,index=0;
  const fragment={querySelector:()=>({setAttribute(){},addEventListener(){}})};
  const root={appendChild(value){assert.equal(value,fragment);appended=true;}};
  const template={content:fragment,remove(){removed=true;}};
  const document={documentElement:{},getElementById:id=>id==='root'?root:template,
   createTreeWalker:()=>({nextNode:()=>nodes[index++]||null})};
  vm.runInNewContext(match[2],{document,location:{pathname},navigator:{language:browser},
   localStorage:{getItem:()=>saved},NodeFilter:{SHOW_TEXT:4}});
  assert.equal(removed,true);assert.equal(appended,expected!==null,pathname);
  if(expected){assert.equal(document.documentElement.lang,expected==='pt'?'pt-BR':expected);
   assert.deepEqual(nodes.map(n=>n.textContent),['title','subtitle','cta'].map(key=>languages[expected][key]));}
 }
});

test('initial entry stays below its transfer-source budget and robots uses crawler-compatible directives',()=>{
 const scripts=[...read('dist/index.html').matchAll(/<script[^>]+src="(\/assets\/[^\"]+\.js)"/g)].map(m=>m[1]);
 assert.ok(scripts.length>0);
 for(const script of scripts) assert.ok(fs.statSync('dist'+script).size<200_000,script);
 for(const line of read('public/robots.txt').split(/\r?\n/).map(x=>x.trim()).filter(x=>x&&!x.startsWith('#'))) {
  assert.match(line,/^(User-agent|Allow|Disallow|Sitemap):/i,line);
 }
 assert.ok(read('index.html').includes('rel="ard"'), 'Discover resources through HTML without unsupported robots directives');
});

test('individual icon assets preserve the complete installed library without a client namespace import',()=>{
 const manifest=JSON.parse(read('src/data/techIconAssets.json'));
 assert.equal(manifest.version,JSON.parse(read('node_modules/react-icons/package.json')).version);
 assert.deepEqual(manifest.names,Object.keys(icons).filter(n=>/^Si[A-Za-z0-9]+$/.test(n)));
 assert.doesNotMatch(read('src/components/TechIconCDN.tsx'),/import \* as .*react-icons/);
 for(const name of ['SiReact','SiTypescript','SiPostgresql','SiSupabase']){
  const expected=renderToStaticMarkup(createElement(icons[name]));
  assert.equal(read(`dist/tech-icons/${manifest.version}/${name}.svg`),expected);
 }
 assert.ok(!read('dist/sw.js').includes('tech-icons/'), 'Do not precache thousands of unused icons');
});

test('agent discovery is actual JSON containing public documents, with no admin endpoint advertised',()=>{
 const legacy=JSON.parse(read('public/.well-known/ai-catalog.json'));
 assert.equal(legacy.specVersion,'1.0');assert.ok(legacy.entries.length>0);
 assert.deepEqual(JSON.parse(read('public/.well-known/ard.json')),legacy);
 for(const entry of legacy.entries){assert.match(entry.identifier,/^urn:air:sevendevx.com:/);assert.equal(entry.type,'text/plain');assert.equal(entry.url,'https://www.sevendevx.com/llms.txt');}
 assert.ok(read('index.html').includes('rel="ai-catalog"'));
 assert.deepEqual(JSON.parse(read('dist/.well-known/ai-catalog.json')),legacy);
});

test('hero content is visible immediately and optimized CMS covers preserve unknown future images',()=>{
 assert.ok(read('src/components/Hero.tsx').includes('initial={false}'));
 assert.doesNotMatch(read('src/components/Hero.tsx'),/initial=\{\{ opacity: 0, y: 30 \}\}/);
 const images=read('src/lib/optimizedServiceImages.ts');
 assert.ok(images.includes('images[source] || {src: source, srcSet: undefined}'));
 for(const width of [640,1024,1600])assert.ok(images.includes(`-${width}.webp`));
 assert.ok(read('src/components/ServicesPreview.tsx').includes('optimizedServiceImage(service.image)'));
});

test('admin realtime remains active while public project refresh avoids an unnecessary websocket',()=>{
 const projects=read('src/hooks/useProjects.ts');
 assert.match(projects,/useProjects = \(\) => \{\s+useProjectsRealtime\(false\)/);
 assert.match(projects,/useAllProjects = \(\) => \{\s+useProjectsRealtime\(\)/);
 assert.ok(projects.includes('refetchIntervalInBackground: false'));
 assert.ok(read('src/app/Providers.tsx').includes('ensureBrandingHydrated(isAdmin)'));
});
