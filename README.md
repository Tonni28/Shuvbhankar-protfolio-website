# Shubhankar Shil, FCA — storytelling portfolio

A responsive editorial website for Shubhankar Shil, FCA, connecting management advisory, governance, higher education, research and mentorship through one coherent personal narrative.

## Run locally

```powershell
yarn
yarn serve
```

The local server builds with editorial preview enabled at `http://localhost:3000/`. Draft articles are clearly labelled and include `noindex`.

## Commands

```powershell
yarn build      # production build; draft archives stay private
yarn validate   # production build plus generated-route/link checks
yarn serve      # draft preview, watch mode, local server
```

To produce a one-off preview build:

```powershell
$env:SITE_PREVIEW_DRAFTS='true'
yarn build
Remove-Item Env:SITE_PREVIEW_DRAFTS
```

## Routes

- `/` — portrait-led editorial homepage
- `/about/` — seven-chapter professional story
- `/work/` — organizations, education and mentorship
- `/blogs/` — personal field notes with search and topic filtering
- `/insights/` — analytical essays with search and topic filtering
- `/insights/research/` — verified publications and conference record
- `/speaking/` — proposed themes and formats
- `/contact/` — inquiry routes and honest form configuration state
- `/privacy/`, `/editorial-policy/`, `/accessibility/`
- Eleven draft article routes, each marked as editorial preview and excluded from indexing

## Content and publishing controls

Structured content lives in `src/data/`; EJS templates live in `src/templates/`. Article records default to `draft`. A normal production archive does not list drafts, while their direct review pages remain available with a visible approval banner and `noindex`.

Before a public launch:

- confirm portrait reuse permission;
- confirm current professional titles and date-sensitive biographical details;
- approve first-person articles;
- configure and test a real contact endpoint;
- complete the privacy notice for the actual hosting and processing stack;
- set `site.siteUrl` to emit absolute canonical URLs and a sitemap.

The site never simulates a successful contact submission and does not display unsupported impact statistics or testimonials.

