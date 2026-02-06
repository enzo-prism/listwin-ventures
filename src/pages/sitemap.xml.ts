import type { APIRoute } from 'astro';
import { getEntityDetails, getDetailPath } from '../data/entityDetails';
import { getExploitDetails, getExploitPath } from '../data/exploitDetails';

const siteUrl = (import.meta.env.SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://listwinventures.com';

const staticRoutes = [
  '/',
  '/4ag',
  '/belizekids',
  '/contact',
  '/cookie-policy',
  '/genologics',
  '/oral-history',
  '/press',
  '/privacy-policy',
  '/zevx-closes-20m-funding-round-appoints-don-listwin-as-ceo',
];

const getCompanyRoutes = () =>
  getEntityDetails()
    .map((detail) => getDetailPath(detail.slug))
    .filter((path): path is string => Boolean(path));

const getExploitRoutes = () =>
  getExploitDetails()
    .map((detail) => getExploitPath(detail.slug))
    .filter((path): path is string => Boolean(path));

const toUrl = (path: string) => `${siteUrl}${path}`;

export const GET: APIRoute = () => {
  const paths = Array.from(new Set([...staticRoutes, ...getCompanyRoutes(), ...getExploitRoutes()]));
  const lastmod = new Date().toISOString();

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${paths
  .map(
    (path) => `  <url>
    <loc>${toUrl(path)}</loc>
    <lastmod>${lastmod}</lastmod>
  </url>`
  )
  .join('\n')}
</urlset>`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
    },
  });
};
