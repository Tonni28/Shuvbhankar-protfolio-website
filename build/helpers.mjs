import path from 'node:path';

export function normalizeBasePath(value = '/') {
  const trimmed = String(value).trim();
  if (!trimmed || trimmed === '/') return '/';
  return `/${trimmed.replace(/^\/+|\/+$/g, '')}/`;
}

export function normalizeRoute(value) {
  if (typeof value !== 'string' || !value.trim()) {
    throw new Error('Every page route must be a non-empty string.');
  }

  const route = value.trim().replace(/\\/g, '/');
  if (!route.startsWith('/') || route.includes('..') || /^[a-zA-Z]:/.test(route)) {
    throw new Error(`Unsafe route: ${value}`);
  }

  const normalized = path.posix.normalize(route);
  if (normalized === '/') return '/';
  return `/${normalized.replace(/^\/+|\/+$/g, '')}/`;
}

export function createHelpers(site) {
  const basePath = normalizeBasePath(site.basePath);
  const withBase = (value = '') => {
    const clean = String(value).replace(/^\/+/, '');
    return basePath === '/' ? `/${clean}` : `${basePath}${clean}`;
  };

  const urlFor = (route = '/') => {
    const normalized = normalizeRoute(route);
    return normalized === '/' ? basePath : withBase(normalized);
  };

  const asset = (assetPath) => withBase(assetPath);
  const absoluteUrl = (route = '/') => {
    if (!site.siteUrl) return '';
    return new URL(urlFor(route), site.siteUrl).href;
  };

  return { asset, urlFor, absoluteUrl, basePath };
}

export function routeToOutputPath(distDir, route) {
  const normalized = normalizeRoute(route);
  if (normalized === '/') return path.join(distDir, 'index.html');
  return path.join(distDir, ...normalized.split('/').filter(Boolean), 'index.html');
}
