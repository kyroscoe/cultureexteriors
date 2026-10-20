# Culture Homes & Exteriors

A React + Vite website using JavaScript, JSX and plain CSS. The existing design,
logo, Ohio service content, larger text and interactions are retained. No Python
installation is needed.

## Run locally

Requires Node 22. From the repository root:

```powershell
cd site
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Vite provides hot reload while you edit.
If that port is occupied, use the next available Local URL printed in the terminal.

## Source

- `site/src/pages/`: page layouts written in JSX.
- `site/src/components/`: header, footer, form, gallery and media components.
- `site/src/data/content.json`: editable service and company information.
- `site/src/styles.css`: shared styling and responsive overrides.
- `site/src/routes.js`: page URLs and search/social metadata.
- `site/public/assets/`: supplied logo and optimized photographs.
- `site/photography/sources.json`: photographer and license records.
- `site/scripts/`: JavaScript build settings, pre-rendering and output checks.
- `site/tests/`: Vitest component tests and Playwright browser tests.

See [the editing guide](site/EDITING.md) for specific file locations.

## Commands

Run these from `site/`:

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite development server with hot reload |
| `npm run build` | Bundle React and pre-render all pages into `dist/` |
| `npm run preview` | Preview the production build locally |
| `npm run check` | Component tests, production build and output/HTTP checks |
| `npm run test:e2e` | Desktop and mobile Chromium browser tests |
| `npm run format` | Format source with Prettier |
| `npm run format:check` | Check source formatting without changing files |

Before the first browser test, run `npx playwright install chromium`. Tests use
mocked Netlify submissions; they never send a real inquiry.
Generated output, test screenshots, dependencies and local secrets are ignored.

## GitHub and Netlify

Push this repository, including `site/`. The root `netlify.toml` sets:

- **Base:** `site`
- **Build:** `npm run build`
- **Publish:** `dist`

Node builds all 12 pages and `404.html` ahead of time. Each page has content and
unique metadata before JavaScript runs; React hydrates it for interactions.
Netlify serves static files and does not need a Node or Python application server.
Do not add an SPA catch-all redirect: the service URLs have actual HTML pages,
and unknown URLs should return the custom 404 response.

The build uses Netlify's production `URL` for canonicals, social metadata, business
data and sitemap. Set `SITE_URL=https://your-domain.example` to override it.
Production requires HTTPS and is indexable; local and deploy-preview builds use
`noindex, nofollow` and disallow crawling. Environment values are never copied
wholesale into browser code.

GitHub Actions installs Node dependencies, checks formatting, runs component and
build/output checks, and runs browser tests. Remote CI and Netlify deployment will
run after you push and connect the repository.

## Launch inputs

See [the launch checklist](site/LAUNCH.md). The estimate form uses Netlify Forms
with a static detection definition, URL-encoded submissions and a honeypot. Enable
form detection and set an email notification to **info@cultureexteriors.com** for
the `estimate` form. Local previews reject submissions; tests mock acceptance.
The hero uses a photograph until approved drone footage is supplied.
Stock photos remain identified as inspiration, with a public credits page.

Implementation references: [Vite](https://vite.dev/guide/),
[Vite pre-rendering](https://vite.dev/guide/ssr.html#pre-rendering-ssg),
[React hydration](https://react.dev/reference/react-dom/client/hydrateRoot).
