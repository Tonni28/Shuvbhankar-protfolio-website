import { access, readFile, readdir } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { buildSite } from './build.mjs';
import { normalizeBasePath, routeToOutputPath } from './helpers.mjs';

async function walk(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    const target = path.join(directory, entry.name);
    if (entry.isDirectory()) files.push(...await walk(target));
    else files.push(target);
  }
  return files;
}

export async function validateSite({ build = true } = {}) {
  const result = build ? await buildSite({ silent: true }) : await buildSite({ silent: true });
  const { distDir, pages, site } = result;
  const knownRoutes = new Set(pages.map((page) => page.route));
  const basePath = normalizeBasePath(site.basePath);
  const errors = [];

  for (const page of pages) {
    const file = routeToOutputPath(distDir, page.route);
    try {
      await access(file);
    } catch {
      errors.push(`Missing generated file for ${page.route}`);
      continue;
    }

    const html = await readFile(file, 'utf8');
    if (html.includes('[object Promise]')) {
      errors.push(`${page.route} contains an unresolved template value.`);
    }
    if (!/<title>[^<]+<\/title>/.test(html)) {
      errors.push(`${page.route} is missing a populated title.`);
    }
    for (const match of html.matchAll(/href=["']([^"'#?]+)["']/g)) {
      const href = match[1];
      if (/^(https?:|mailto:|tel:)/.test(href)) continue;
      let local = href;
      if (basePath !== '/' && local.startsWith(basePath)) local = `/${local.slice(basePath.length)}`;
      if (local.startsWith('/assets/') || /\.[a-z0-9]+$/i.test(local)) continue;
      if (!local.endsWith('/')) local += '/';
      if (!knownRoutes.has(local)) errors.push(`${page.route} links to missing route ${href}`);
    }
  }

  const generated = await walk(distDir);
  if (generated.some((file) => file.endsWith('.ejs'))) errors.push('dist/ contains an EJS source file.');
  if (errors.length) throw new Error(`Validation failed:\n- ${errors.join('\n- ')}`);
  console.log(`Validated ${pages.length} routes and ${generated.length} generated files.`);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  validateSite().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
