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
  assert.match(source, /href === "\/contact" \? "\/#contact"/);
  assert.doesNotMatch(source, /dangerouslySetInnerHTML|copy\(displayPost\.(title|content)\)/);
});
