import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
export const GET: APIRoute = () =>
  new Response(
    siteConfig.production
      ? `User-agent: *\nAllow: /\nSitemap: ${new URL('/sitemap.xml', siteConfig.canonicalUrl).href}\n`
      : 'User-agent: *\nDisallow: /\n',
    { headers: { 'Content-Type': 'text/plain' } },
  );
