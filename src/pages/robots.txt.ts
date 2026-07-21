import type { APIRoute } from 'astro';

const siteUrl = (import.meta.env.SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://www.listwinventures.com';

export const GET: APIRoute = () => {
  const body = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
Host: ${siteUrl.replace(/^https?:\/\//, '')}
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
