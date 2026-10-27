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
const { commercialCopy } = load('publicCommercialCopy');
const { projectCopy } = load('publicProjectCopy');

test('all supplemental public copy has nonempty English and Spanish versions', () => {
  for (const [pt, pair] of Object.entries({ ...publicCopy, ...commercialCopy, ...projectCopy })) {
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
