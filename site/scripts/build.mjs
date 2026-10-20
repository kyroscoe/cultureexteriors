import { build, createServer } from 'vite';
import { lstat, mkdir, readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { pages, pagePath } from '../src/routes.js';
import { shouldIndex, siteOrigin } from './settings.mjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = resolve(root, 'dist');
const origin = siteOrigin();
const indexable = shouldIndex();
const escape = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character],
  );

const existingOutput = await lstat(output).catch((error) => {
  if (error.code !== 'ENOENT') throw error;
});
if (existingOutput?.isSymbolicLink())
  throw new Error('Refusing to replace a linked output directory.');
await build({ root });
const template = await readFile(resolve(output, 'index.html'), 'utf8');
if (!template.includes('<!--app-html-->') || !template.includes('<!--page-head-->'))
  throw new Error('The HTML template is missing its rendering placeholders.');

const business = {
  '@context': 'https://schema.org',
  '@type': 'HomeAndConstructionBusiness',
  name: 'Culture Exteriors',
  url: origin,
  email: 'info@cultureexteriors.com',
  areaServed: { '@type': 'State', name: 'Ohio' },
  description: 'Residential siding, roofing, windows, and gutters for Ohio homeowners.',
};

// Vite transforms the JSX for Node. No server or Python is needed after the build.
const server = await createServer({
  root,
  // Keep pre-rendering's production transforms separate from Vite's dev cache.
  cacheDir: 'node_modules/.vite-prerender',
  optimizeDeps: { noDiscovery: true, include: [] },
  server: { middlewareMode: true, watch: null, hmr: false },
  appType: 'custom',
});
try {
  const { render, renderFormDefinition } = await server.ssrLoadModule('/src/entry-server.jsx');
  for (const [key, metadata] of Object.entries(pages)) {
    const path = pagePath(key);
    const title = escape(`${metadata.title} | Culture Exteriors`);
    const description = escape(metadata.description);
    const canonical = escape(`${origin}${path}`);
    const head = `
      <title>${title}</title>
      <meta name="description" content="${description}" />
      <link rel="canonical" href="${canonical}" />
      <meta property="og:title" content="${title}" />
      <meta property="og:description" content="${description}" />
      <meta property="og:type" content="website" />
      <meta property="og:url" content="${canonical}" />
      <meta property="og:image" content="${escape(origin)}/assets/hero-1920.webp" />
      <meta name="twitter:card" content="summary_large_image" />
      ${!indexable || key === '404' ? '<meta name="robots" content="noindex, nofollow" />' : ''}
      <script type="application/ld+json">${JSON.stringify(business).replace(/</g, '\\u003c')}</script>`;
    const html = template
      .replace('<!--page-head-->', () => head)
      .replace('<!--app-html-->', () => render(key))
      .replace('<!--netlify-form-->', () => (key === 'contact' ? renderFormDefinition() : ''))
      .replace('<div id="root">', '<div id="root" data-prerendered="true">')
      .replace('<body>', `<body class="page-${key}">`);
    const target =
      key === '404'
        ? resolve(output, '404.html')
        : resolve(output, key === 'home' ? '' : key, 'index.html');
    await mkdir(resolve(target, '..'), { recursive: true });
    await writeFile(target, html);
  }
} finally {
  await server.close();
}

const paths = Object.keys(pages)
  .filter((key) => key !== '404')
  .map((key) => `${origin}${pagePath(key)}`);
await writeFile(
  resolve(output, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${paths.map((path) => `  <url><loc>${escape(path)}</loc></url>`).join('\n')}\n</urlset>\n`,
);
await writeFile(
  resolve(output, 'robots.txt'),
  `User-agent: *\n${indexable ? 'Allow: /' : 'Disallow: /'}\nSitemap: ${origin}/sitemap.xml\n`,
);
console.log(`Pre-rendered ${paths.length} pages + 404 for ${origin} (indexable: ${indexable}).`);
