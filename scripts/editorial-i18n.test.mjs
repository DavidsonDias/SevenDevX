import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ts from 'typescript';

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
const { GEO_ARTICLES } = load('src/data/geoContent');
const { articlesEn } = load('src/i18n/editorial/en');
const { articlesEs } = load('src/i18n/editorial/es');
const { resolveGeoArticle, articleFingerprint } = load('src/i18n/editorial/resolve');
const { articleRevisions } = load('src/i18n/editorial/revisions');
const { articleHeadlines } = load('src/i18n/editorial/headlines');

test('every published article has full, nonempty EN/ES content and matching source revision', () => {
  assert.equal(GEO_ARTICLES.length, 13);
  for (const source of GEO_ARTICLES) {
    assert.equal(articleFingerprint(source), articleRevisions[source.slug], `Review changed source: ${source.slug}`);
    for (const [lang, catalogue] of [['en', articlesEn], ['es', articlesEs]]) {
      const copy = catalogue[source.slug];
      assert.ok(copy, `${source.slug}: ${lang}`);
      for (const field of ['title', 'question', 'shortAnswer', 'summary']) assert.ok(copy[field].trim(), `${source.slug}.${field}`);
      assert.equal(copy.sections.length, source.sections.length, source.slug);
      assert.equal(copy.faq.length, source.faq.length, source.slug);
      for (const section of copy.sections) assert.ok(section.heading.trim() && section.body.trim());
      for (const faq of copy.faq) assert.ok(faq.q.trim() && faq.a.trim());
      assert.ok(copy.keywords.length > 0 && copy.keywords.every(k => k.trim()));
      assert.equal(resolveGeoArticle(source, lang).language, lang, `Unexpected fallback: ${source.slug}`);
      assert.equal(articleHeadlines[source.title][lang === 'en' ? 0 : 1], copy.title);
    }
  }
  assert.deepEqual(Object.keys(articlesEn).sort(), GEO_ARTICLES.map(a => a.slug).sort());
  assert.deepEqual(Object.keys(articlesEs).sort(), Object.keys(articlesEn).sort());
});

test('translation preserves URLs, category, reading time, related routes and Portuguese source', () => {
  for (const source of GEO_ARTICLES) {
    const original = JSON.stringify(source);
    assert.equal(resolveGeoArticle(source, 'pt').article, source);
    for (const lang of ['en', 'es']) {
      const { article } = resolveGeoArticle(source, lang);
      for (const key of ['slug', 'category', 'readingMinutes', 'relatedSlugs']) assert.deepEqual(article[key], source[key]);
      assert.notEqual(article.title, source.title);
      for (const slug of article.relatedSlugs || []) assert.ok(GEO_ARTICLES.some(a => a.slug === slug));
    }
    assert.equal(JSON.stringify(source), original);
  }
});

test('new or changed editorial source falls back as a whole article with its real language', () => {
  const source = GEO_ARTICLES[0];
  for (const changed of [
    { ...source, slug: 'new-untranslated-article' },
    { ...source, title: 'Updated title pending translation' },
    { ...source, sections: [...source.sections, { heading: 'New section', body: 'New source text' }] },
    { ...source, faq: [...source.faq, { q: 'New question?', a: 'New answer.' }] },
  ]) {
    for (const lang of ['en', 'es']) {
      const result = resolveGeoArticle(changed, lang);
      assert.equal(result.language, 'pt');
      assert.equal(result.article, changed);
    }
  }
});

test('an incomplete translation cannot hide FAQ entries or mix localized and source sections', () => {
  const source = GEO_ARTICLES[0];
  const saved = articlesEn[source.slug];
  try {
    articlesEn[source.slug] = { ...saved, faq: [] };
    assert.equal(resolveGeoArticle(source, 'en').article, source);
    articlesEn[source.slug] = { ...saved, sections: [{ heading: '', body: '' }] };
    assert.equal(resolveGeoArticle(source, 'en').language, 'pt');
  } finally { articlesEn[source.slug] = saved; }
});

test('price context, business contact and technical identifiers survive editorial translation', () => {
  for (const lang of ['en', 'es']) {
    const { article } = resolveGeoArticle(GEO_ARTICLES[0], lang);
    const text = JSON.stringify(article);
    assert.match(text, /R\$ /);
    assert.match(text, /https:\/\/www\.sevendevx\.com/);
    assert.match(text, /\+55 \(31\) 98474-0625/);
    assert.match(text, /React \+ TypeScript/);
    assert.doesNotMatch(text, /USD|EUR|€|US\$/);
  }
});

test('article screen renders and describes the same localized content and omits empty FAQ schema', () => {
  const source = fs.readFileSync(path.join(root, 'src/pages/geo/GeoArticle.tsx'), 'utf8');
  assert.match(source, /resolveGeoArticle\(sourceArticle, language\)/);
  assert.match(source, /inLanguage: locale/);
  assert.match(source, /lang=\{locale\}/);
  assert.match(source, /article\.faq\.length > 0 && <script/);
  assert.match(source, /article\.faq\.length > 0 && <section/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML/);
  // Resolved editorial text must not be passed through phrase-level translation again after fallback.
  assert.doesNotMatch(source, /copy\((?:article\.(?:title|summary)|a\.title|rel\.title)\)/);
});
