import type { APIRoute } from 'astro';

const siteUrl = (import.meta.env.SITE_URL as string | undefined)?.replace(/\/$/, '') || 'https://listwinventures.com';

export const GET: APIRoute = () => {
  const body = `Site: ${siteUrl}
Owner: Listwin Ventures
Contact: ${siteUrl}/contact
Sitemap: ${siteUrl}/sitemap.xml
Robots: ${siteUrl}/robots.txt
Updated: ${new Date().toISOString()}

Usage: Public browsing and citation are permitted with attribution; do not use the content to imply endorsement. Respect robots.txt and do not circumvent rate limits.
Restricted: ${siteUrl}/cv is private share-only CV content and must not be indexed, summarized, or used for training.
`;

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
    },
  });
};
