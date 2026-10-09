import { readFile } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import { resolve } from 'node:path';
import type { Connect, Plugin, ResolvedConfig } from 'vite';

type Locale = 'cs' | 'en' | 'ru';
export type LocalRouteDecision =
  | { action: 'next' }
  | { action: 'redirect'; location: string }
  | { action: 'not-found'; locale: Locale };

const locales = ['cs', 'en', 'ru'] as const;
const internalPrefixes = ['/api/', '/@', '/_', '/.astro/', '/src/', '/node_modules/'];

/** Routing for local servers only; deployment routing belongs to the hosting layer. */
export function classifyLocalRoute(rawUrl: string, method = 'GET'): LocalRouteDecision {
  if (method !== 'GET' && method !== 'HEAD') return { action: 'next' };
  let url: URL;
  try {
    url = new URL(rawUrl, 'http://local.invalid');
  } catch {
    return { action: 'not-found', locale: 'cs' };
  }
  if (url.pathname === '/') return { action: 'redirect', location: `/cs/${url.search}` };
  if (internalPrefixes.some((prefix) => url.pathname.startsWith(prefix))) return { action: 'next' };
  const firstSegment = url.pathname.split('/')[1];
  const locale: Locale = locales.includes(firstSegment as Locale) ? (firstSegment as Locale) : 'cs';
  const languagePrefix = locales.includes(firstSegment as Locale);
  // Shared static files and Vite transforms retain their normal handling. A missing
  // page such as /en/missing.html still receives the English error page.
  if (!languagePrefix && /\.[^/]+$/.test(url.pathname)) return { action: 'next' };
  if (/^\/(cs|en|ru)\/(?:privacy\/)?$/.test(url.pathname)) return { action: 'next' };
  if (/^\/(cs|en|ru)(?:\/privacy)?$/.test(url.pathname)) {
    return { action: 'redirect', location: `${url.pathname}/${url.search}` };
  }
  return { action: 'not-found', locale };
}

function redirect(response: ServerResponse, location: string): void {
  response.writeHead(308, { Location: location, 'Cache-Control': 'no-store' });
  response.end();
}

/** Astro writes 200 explicitly when rendering a normal localized /404/ route. */
function enforceNotFoundStatus(response: ServerResponse): void {
  response.statusCode = 404;
  response.writeHead = new Proxy(response.writeHead, {
    apply(target, receiver, args) {
      if (args[0] >= 200 && args[0] < 300) args[0] = 404;
      return Reflect.apply(target, receiver, args);
    },
  });
}

export function localRoutingPlugin(): Plugin {
  let config: ResolvedConfig;
  const middleware =
    (preview: boolean): Connect.NextHandleFunction =>
    async (request: IncomingMessage, response: ServerResponse, next: Connect.NextFunction) => {
      const route = classifyLocalRoute(request.url || '/', request.method);
      if (route.action === 'next') {
        next();
        return;
      }
      if (route.action === 'redirect') {
        redirect(response, route.location);
        return;
      }
      if (!preview) {
        // Rewrite within the existing middleware chain: no self-fetch, extra request,
        // forwarded credentials or recursion. Astro renders its ordinary page layout.
        request.url = `/${route.locale}/404/`;
        enforceNotFoundStatus(response);
        next();
        return;
      }
      try {
        const html = await readFile(
          resolve(config.root, config.build.outDir, route.locale, '404/index.html'),
        );
        response.writeHead(404, {
          'Content-Type': 'text/html; charset=utf-8',
          'Content-Length': String(html.byteLength),
          'Cache-Control': 'no-store',
          'X-Content-Type-Options': 'nosniff',
        });
        response.end(request.method === 'HEAD' ? undefined : html);
      } catch {
        // A missing build must never make an unknown URL look successful.
        response.writeHead(404, {
          'Content-Type': 'text/plain; charset=utf-8',
          'Cache-Control': 'no-store',
        });
        response.end(request.method === 'HEAD' ? undefined : '404');
      }
    };
  return {
    name: 'tvuj-karel-local-routing',
    enforce: 'post',
    configResolved(resolved) {
      config = resolved;
    },
    configureServer(server) {
      // Astro prepends its slash guard during post-configuration. Install after it
      // so unknown URLs without a trailing slash reach the localized 404 as well.
      return () => {
        server.middlewares.stack.unshift({ route: '', handle: middleware(false) });
      };
    },
    configurePreviewServer(server) {
      return () => {
        server.middlewares.stack.unshift({ route: '', handle: middleware(true) });
      };
    },
  };
}
