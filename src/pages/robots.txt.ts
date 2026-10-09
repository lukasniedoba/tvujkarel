import type { APIRoute } from 'astro';
import { siteConfig } from '../config/site';
export const GET:APIRoute=()=>new Response(siteConfig.production?`User-agent: *\nAllow: /\nSitemap: ${siteConfig.canonicalUrl}/sitemap.xml\n`:'User-agent: *\nDisallow: /\n',{headers:{'Content-Type':'text/plain'}});
