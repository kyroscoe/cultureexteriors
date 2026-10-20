# Editing the React website

The application is React with Vite, written in JavaScript and JSX. It uses plain
CSS, React state for interactions, and normal links between pages.

Run commands from `site/`:

```powershell
npm ci
npm run dev
```

Open http://127.0.0.1:5173. Vite updates the preview as you save changes.
If that port is occupied, use the Local URL printed in the terminal.

## Where to make changes

| Change                                                                   | Source file                       |
| ------------------------------------------------------------------------ | --------------------------------- |
| Homepage text and sections                                               | `src/pages/Home.jsx`              |
| Shared service-page layout                                               | `src/pages/Service.jsx`           |
| Service descriptions, comparisons, company details and optional features | `src/data/content.json`           |
| Contact page                                                             | `src/pages/Contact.jsx`           |
| About, FAQs, service area, privacy, photo credits and 404                | `src/pages/Information.jsx`       |
| Header, mobile menu and service dropdowns                                | `src/components/Header.jsx`       |
| Footer, buttons, photos and shared page layout                           | `src/components/Shared.jsx`       |
| Gallery filters and approved before/after comparison                     | `src/components/Gallery.jsx`      |
| Video preferences, playback and still-photo fallback                     | `src/components/HeroMedia.jsx`    |
| Estimate form fields and states                                          | `src/components/EstimateForm.jsx` |
| Form validation, email draft and optional delivery integration           | `src/lib/estimate.js`             |
| Fonts, sizes, colors, spacing and responsive layouts                     | `src/styles.css`                  |
| Page URLs, titles and descriptions                                       | `src/routes.js`                   |
| Photo credits and original sources                                       | `photography/sources.json`        |
| Image dimensions after replacing photographs                             | `src/data/asset-dimensions.json`  |

CSS section comments identify the main areas. Responsive overrides appear toward
the bottom; check the relevant mobile override when changing a size.

JSX uses `className` instead of `class`, `htmlFor` instead of `for`, and braces to
insert JavaScript values. Components are imported at the top of each page. No
Python or HTML strings are involved in editing page layouts.

## Formatting and checks

```powershell
npm run format
npm run format:check
npm run check
```

Prettier formats JavaScript, JSX, CSS, JSON and Markdown. `.editorconfig` uses two
spaces, and `.prettierrc.json` works with an editor's Prettier extension.

`npm run check` runs React component tests, creates the production build and checks
all generated pages, links, metadata, assets, indexing and HTTP responses.

For browser checks, install Chromium once, then run:

```powershell
npx playwright install chromium
npm run test:e2e
```

These exercise desktop and mobile layouts, hydration, menus, dropdowns, filters,
FAQs and the email draft form. They never send a real inquiry. Screenshots and
failure traces are saved in ignored `test-results/`.

## Production build

```powershell
npm run build
npm run preview
```

`scripts/build.mjs` uses Vite to bundle the app and renders each React page into
static HTML with its own metadata. React hydrates that HTML in the browser.
`scripts/settings.mjs` controls the canonical origin and search indexing.
There is no production application server.

Do not edit `dist/`; the build replaces it. Never put secrets in `src/`, `public/`,
content JSON, or environment variables prefixed with `VITE_`.
