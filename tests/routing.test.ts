import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createServer, preview, type Connect, type Plugin } from 'vite';
import { classifyLocalRoute, localRoutingPlugin } from '../server/local-routing';
import { parsePreviewArgs } from '../scripts/preview';

test('preview CLI accepts standard host/port flags and rejects malformed ports', () => {
  assert.deepEqual(parsePreviewArgs([]), { host: '127.0.0.1', port: 4321 });
  assert.deepEqual(parsePreviewArgs(['--host', '127.0.0.1', '--port', '4322']), {
    host: '127.0.0.1',
    port: 4322,
  });
  assert.deepEqual(parsePreviewArgs(['--host=localhost', '--port=4322']), {
    host: 'localhost',
    port: 4322,
  });
  assert.deepEqual(parsePreviewArgs(['--host']), { host: '0.0.0.0', port: 4321 });
  for (const value of ['-1', '65536', 'broken'])
    assert.throws(() => parsePreviewArgs(['--port', value]), /Invalid --port/);
});

test('local routing redirects root and known bare routes while preserving query values', () => {
  assert.deepEqual(classifyLocalRoute('/?utm_source=test&value=%D0%B0'), {
    action: 'redirect',
    location: '/cs/?utm_source=test&value=%D0%B0',
  });
  assert.deepEqual(classifyLocalRoute('/en'), { action: 'redirect', location: '/en/' });
  assert.deepEqual(classifyLocalRoute('/ru/privacy?x=1'), {
    action: 'redirect',
    location: '/ru/privacy/?x=1',
  });
  assert.deepEqual(classifyLocalRoute('/', 'POST'), { action: 'next' });
});

test('only exact localized page routes pass; unknown URLs select language by a full segment', () => {
  for (const locale of ['cs', 'en', 'ru']) {
    for (const path of [`/${locale}/`, `/${locale}/privacy/`])
      assert.deepEqual(classifyLocalRoute(path), { action: 'next' });
    for (const path of [
      `/${locale}/unknown`,
      `/${locale}/unknown/`,
      `/${locale}/unknown.html`,
      `/${locale}/404/`,
    ]) {
      assert.deepEqual(classifyLocalRoute(path), { action: 'not-found', locale });
    }
  }
  for (const path of ['/de/', '/enquiry/', '/russian/', '/missing']) {
    assert.deepEqual(classifyLocalRoute(path), { action: 'not-found', locale: 'cs' });
  }
});

test('API, static assets and Vite internals retain their own handling', () => {
  for (const path of [
    '/api/contact',
    '/_astro/main.js',
    '/@vite/client',
    '/@fs/tmp/file',
    '/__vite_ping',
    '/src/style.css',
    '/node_modules/test/index.js',
    '/.astro/content-assets.mjs',
    '/images/hero.webp',
    '/favicon.svg',
    '/robots.txt',
    '/sitemap.xml',
  ]) {
    assert.deepEqual(classifyLocalRoute(path), { action: 'next' }, path);
  }
});

test('dev and preview return real redirects and localized 404s, including HEAD and missing slashes', async () => {
  const root = await mkdtemp(join(tmpdir(), 'tvujkarel-routing-'));
  try {
    for (const locale of ['cs', 'en', 'ru']) {
      await mkdir(join(root, 'dist', locale, '404'), { recursive: true });
      await writeFile(
        join(root, 'dist', locale, '404/index.html'),
        `<html lang="${locale}"><h1>${locale} missing</h1></html>`,
      );
    }
    const astroSimulator: Plugin = {
      name: 'astro-style-renderer',
      configureServer(server) {
        return () => {
          // Like Astro, insert a slash guard before user middleware and explicitly
          // return status 200 from the rendered /locale/404/ page.
          server.middlewares.stack.unshift({
            route: '',
            handle: (req: IncomingMessage, res: ServerResponse, next: Connect.NextFunction) => {
              if (!req.url?.endsWith('/')) {
                res.writeHead(404);
                res.end('generic slash error');
                return;
              }
              next();
            },
          });
          server.middlewares.use((req, res) => {
            const locale = req.url?.split('/')[1];
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(`<html lang="${locale}"><h1>${locale} missing</h1></html>`);
          });
        };
      },
    };
    for (const mode of ['dev', 'preview']) {
      const settings = {
        root,
        appType: 'custom' as const,
        configFile: false as const,
        plugins: [astroSimulator, localRoutingPlugin()],
        server: { port: 0, host: '127.0.0.1' },
        preview: { port: 0, host: '127.0.0.1' },
      };
      const server = mode === 'dev' ? await createServer(settings) : await preview(settings);
      if ('listen' in server) await server.listen();
      try {
        const origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
        const rootResponse = await fetch(`${origin}/?ref=local`, { redirect: 'manual' });
        assert.equal(rootResponse.status, 308, mode);
        assert.equal(rootResponse.headers.get('location'), '/cs/?ref=local');
        for (const [path, locale] of [
          ['/en/missing', 'en'],
          ['/ru/missing/', 'ru'],
          ['/de/no-page', 'cs'],
          ['/cs/404/', 'cs'],
        ]) {
          const result = await fetch(`${origin}${path}`);
          assert.equal(result.status, 404, `${mode} ${path}`);
          const html = await result.text();
          assert.ok(html.includes(`lang="${locale}"`), `${mode} ${path}: ${html}`);
        }
        const headResponse = await fetch(`${origin}/en/missing`, { method: 'HEAD' });
        assert.equal(headResponse.status, 404);
        assert.equal(await headResponse.text(), '');
      } finally {
        await server.close();
      }
    }
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});
