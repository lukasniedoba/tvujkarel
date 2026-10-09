import type { IncomingMessage, ServerResponse } from 'node:http';
import { loadEnv, type Plugin, type ResolvedConfig } from 'vite';
import { contactConfigFromEnv, type ContactConfig } from './contact-config';
import { contactResponse, createContactHandler, type ContactHttpResponse } from './contact-handler';
import { createRateLimiter } from './rate-limit';
import { createSesProvider } from './ses-provider';

class PayloadTooLarge extends Error {}

function readBody(request: IncomingMessage, maximum: number): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    let size = 0;
    const chunks: Buffer[] = [];
    const cleanup = () => {
      request.off('data', onData);
      request.off('end', onEnd);
      request.off('error', onError);
      request.off('aborted', onAborted);
    };
    const onData = (chunk: Buffer) => {
      size += chunk.byteLength;
      if (size > maximum) {
        cleanup();
        chunks.length = 0;
        request.resume();
        reject(new PayloadTooLarge());
        return;
      }
      chunks.push(chunk);
    };
    const onEnd = () => { cleanup(); resolve(Buffer.concat(chunks, size)); };
    const onError = () => { cleanup(); reject(new Error('Request stream failed')); };
    const onAborted = () => { cleanup(); reject(new Error('Request aborted')); };
    request.on('data', onData);
    request.on('end', onEnd);
    request.on('error', onError);
    request.on('aborted', onAborted);
  });
}

function respond(response: ServerResponse, result: ContactHttpResponse): void {
  response.writeHead(result.statusCode, result.headers);
  response.end(result.body);
}

function localOrigin(request: IncomingMessage): string | undefined {
  const origin = request.headers.origin;
  if (typeof origin !== 'string') return;
  try {
    const parsed = new URL(origin);
    if (parsed.origin === origin && parsed.protocol === 'http:'
      && ['localhost', '127.0.0.1', '[::1]'].includes(parsed.hostname)
      && parsed.host === request.headers.host) return origin;
  } catch { /* invalid origin remains blocked */ }
}

/** Reuses the Lambda's validation/transport for both Astro dev and static preview. */
export function contactApiPlugin(): Plugin {
  let viteConfig: ResolvedConfig;
  let config: ContactConfig;
  const install = (server: { middlewares: { use: (middleware: (request: IncomingMessage, response: ServerResponse, next: () => void) => void) => void } }) => {
    config = contactConfigFromEnv({ ...loadEnv(viteConfig.mode, viteConfig.envDir, ''), ...process.env });
    const provider = config.mode === 'ses' ? createSesProvider(config) : undefined;
    const limiter = createRateLimiter({ max: config.rateLimitMax, windowMs: config.rateLimitWindowMs, maxKeys: config.rateLimitMaxKeys });
    server.middlewares.use(async (request, response, next) => {
      if (request.url?.split('?')[0] !== '/api/contact') { next(); return; }
      try {
        const contentLength = request.headers['content-length'];
        if (contentLength && (!/^\d+$/.test(contentLength) || Number(contentLength) > config.maxBodyBytes)) {
          request.resume();
          respond(response, contactResponse(413, { ok: false, code: 'PAYLOAD_TOO_LARGE' }));
          return;
        }
        const inferredOrigin = config.mode === 'disabled' && !config.allowedOrigins.length ? localOrigin(request) : undefined;
        const handle = createContactHandler({
          config: inferredOrigin ? { ...config, allowedOrigins: [inferredOrigin] } : config,
          provider,
          limiter,
        });
        const headers = Object.fromEntries(Object.entries(request.headers).map(([key, value]) => [key, Array.isArray(value) ? value.join(',') : value]));
        const result = await handle({
          method: request.method || '',
          headers,
          body: await readBody(request, config.maxBodyBytes),
          // Never trust user-supplied X-Forwarded-For in the local development server.
          clientAddress: request.socket.remoteAddress || 'unknown',
        });
        respond(response, result);
      } catch (error) {
        if (!response.headersSent && !response.destroyed) {
          respond(response, contactResponse(error instanceof PayloadTooLarge ? 413 : 400, {
            ok: false,
            code: error instanceof PayloadTooLarge ? 'PAYLOAD_TOO_LARGE' : 'INVALID_REQUEST',
          }));
        }
      }
    });
  };
  return {
    name: 'tvuj-karel-contact-api',
    configResolved(resolved) { viteConfig = resolved; },
    configureServer: install,
    configurePreviewServer: install,
  };
}
