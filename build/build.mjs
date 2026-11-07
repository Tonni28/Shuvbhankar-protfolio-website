import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import ejs from 'ejs';
import { createHelpers, normalizeRoute, routeToOutputPath } from './helpers.mjs';

const buildDir = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(buildDir, '..');
const srcDir = path.join(rootDir, 'src');
const distDir = path.join(rootDir, 'dist');

async function readJson(relativePath) {
  return JSON.parse(await readFile(path.join(srcDir, 'data', relativePath), 'utf8'));
}

async function copyIfPresent(source, destination) {
  try {
    await cp(source, destination, { recursive: true });
  } catch (error) {
    if (error.code !== 'ENOENT') throw error;
  }
}

export async function buildSite({ silent = false, previewDrafts = process.env.SITE_PREVIEW_DRAFTS === 'true' } = {}) {
  const [site, navigation, configuredPages, articles, publications] = await Promise.all([
    readJson('site.json'),
    readJson('navigation.json'),
    readJson('pages.json'),
    readJson('articles.json'),
    readJson('publications.json')
  ]);

  const visibleArticles = articles.filter((article) => previewDrafts || article.status === 'published');
  const articlePages = articles.map((article) => ({
    route: article.route,
    template: 'article',
    title: article.title,
    description: article.description,
    navigationLabel: '',
    noindex: article.status !== 'published',
    data: { article }
  }));
  const pages = [...configuredPages, ...articlePages];

  if (!Array.isArray(pages) || pages.length === 0) {
    throw new Error('src/data/pages.json must contain at least one page.');
  }

  const seenRoutes = new Set();
  for (const page of pages) {
    page.route = normalizeRoute(page.route);
    if (seenRoutes.has(page.route)) throw new Error(`Duplicate route: ${page.route}`);
    seenRoutes.add(page.route);
    if (!/^[a-z0-9-]+$/i.test(page.template)) {
      throw new Error(`Invalid template name for ${page.route}`);
    }
  }

  await rm(distDir, { recursive: true, force: true });
  await mkdir(distDir, { recursive: true });
  await Promise.all([
    copyIfPresent(path.join(srcDir, 'assets'), path.join(distDir, 'assets')),
    copyIfPresent(path.join(srcDir, 'static'), distDir)
  ]);

  const helpers = createHelpers(site);
  const layoutPath = path.join(srcDir, 'templates', 'layouts', 'base.ejs');

  for (const page of pages) {
    const templatePath = path.join(srcDir, 'templates', 'pages', `${page.template}.ejs`);
    let pageSource;
    try {
      pageSource = await readFile(templatePath, 'utf8');
    } catch (error) {
      if (error.code === 'ENOENT') throw new Error(`Missing page template: ${page.template}.ejs`);
      throw error;
    }

    const shared = {
      site,
      navigation,
      pages,
      articles: visibleArticles,
      publications,
      previewDrafts,
      page,
      ...helpers
    };
    const body = ejs.render(pageSource, shared, { filename: templatePath });
    const html = await ejs.renderFile(layoutPath, { ...shared, body });
    const outputPath = routeToOutputPath(distDir, page.route);
    await mkdir(path.dirname(outputPath), { recursive: true });
    await writeFile(outputPath, `${html.trim()}\n`, 'utf8');
  }

  const notFoundPage = pages.find((page) => page.route === '/not-found/');
  if (notFoundPage) {
    const notFoundHtml = await readFile(routeToOutputPath(distDir, notFoundPage.route), 'utf8');
    await writeFile(path.join(distDir, '404.html'), notFoundHtml, 'utf8');
  }

  if (site.siteUrl) {
    const sitemap = pages
      .filter((page) => !page.noindex)
      .map((page) => `  <url><loc>${helpers.absoluteUrl(page.route)}</loc></url>`)
      .join('\n');
    await writeFile(
      path.join(distDir, 'sitemap.xml'),
      `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemap}\n</urlset>\n`,
      'utf8'
    );
  }

  if (!silent) console.log(`Built ${pages.length} routes in dist/`);
  return { distDir, pages, site, previewDrafts };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  buildSite().catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  });
}
