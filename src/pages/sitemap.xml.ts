import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
import { locales, pagePath } from '../i18n';
export const GET: APIRoute = () => {
  const absoluteUrl = (path: string) => new URL(path, siteConfig.canonicalUrl).href;
  const urls = (['home', 'privacy'] as const).flatMap((page) =>
    locales.map(
      (locale) =>
        `<url><loc>${absoluteUrl(pagePath(locale, page))}</loc>${locales.map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${absoluteUrl(pagePath(l, page))}" />`).join('')}<xhtml:link rel="alternate" hreflang="x-default" href="${absoluteUrl(pagePath('cs', page))}" /></url>`,
    ),
  );
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls.join('')}</urlset>`,
    { headers: { 'Content-Type': 'application/xml' } },
  );
};
