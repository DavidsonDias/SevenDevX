import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';

const cache = new Map();
function load(name) {
  if (cache.has(name)) return cache.get(name);
  const code = ts.transpileModule(fs.readFileSync(new URL(`../src/i18n/${name}.ts`, import.meta.url), 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText;
  const exports = {};
  new Function('exports', 'require', code)(exports, path => load(path.replace('./', '')));
  cache.set(name, exports);
  return exports;
}
const { translatePublicText: copy, publicCopy } = load('publicCopy');
const { publicRouteCopy } = load('publicRouteCopy');
const { commercialCopy } = load('publicCommercialCopy');
const { projectCopy } = load('publicProjectCopy');

test('all supplemental public copy has nonempty English and Spanish versions', () => {
  for (const [pt, pair] of Object.entries({ ...publicCopy, ...commercialCopy, ...projectCopy, ...publicRouteCopy })) {
    assert.equal(pair.length, 2, pt);
    assert.ok(pair.every(text => typeof text === 'string' && text.trim()), pt);
    assert.equal(copy(pt, 'pt'), pt);
    assert.equal(copy(pt, 'en'), pair[0], pt);
    assert.equal(copy(pt, 'es'), pair[1], pt);
  }
});
test('existing typed translations cover CMS service titles without duplicating their dictionary', () => {
  assert.equal(copy('Desenvolvimento Web Personalizado', 'en'), 'Custom Web Development');
  assert.notEqual(copy('Consultoria Tecnológica', 'es'), 'Consultoria Tecnológica');
});
test('unknown editorial text, brands, URLs, IDs and non-string React values are preserved', () => {
  const data = { id: 'abc', title: 'Unpublished customer copy' };
  for (const lang of ['pt', 'en', 'es']) {
    for (const value of [data, null, undefined, false, 0, 15, 'SevenDevX', '/admin', 'https://example.invalid', 'new CMS text']) {
      assert.equal(copy(value, lang), value);
    }
  }
});
test('exact matching never rewrites part of a customer message or performs HTML substitution', () => {
  assert.equal(copy('Contato: my custom note', 'en'), 'Contato: my custom note');
  assert.equal(copy('<img src=x onerror=alert(1)>', 'es'), '<img src=x onerror=alert(1)>');
  assert.equal(copy('  Contato\n', 'en'), '  Contact\n');
});
test('language changes resolve immediately without mutating source content', () => {
  const text = 'Sites e aplicações web sob medida';
  assert.equal(copy(text, 'en'), 'Custom websites and web applications');
  assert.equal(copy(text, 'es'), 'Sitios y aplicaciones web a medida');
  assert.equal(copy(text, 'pt'), text);
});
test('BRL prices are labelled without converting currencies or altering project names', () => {
  assert.equal(copy('A partir de R$ 2.497', 'en'), 'From R$ 2,497 (BRL)');
  assert.equal(copy('PsicoOne', 'es'), 'PsicoOne');
});
test('HTML fallback metadata is owned by Helmet; viewport keeps PWA safe-area coverage', () => {
  const html = fs.readFileSync(new URL('../index.html', import.meta.url), 'utf8');
  assert.match(html, /<meta data-react-helmet="true"\s+name="description"/);
  assert.match(html, /<link data-react-helmet="true" rel="canonical"/);
  assert.match(html, /viewport-fit=cover/);
  const head = fs.readFileSync(new URL('../src/components/SEOHead.tsx', import.meta.url), 'utf8');
  assert.match(head, /inLanguage: locale/);
  assert.match(head, /new URL\(image, origin\)/);
  assert.doesNotMatch(head, /name="viewport"/);
});
test('corrected barbershop case preserves the old inbound URL and removes unsupported case metrics', () => {
  const data = fs.readFileSync(new URL('../src/data/caseStudies.ts', import.meta.url), 'utf8');
  const segment = data.slice(data.indexOf('slug: "george-fiuza-'), data.indexOf('slug: "foodopsx-'));
  assert.match(segment, /slug: "george-fiuza-site-institucional-advocacia"/);
  assert.match(segment, /client: "Barbearia George Fiuza"/);
  assert.match(segment, /metrics: \[\]/);
  assert.doesNotMatch(segment, /escritório|98\/100|<1s/);
});


test('every provider and technology description is reviewed in both languages', () => {
  const { hasReviewedPublicText } = load('publicCopy');
  for (const [file, expected] of [['src/modules/integrations/providerCatalog.ts',117],['src/utils/techData.ts',39]]) {
    const source = ts.createSourceFile(file, fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
    const descriptions=[];
    function visit(n) {
      if(ts.isPropertyAssignment(n) && n.name.getText(source)==='description' && ts.isStringLiteralLike(n.initializer)) descriptions.push(n.initializer.text);
      ts.forEachChild(n,visit);
    }
    visit(source);
    assert.equal(descriptions.length,expected,file);
    for(const text of descriptions) assert.ok(hasReviewedPublicText(text),text);
  }
});

test('reviewed message placeholders survive translation and user values are not translated', () => {
  const { formatPublicMessage } = load('publicCopy');
  for(const [source,pair] of Object.entries(publicRouteCopy)) {
    const fields = value => [...value.matchAll(/\{(\w+)\}/g)].map(x=>x[1]).sort();
    for(const translated of pair) assert.deepEqual(fields(translated),fields(source),source);
  }
  assert.equal(formatPublicMessage('Buscar entre {count} integrações…',{count:116},'en'),'Search 116 integrations…');
  assert.ok(formatPublicMessage('Nenhuma integração encontrada para {query}.',{query:'Desenvolvimento'},'es').includes('Desenvolvimento'));
});


test('lazy public showcases translate visible copy while preserving filter identities', () => {
  const showcase=fs.readFileSync('src/components/TechShowcase.tsx','utf8');
  assert.ok(showcase.includes('{copy(category)}'));
  assert.ok(showcase.includes('setActiveCategory(category)'));
  assert.ok(showcase.includes('copy("Stack Tecnológica Completa")'));
  for(const file of ['src/components/PortfolioCarousel3D.tsx','src/pages/ProjectsHub.tsx']) {
    const source=fs.readFileSync(file,'utf8');
    assert.ok(source.includes('copy(project.longDescription || project.description)'),file);
    assert.ok(source.includes('copy(project.description)'),file);
  }
});


test('all programmatic solution labels and descriptions are translated, not just page headings', () => {
  const { hasReviewedPublicText }=load('publicCopy');
  const file='src/data/geoContent.ts';
  const source=ts.createSourceFile(file,fs.readFileSync(file,'utf8'),ts.ScriptTarget.Latest,true);
  const descriptions=[];
  function visit(n) {
    if(ts.isObjectLiteralExpression(n)) {
      const fields=Object.fromEntries(n.properties.filter(p=>ts.isPropertyAssignment(p)&&ts.isStringLiteralLike(p.initializer)).map(p=>[p.name.getText(source),p.initializer.text]));
      if(fields.desc) {descriptions.push(fields.desc); assert.ok(hasReviewedPublicText(fields.desc),fields.desc); if(!['React','TypeScript','Node.js','PostgreSQL','Supabase','OpenAI'].includes(fields.name)) assert.ok(hasReviewedPublicText(fields.name),fields.name);}
    }
    ts.forEachChild(n,visit);
  }
  visit(source);assert.equal(descriptions.length,20);
});

test('supplier cards translate rendered values and accessible labels without changing contact destinations', async () => {
  const {build}=await import('esbuild');const {createRequire}=await import('node:module');const path=await import('node:path');const React=await import('react');const {renderToStaticMarkup}=await import('react-dom/server');
  const result=await build({stdin:{contents:`export {default as Suppliers} from './src/pages/Fornecedores';export {locale} from './src/i18n/LanguageContext';`,resolveDir:process.cwd(),loader:'tsx'},bundle:true,write:false,platform:'node',format:'cjs',packages:'external',jsx:'automatic',alias:{'@':path.resolve('src')},plugins:[{name:'public-render-fixture',setup(b){
    b.onLoad({filter:/components[\\/](Header|Footer|WhatsAppButton|SEOHead)\.tsx$/},()=>({loader:'js',contents:'export default function Stub(){return null}'}));
    b.onLoad({filter:/LanguageContext\.tsx$/},()=>({loader:'js',contents:"import {translations} from './translations';export const locale={value:'en'};export const useLanguage=()=>({language:locale.value,t:translations[locale.value]});"}));
  }}]});
  const module={exports:{}};new Function('module','exports','require',result.outputFiles[0].text)(module,module.exports,createRequire(import.meta.url));
  const {Suppliers,locale}=module.exports;
  locale.value='en';let html=renderToStaticMarkup(React.createElement(Suppliers));assert.match(html,/Mon–Fri: 9am–6pm/);assert.match(html,/aria-label="Email SevenDevX"/);assert.match(html,/href="mailto:contato@sevendevx.com"/);assert.doesNotMatch(html,/Seg - Sex: 9h/);assert.match(html,/Hello!%20I%20would%20like%20to%20become%20a%20SevenDevX%20supplier%20partner/);
  locale.value='es';html=renderToStaticMarkup(React.createElement(Suppliers));assert.match(html,/Lun–vie: 9:00–18:00/);assert.match(html,/aria-label="Enviar correo a SevenDevX"/);assert.match(html,/href="tel:\+5531984740625"/);
  locale.value='pt';html=renderToStaticMarkup(React.createElement(Suppliers));assert.match(html,/Seg - Sex: 9h às 18h/);
});

test('website creation fallback copy is covered before CMS data resolves', () => {
  const { hasReviewedPublicText } = load('publicCopy');
  const file = fs.readFileSync(new URL('../src/pages/geo/CriacaoSitesProfissionais.tsx', import.meta.url), 'utf8');
  const source = ts.createSourceFile('page.tsx', file, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fields = new Set(['label', 'title', 'description', 'criterion', 'value_a', 'value_b', 'question', 'answer']);
  let checked = 0;
  for (const statement of source.statements) {
    if (!ts.isVariableStatement(statement)) continue;
    for (const declaration of statement.declarationList.declarations) {
      if (!declaration.name.getText(source).startsWith('FB_') || !declaration.initializer) continue;
      const visit = node => {
        if (ts.isPropertyAssignment(node) && fields.has(node.name.getText(source)) && ts.isStringLiteralLike(node.initializer) && /[A-Za-zÀ-ÿ]/.test(node.initializer.text)) {
          const text = node.initializer.text;
          assert.ok(hasReviewedPublicText(text), `${declaration.name.getText(source)}: ${text}`);
          assert.equal(copy(text, 'pt'), text);
          checked++;
        }
        ts.forEachChild(node, visit);
      };
      visit(declaration.initializer);
    }
  }
  assert.ok(checked >= 50, 'cover every fallback section, not just the hero');
});

test('all cluster links and shared solution benefits have reviewed locale coverage', () => {
  const { hasReviewedPublicText, translatePublicText } = load('publicCopy');
  const { CONTENT_CLUSTERS, buildClusterJsonLd } = load('../data/contentClusters');
  const original = buildClusterJsonLd();
  for (const language of ['en', 'es']) {
    const copy = text => translatePublicText(text, language);
    const schema = buildClusterJsonLd(copy);
    for (const [i, cluster] of CONTENT_CLUSTERS.entries()) {
      for (const text of [cluster.hub.title, cluster.description, ...cluster.spokes.map(link => link.title)]) assert.ok(hasReviewedPublicText(text), text);
      assert.equal(schema[i]['@id'], original[i]['@id']);
      assert.deepEqual(schema[i].hasDefinedTerm.map(term => term.url), original[i].hasDefinedTerm.map(term => term.url));
    }
  }
  const file = fs.readFileSync(new URL('../src/pages/geo/SolutionPage.tsx', import.meta.url), 'utf8');
  const source = ts.createSourceFile('solution.tsx', file, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  let benefits = 0;
  const visit = node => {
    if (ts.isArrayLiteralExpression(node) && node.elements.some(item => ts.isStringLiteralLike(item) && item.text === 'Performance Lighthouse 95+ garantida')) {
      for (const item of node.elements) {
        assert.ok(ts.isStringLiteralLike(item));
        assert.ok(hasReviewedPublicText(item.text), item.text);
        benefits++;
      }
    }
    ts.forEachChild(node, visit);
  };
  visit(source); assert.equal(benefits, 7);
});
