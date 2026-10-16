# Shubhankar Shil, FCA — portfolio and knowledge platform

A static EJS editorial website combining management advisory, academic research, mentorship, speaking and long-form ideas. EJS and JSON are resolved at build time; `dist/` contains only HTML, CSS, JavaScript and static assets.

## Requirements

- Node.js 20 or newer
- Yarn Classic 1.22.x

## Start locally

```bash
yarn
yarn serve
```

`yarn serve` builds the site, starts a local server at `http://localhost:3000/`, watches source files, rebuilds after changes, and automatically opens the URL in your default browser. Set a different port in PowerShell with `$env:PORT=3001; yarn serve`.

Local serve mode intentionally includes the six supplied draft essays so their layouts can be reviewed. Every draft page includes an editorial notice and `noindex`. A normal production build excludes all drafts.

## Commands

```bash
yarn serve     # Build, serve, watch, and open the browser
yarn dev       # Alias for yarn serve
yarn build     # Generate the static site in dist/
yarn validate  # Rebuild and check routes, links, templates, and output
yarn clean     # Remove dist/
```

## Architecture

- `src/data/` contains site settings, navigation, page copy, publications and structured article drafts.
- `src/templates/` contains the shared EJS layout, partials, components, and page templates.
- `src/assets/` contains browser CSS and JavaScript copied to the output.
- `src/static/` contains root-level public files.
- `build/` contains the build, validation, cleanup, and local development scripts.

Routes are declared in `src/data/pages.json` and emitted as directory indexes such as `dist/about/index.html`. Article routes are derived from `src/data/articles.json`. URL helpers apply `site.basePath`, so assets and navigation continue to work for nested routes or subdirectory hosting.

## Route map

- `/` — editorial homepage
- `/about/`, `/advisory/`, `/academia/`, `/mentorship/`
- `/insights/` and preview-only insight detail routes
- `/notebook/` and preview-only notebook detail routes
- `/speaking/`, `/contact/`
- `/accessibility/`, `/privacy/`, `/not-found/`, plus `404.html`

## Editorial controls

Articles use a `status` field in `src/data/articles.json`. Only `published` entries appear in production. Keep proposed essays as `draft` until author approval. Unverified reach statistics, alumni outcomes, case-study results, logos and date-sensitive chronology are intentionally omitted.

To preview drafts outside `yarn serve`, set `SITE_PREVIEW_DRAFTS=true` for that command. In PowerShell:

```powershell
$env:SITE_PREVIEW_DRAFTS='true'; yarn build
```

## Content to replace

Before launch, confirm reuse permission for the official portraits sourced from the JKMNS profile and ULAB faculty profile, confirm current professional titles and date-sensitive history, approve any draft essays, provide a public domain and reviewed contact-form endpoint, and complete legal review of the privacy notice. The site does not submit form data without a configured endpoint and does not simulate newsletter or contact success. Set `site.siteUrl` to generate canonical URLs and `sitemap.xml`.
