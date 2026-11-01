import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const root = fileURLToPath(new URL('../', import.meta.url));
const modules = new Map();
function load(relative) {
  const file = path.resolve(root, relative.endsWith('.ts') ? relative : relative + '.ts');
  if (modules.has(file)) return modules.get(file);
  const exports = {};
  const code = ts.transpileModule(fs.readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  modules.set(file, exports);
  new Function('exports', 'require', code)(exports, name => load(path.relative(root, path.resolve(path.dirname(file), name))));
  return exports;
}
const { CASE_STUDIES } = load('src/data/caseStudies');
const { resolveCaseStudy, caseFingerprint } = load('src/i18n/editorial/cases');
const { caseRevisions } = load('src/i18n/editorial/caseRevisions');
const { resolveBlogPost } = load('src/i18n/editorial/blog');
const { blogHeadlines } = load('src/i18n/editorial/blogHeadlines');
const { resolveProjectText } = load('src/i18n/editorial/project');
const blogs = JSON.parse(fs.readFileSync(new URL('./fixtures/public-blog-source.json', import.meta.url)));
const projects = JSON.parse(fs.readFileSync(new URL('./fixtures/public-project-text.json', import.meta.url)));
const codeBlocks = value => value.match(/^```[^\n]*\n[\s\S]*?^```[ \t]*$/gm) ?? [];

test('all ten cases resolve complete EN/ES text without changing structural data', () => {
  assert.equal(CASE_STUDIES.length, 10);
  for (const source of CASE_STUDIES) {
    assert.equal(caseFingerprint(source), caseRevisions[source.slug]);
    const before = JSON.stringify(source);
    for (const language of ['en', 'es']) {
      const result = resolveCaseStudy(source, language);
      assert.equal(result.language, language, source.slug);
      for (const key of ['title', 'industry', 'summary', 'problem', 'solution', 'outcome']) assert.ok(result.caseStudy[key].trim());
      for (const key of ['slug', 'liveUrl', 'publishedAt', 'imageHint', 'technologies']) assert.deepEqual(result.caseStudy[key], source[key]);
      assert.equal(result.caseStudy.metrics.length, source.metrics.length);
      assert.equal(result.caseStudy.services.length, source.services.length);
    }
    assert.equal(JSON.stringify(source), before);
    const changed = { ...source, outcome: source.outcome + ' edited' };
    assert.equal(resolveCaseStudy(changed, 'en').caseStudy, changed);
    assert.equal(resolveCaseStudy(changed, 'en').language, 'pt');
  }
});

test('all twelve published blogs resolve both languages and retain every code example verbatim', () => {
  assert.equal(blogs.length, 12);
  for (const source of blogs) {
    const before = JSON.stringify(source);
    for (const language of ['en', 'es']) {
      const result = resolveBlogPost(source, language);
      assert.equal(result.language, language, source.slug);
      assert.ok(result.post.content.length > 700, source.slug);
      assert.notEqual(result.post.title, source.title);
      assert.deepEqual(codeBlocks(result.post.content), codeBlocks(source.content), source.slug);
      assert.doesNotMatch(result.post.content, /\{\{code:/);
      assert.equal(blogHeadlines[source.title][language === 'en' ? 0 : 1], result.post.title);
      assert.equal(blogHeadlines[source.excerpt][language === 'en' ? 0 : 1], result.post.excerpt);
      assert.equal(result.post.slug, source.slug);
    }
    assert.equal(JSON.stringify(source), before);
  }
});

test('changed or unknown blog content falls back as a whole, including metadata fields', () => {
  for (const field of ['title', 'excerpt', 'content', 'slug']) {
    const source = { ...blogs[0], [field]: blogs[0][field] + ' edited' };
    for (const lang of ['en', 'es']) {
      assert.equal(resolveBlogPost(source, lang).post, source);
      assert.equal(resolveBlogPost(source, lang).language, 'pt');
    }
  }
});

test('all current public project descriptions are covered with atomic fallback for unknown text', () => {
  assert.equal(projects.length, 26);
  for (const row of projects) {
    const source = { slug: row.slug, description: row.description, longDescription: row.long_description || undefined };
    for (const language of ['en', 'es']) {
      const result = resolveProjectText(source, language);
      assert.equal(result.language, language, row.slug);
      assert.equal(result.project.slug, source.slug);
      assert.ok(result.project.description);
      if (source.longDescription) assert.ok(result.project.longDescription);
    }
    const changed = { ...source, longDescription: 'A newly authored description' };
    assert.equal(resolveProjectText(changed, 'es').project, changed);
    assert.equal(resolveProjectText(changed, 'es').language, 'pt');
  }
});

test('blog renderer supports real tables and task lists while leaving raw HTML and script URLs inert', () => {
  const markdown = '| Name | Value |\n|---|---|\n| A | B |\n\n- [ ] Review\n\n<script>alert(1)</script>\n\n[unsafe](javascript:alert(1))';
  const html = renderToStaticMarkup(React.createElement(ReactMarkdown, { remarkPlugins: [remarkGfm], children: markdown }));
  assert.match(html, /<table>/);
  assert.match(html, /type="checkbox"/);
  assert.match(html, /disabled/);
  assert.doesNotMatch(html, /<script>|href="javascript:/);
});

test('blog route clears stale state, ignores superseded responses, guards short progress and normalizes legacy contact links', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/BlogPost.tsx'), 'utf8');
  assert.match(source, /setPost\(null\)/);
  assert.match(source, /setRelatedPosts\(\[\]\)/);
  assert.match(source, /if \(cancelled\) return/);
  assert.match(source, /return \(\) => \{ cancelled = true; \}/);
  assert.match(source, /total > 0/);
  assert.match(source, /post\.slug !== slug/);
  assert.match(source, /href === "\/#contact" \? "\/contact"/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML|copy\(displayPost\.(title|content)\)/);
});

test('public case outcomes exclude unverified metrics while preserving original records and reviewed languages',()=>{
 const {resolvePublishedCase}=load('src/i18n/editorial/publishedCases');
 for(const source of CASE_STUDIES){
  const before=JSON.stringify(source);
  for(const lang of ['pt','en','es']){const result=resolvePublishedCase(source,lang);assert.equal(result.language,lang);assert.deepEqual(result.caseStudy.metrics,[]);assert.ok(result.caseStudy.outcome.length>30);assert.doesNotMatch(result.caseStudy.outcome,/\d+%|99\.95|zero incident/i);assert.equal(result.caseStudy.slug,source.slug);}
  assert.equal(JSON.stringify(source),before);
 }
 const source=CASE_STUDIES[0];const proof={sourceUrl:'https://example.com/measured-report',period:'2026-10',sourceRevision:caseFingerprint(source),metricLabels:[source.metrics[0].label]};
 assert.equal(resolvePublishedCase(source,'en',proof).caseStudy.metrics.length,1);
 assert.equal(resolvePublishedCase(source,'en',{...proof,sourceRevision:'outdated'}).caseStudy.metrics.length,0);
 assert.equal(resolvePublishedCase(source,'en',{...proof,sourceUrl:'javascript:alert(1)'}).caseStudy.metrics.length,0);
});

test('sitemap contains the reviewed published catalogue once and excludes stale sample blog links',()=>{
 const xml=fs.readFileSync('public/sitemap.xml','utf8');const urls=[...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1]);assert.equal(new Set(urls).size,urls.length);
 const {GEO_ARTICLES,GEO_PROGRAMMATIC}=load('src/data/geoContent');
 const paths=['/contact','/integracoes',...CASE_STUDIES.map(c=>'/cases/'+c.slug),...blogs.map(b=>'/blog/'+b.slug),...projects.map(p=>'/projects/'+p.slug),...GEO_ARTICLES.map(a=>`/${a.category==='answer'?'answers':'knowledge-base'}/${a.slug}`),...GEO_PROGRAMMATIC.services.map(s=>'/solucoes/'+s.slug),...GEO_PROGRAMMATIC.cities.map(c=>'/local/'+c.slug)];
 for(const route of paths)assert.ok(urls.includes('https://www.sevendevx.com'+route),route);
 for(const url of urls){assert.equal(new URL(url).origin,'https://www.sevendevx.com');assert.doesNotMatch(new URL(url).pathname,/^\/(admin|auth|profile)(\/|$)/);if(url.includes('/blog/'))assert.ok(blogs.some(b=>url.endsWith('/blog/'+b.slug)),url);}
});

test('all case pages render a localized contact action, one main and the preserved scope in three languages',async()=>{
 const {build}=await import('esbuild');const {createRequire}=await import('node:module');const result=await build({stdin:{contents:`export {CaseStudyPage} from './src/pages/geo/CaseStudies';export {locale} from './src/i18n/LanguageContext';`,resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')},plugins:[{name:'case-fixture',setup(b){
 b.onLoad({filter:/components[\\/](Header|Footer)\.tsx$/},()=>({loader:'js',contents:'export default function Stub(){return null}'}));
 b.onLoad({filter:/pages[\\/]NotFound\.tsx$/},()=>({loader:'jsx',contents:'export default function NotFound(){return <h1>NOT_FOUND</h1>}'}));
 b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"export const locale={value:'pt'};export const useLanguage=()=>({language:locale.value});"}));
 }}]});const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));const {MemoryRouter,Routes,Route}=await import('react-router-dom');
 for(const language of ['pt','en','es']){module.exports.locale.value=language;for(const source of CASE_STUDIES){const element=React.createElement(MemoryRouter,{initialEntries:['/cases/'+source.slug],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(Routes,null,React.createElement(Route,{path:'/cases/:slug',element:React.createElement(module.exports.CaseStudyPage)})));const html=renderToStaticMarkup(element);assert.equal((html.match(/<main\b/g)||[]).length,1);assert.equal((html.match(/<h1\b/g)||[]).length,1);assert.match(html,/href="\/contact"/);assert.match(html,/id="main-content"/);assert.ok(html.includes(source.technologies[0]));assert.doesNotMatch(html,/NOT_FOUND/);}}
});

