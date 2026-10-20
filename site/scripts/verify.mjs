import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import { resolve, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { JSDOM } from 'jsdom';
import { preview } from 'vite';
import { pages, pagePath } from '../src/routes.js';
import { shouldIndex, siteOrigin } from './settings.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
const origin = siteOrigin();
const documents = new Map();
const titles = new Set();
const descriptions = new Set();

for (const [key, metadata] of Object.entries(pages)) {
  const path = pagePath(key);
  const file = key === '404' ? '404.html' : key === 'home' ? 'index.html' : `${key}/index.html`;
  const html = await readFile(resolve(output, file), 'utf8');
  const document = new JSDOM(html).window.document;
  documents.set(path, document);
  assert.equal(document.querySelectorAll('h1').length, 1, `${path}: exactly one heading`);
  assert.equal(
    document.querySelector('meta[charset]').getAttribute('charset').toLowerCase(),
    'utf-8',
  );
  assert.equal(document.title, `${metadata.title} | Culture Exteriors`);
  assert(!titles.has(document.title), `${path}: unique title`);
  titles.add(document.title);
  const description = document.querySelector('meta[name="description"]').content;
  assert.equal(description, metadata.description);
  assert(!descriptions.has(description), `${path}: unique description`);
  descriptions.add(description);
  assert.equal(document.querySelector('link[rel="canonical"]').href, `${origin}${path}`);
  assert.equal(document.querySelector('meta[property="og:url"]').content, `${origin}${path}`);
  for (const property of ['og:title', 'og:description', 'og:image'])
    assert(document.querySelector(`meta[property="${property}"]`)?.content);
  assert.equal(document.querySelector('meta[name="twitter:card"]').content, 'summary_large_image');
  assert.equal(
    Boolean(document.querySelector('meta[name="robots"]')),
    !shouldIndex() || key === '404',
  );
  assert(
    document.querySelector('#root[data-prerendered] main'),
    'Page content must be present before JavaScript',
  );
  const schema = JSON.parse(
    document.querySelector('script[type="application/ld+json"]').textContent,
  );
  assert.equal(schema.areaServed.name, 'Ohio');
  for (const field of ['aggregateRating', 'review', 'address', 'telephone', 'foundingDate'])
    assert(!(field in schema));
  assert(!/[\u00c3\u00c2\u00e2\ufffd\u0080-\u009f]/.test(html), `${path}: valid punctuation`);
  assert(!html.includes('<!--app-html-->') && !html.includes('<!--page-head-->'));
  for (const image of document.querySelectorAll('img')) {
    assert(image.alt && image.width && image.height, `${path}: descriptive images with dimensions`);
  }
}

for (const [path, document] of documents) {
  const links = [...document.querySelectorAll('[href], [src]')]
    .flatMap((element) => [element.getAttribute('href'), element.getAttribute('src')])
    .filter(Boolean);
  for (const image of document.querySelectorAll('img[srcset]'))
    for (const source of image.srcset.split(',')) links.push(source.trim().split(/\s+/)[0]);
  for (const link of links) {
    if (/^(?:[a-z]+:|\/\/)/i.test(link)) continue;
    const target = new URL(link, `https://check.example${path}`);
    let file = resolve(output, `.${decodeURIComponent(target.pathname)}`);
    const info = await stat(file).catch(() => null);
    assert(info, `${path}: missing ${link}`);
    if (info.isDirectory()) file = resolve(file, 'index.html');
    assert((await stat(file)).isFile(), `${path}: missing ${link}`);
    if (target.hash) {
      const destination = documents.get(target.pathname);
      assert(
        destination?.getElementById(decodeURIComponent(target.hash.slice(1))),
        `${path}: missing anchor ${link}`,
      );
    }
  }
}

const sitemap = new JSDOM(await readFile(resolve(output, 'sitemap.xml'), 'utf8'), {
  contentType: 'application/xml',
}).window.document;
assert.deepEqual(
  new Set([...sitemap.querySelectorAll('loc')].map((node) => node.textContent)),
  new Set(
    [...documents.keys()].filter((path) => path !== '/404.html').map((path) => `${origin}${path}`),
  ),
);
const robots = await readFile(resolve(output, 'robots.txt'), 'utf8');
assert.equal(robots.includes('Disallow: /'), !shouldIndex());
assert(robots.includes(`Sitemap: ${origin}/sitemap.xml`));
for (const file of await readdir(output, { recursive: true })) {
  assert(!['.py', '.jsx'].includes(extname(file)), `Source file published: ${file}`);
  assert(
    !/(?:^|[\\/])(?:node_modules|\.git|\.env|src|tests)(?:[\\/]|$)/.test(file),
    `Private source published: ${file}`,
  );
}
const cssFile = (await readdir(resolve(output, 'assets'))).find((file) =>
  /^index-.*\.css$/.test(file),
);
assert.match(
  await readFile(resolve(output, 'assets', cssFile), 'utf8'),
  /\.logo img\s*\{[^}]*height:\s*auto/,
);

const server = await preview({ root, preview: { port: 0, host: '127.0.0.1', open: false } });
try {
  const address = `http://127.0.0.1:${server.httpServer.address().port}`;
  for (const path of documents.keys())
    assert.equal((await fetch(address + path)).status, 200, `HTTP route ${path}`);
  const missing = await fetch(`${address}/this-page-does-not-exist/`);
  assert.equal(missing.status, 404);
  assert((await missing.text()).includes('That page isn'));
} finally {
  await new Promise((done, reject) =>
    server.httpServer.close((error) => (error ? reject(error) : done())),
  );
}
console.log(
  `PASS: ${documents.size} pre-rendered pages, unique metadata, local links, anchors, assets, sitemap, indexing, HTTP routes, and 404 response. No Python or private source in the build.`,
);
