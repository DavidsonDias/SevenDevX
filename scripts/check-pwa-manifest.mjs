import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

// Check the shipped artifact, not only the source configuration. No browser storage is touched.
const root = path.resolve(import.meta.dirname, '..');
const output = path.join(root, 'dist');
const html = fs.readFileSync(path.join(output, 'index.html'), 'utf8');
const links = [...html.matchAll(/<link\b[^>]*>/gi)].map(match => match[0])
  .filter(tag => /\brel\s*=\s*["']manifest["']/i.test(tag));
assert.equal(links.length, 1, 'Ship exactly one manifest link');
assert.match(links[0], /\bhref\s*=\s*["']\/manifest\.json["']/i);
const manifest = JSON.parse(fs.readFileSync(path.join(output, 'manifest.json'), 'utf8'));
assert.equal(manifest.theme_color.toLowerCase(), '#000000');
assert.equal(manifest.background_color.toLowerCase(), '#000000');
assert.equal(manifest.display, 'standalone');
for (const key of ['id', 'scope', 'start_url']) assert.equal(manifest[key], '/', key);
assert.ok(!fs.existsSync(path.join(output, 'manifest.webmanifest')), 'No second generated manifest');
for (const icon of [...manifest.icons, ...manifest.shortcuts.flatMap(item => item.icons ?? [])]) {
  assert.match(icon.src, /^\/pwa\/[^/]+\.png$/);
  const data = fs.readFileSync(path.join(output, icon.src.slice(1)));
  assert.equal(data.subarray(0, 8).toString('hex'), '89504e470d0a1a0a', `${icon.src} is a real PNG`);
  assert.equal(icon.sizes, `${data.readUInt32BE(16)}x${data.readUInt32BE(20)}`, `${icon.src} dimensions`);
}
const hosting = JSON.parse(fs.readFileSync(path.join(root, 'vercel.json'), 'utf8'));
assert.equal(hosting.rewrites[0].source, '/manifest.webmanifest');
assert.equal(hosting.rewrites[0].destination, '/manifest.json');
for (const url of ['/manifest.json', '/manifest.webmanifest']) {
  assert.ok(hosting.headers.find(rule => rule.source === url)?.headers
    .some(header => header.key === 'Cache-Control' && header.value.includes('max-age=0')),
  `${url} must revalidate instead of retaining the old white theme for 24 hours`);
}
console.log('PWA artifact verified: one black manifest, stable identity, valid PNG icons and legacy URL alias.');
