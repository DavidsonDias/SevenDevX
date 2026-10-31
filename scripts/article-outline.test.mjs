import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import ts from 'typescript';
const exports = {};
new Function('exports', ts.transpileModule(fs.readFileSync('src/lib/articleOutline.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(exports);
const {articleOutline}=exports;
test('outline matches source line IDs, keeps duplicate titles distinct, and ignores fenced code',()=>{
 const md=['# Title','## Start','```js','## fake','```','### **Details**','## Start','~~~~','### fake','~~~~','## [Links](https://example.com)'].join('\n');
 assert.deepEqual(articleOutline(md),[{id:'article-section-2',title:'Start',level:2},{id:'article-section-6',title:'Details',level:3},{id:'article-section-7',title:'Start',level:2},{id:'article-section-11',title:'Links',level:2}]);
});
test('outline handles empty text and CRLF',()=>{assert.deepEqual(articleOutline(''),[]);assert.deepEqual(articleOutline('Intro\r\n## Heading ##'),[{id:'article-section-2',title:'Heading',level:2}]);});
const searchExports = {};
new Function('exports', ts.transpileModule(fs.readFileSync('src/lib/blogSearch.ts','utf8'), {compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText)(searchExports);
test('blog search matches accented Portuguese and Spanish with stable whitespace',()=>{
 assert.equal(searchExports.normalizeBlogSearch('  CRIAÇÃO   de  Sites '),'criacao de sites');
 assert.equal(searchExports.normalizeBlogSearch('Programación'),'programacion');
 assert.ok(searchExports.normalizeBlogSearch('Segurança e Arquitetura').includes(searchExports.normalizeBlogSearch('seguranca')));
 assert.equal(searchExports.normalizeBlogSearch(''),'');
});