test('shared SEO metadata uses real image assets and separates page canonical from organization identity',async()=>{
 const {build}=await import('esbuild');const {createRequire}=await import('node:module');const result=await build({stdin:{contents:`export {default as SEOHead} from './src/components/SEOHead';`,resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')},plugins:[{name:'seo-fixture',setup(b){b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"export const useLanguage=()=>({language:'en'});"}));}}]});const module={exports:{}};const require=createRequire(import.meta.url);new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,require);const {MemoryRouter}=await import('react-router-dom');const {Helmet}=require('react-helmet');
 for(const [image,mime] of [['/logo-512.png','image/png'],['https://example.com/photo.jpg?v=1','image/jpeg']]){
 renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/services'],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(module.exports.SEOHead,{image})));const head=Helmet.renderStatic();assert.match(head.meta.toString(),new RegExp(mime));assert.ok(head.link.toString().includes('https://www.sevendevx.com/services'));const schemas=[...head.script.toString().matchAll(/<script[^>]*>(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));assert.equal(schemas.find(x=>x['@type']==='Organization').url,'https://www.sevendevx.com');assert.equal(schemas.find(x=>x['@type']==='WebSite').url,'https://www.sevendevx.com');assert.equal(schemas.find(x=>x['@type']==='WebPage').url,'https://www.sevendevx.com/services');
 }
 assert.ok(fs.existsSync('public/logo-512.png'));
 const config=JSON.parse(fs.readFileSync('vercel.json','utf8'));for(const source of ['/home','/index.html']){const redirect=config.redirects.find(r=>r.source===source);assert.equal(redirect.destination,'https://www.sevendevx.com/');assert.equal(redirect.permanent,true);}
});

test('every served city is described as a service area, never as an invented physical branch',async()=>{
 const {build}=await import('esbuild');const {createRequire}=await import('node:module');const {GEO_PROGRAMMATIC}=load('src/data/geoContent');
 const result=await build({stdin:{contents:`export {default as LocalPage} from './src/pages/geo/LocalSeoPage';export {locale} from './src/i18n/LanguageContext';`,resolveDir:root,loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.join(root,'src')},plugins:[{name:'local-service-fixture',setup(b){
 b.onLoad({filter:/components[\\/](Header|Footer)\.tsx$/},()=>({loader:'js',contents:'export default function Stub(){return null}'}));
 b.onLoad({filter:/pages[\\/]NotFound\.tsx$/},()=>({loader:'jsx',contents:'export default function NotFound(){return <h1>NOT_FOUND</h1>}'}));
 b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"export const locale={value:'pt'};export const useLanguage=()=>({language:locale.value});"}));
 }}]});const module={exports:{}};const require=createRequire(import.meta.url);new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,require);const {MemoryRouter,Routes,Route}=await import('react-router-dom');const {Helmet}=require('react-helmet');
 for(const language of ['pt','en','es']){module.exports.locale.value=language;for(const city of GEO_PROGRAMMATIC.cities){const html=renderToStaticMarkup(React.createElement(MemoryRouter,{initialEntries:['/local/'+city.slug],future:{v7_startTransition:true,v7_relativeSplatPath:true}},React.createElement(Routes,null,React.createElement(Route,{path:'/local/:city',element:React.createElement(module.exports.LocalPage)}))));const head=Helmet.renderStatic();const schemas=[...head.script.toString().matchAll(/<script[^>]*>(.*?)<\/script>/g)].map(m=>JSON.parse(m[1]));const service=schemas.find(s=>s['@type']==='Service');assert.ok(service,city.slug);assert.equal(service.areaServed.name,city.name);assert.equal(service.areaServed.containedInPlace.name,city.state);assert.equal(service.provider.name,'SevenDevX');assert.equal(service.provider.url,'https://www.sevendevx.com');assert.equal(service.provider.telephone,'+55-31-98474-0625');assert.equal(service.address,undefined);assert.equal(service.provider.address,undefined);assert.equal(service.priceRange,undefined);assert.doesNotMatch(service.description,/Lighthouse 95/);assert.ok(head.link.toString().includes('/local/'+city.slug));assert.doesNotMatch(html,/NOT_FOUND/);}}
});
