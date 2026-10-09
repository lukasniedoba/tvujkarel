import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, rm } from 'node:fs/promises';
import type { AddressInfo } from 'node:net';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createServer, preview } from 'vite';
import { DEFAULT_CONTACT_CONFIG } from '../server/contact-config';
import { createLambdaHandler, type HttpApiEvent } from '../server/lambda';
import { contactApiPlugin } from '../server/vite-contact';
import { startLocalPreview } from '../scripts/preview';
import type { ContactPayload } from '../src/lib/contact';

const payload: ContactPayload = {
  locale: 'ru',
  name: 'Анна',
  phone: '+420 777 123 456',
  email: '',
  location: 'Прага 6',
  message: 'Помогите настроить принтер.\nDěkuji.',
  website: '',
};
const body = JSON.stringify(payload);
const event: HttpApiEvent = {
  rawPath: '/api/contact',
  headers: { origin: 'https://tvujkarel.cz', 'content-type': 'application/json' },
  body,
  requestContext: { http: { method: 'POST', sourceIp: '192.0.2.1' } },
};

test('Lambda accepts UTF-8 JSON and base64 events and uses trusted source IP for limits', async () => {
  const received: ContactPayload[] = [];
  const handler = createLambdaHandler({
    config: {
      ...DEFAULT_CONTACT_CONFIG,
      mode: 'ses',
      allowedOrigins: ['https://tvujkarel.cz'],
      rateLimitMax: 2,
    },
    provider: {
      send: async (data) => {
        received.push(data);
        return { accepted: true };
      },
    },
  });
  assert.equal((await handler(event)).statusCode, 200);
  assert.equal(
    (await handler({ ...event, body: Buffer.from(body).toString('base64'), isBase64Encoded: true }))
      .statusCode,
    200,
  );
  assert.deepEqual(received, [payload, payload]);
  // Forging proxy headers does not bypass API Gateway's source address.
  assert.equal(
    (await handler({ ...event, headers: { ...event.headers, 'x-forwarded-for': '192.0.2.55' } }))
      .statusCode,
    429,
  );
});

test('Lambda rejects other routes, malformed base64, invalid UTF-8 and oversized decoding allocations', async () => {
  const handler = createLambdaHandler({
    config: {
      ...DEFAULT_CONTACT_CONFIG,
      allowedOrigins: ['https://tvujkarel.cz'],
      maxBodyBytes: 1_000,
    },
  });
  assert.equal((await handler({ ...event, rawPath: '/other' })).statusCode, 404);
  assert.equal((await handler({ ...event, body: '!!!!', isBase64Encoded: true })).statusCode, 400);
  assert.equal(
    (
      await handler({
        ...event,
        body: Buffer.from([0xc3, 0x28]).toString('base64'),
        isBase64Encoded: true,
      })
    ).statusCode,
    400,
  );
  assert.equal(
    (await handler({ ...event, body: 'A'.repeat(2_000), isBase64Encoded: true })).statusCode,
    413,
  );
});

test('same-origin API works in Vite dev and static preview with safe disabled default', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tvujkarel-contact-'));
  try {
    await mkdir(join(dir, 'dist'), { recursive: true });
    await writeFile(join(dir, 'dist/index.html'), '<p>Static preview</p>');
    for (const mode of ['dev', 'preview'] as const) {
      const settings = {
        configFile: false as const,
        root: dir,
        envDir: dir,
        plugins: [contactApiPlugin()],
        server: { host: '127.0.0.1', port: 0 },
        preview: { host: '127.0.0.1', port: 0 },
      };
      const server = mode === 'dev' ? await createServer(settings) : await preview(settings);
      if ('listen' in server) await server.listen();
      try {
        const origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
        const response = await fetch(`${origin}/api/contact`, {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body,
        });
        assert.equal(response.status, 503, mode);
        assert.deepEqual(await response.json(), { ok: false, code: 'PREVIEW_DISABLED' });
        const blocked = await fetch(`${origin}/api/contact`, {
          method: 'POST',
          headers: { origin: 'https://evil.example', 'content-type': 'application/json' },
          body,
        });
        assert.equal(blocked.status, 403, mode);
        const large = await fetch(`${origin}/api/contact`, {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body: 'x'.repeat(21_000),
        });
        assert.equal(large.status, 413, mode);
      } finally {
        await server.close();
      }
    }
  } finally {
    await rm(dir, { recursive: true, force: true });
  }
});

test('actual Astro dev and the project preview entry point preserve API + local routing integration', async () => {
  // Override even an explicitly configured local SES .env during this test.
  const overrides = {
    ASTRO_TELEMETRY_DISABLED: '1',
    ASTRO_DISABLE_UPDATE_CHECK: 'true',
    CONTACT_MODE: 'disabled',
    CONTACT_ALLOWED_ORIGINS: '',
    CONTACT_MAX_BODY_BYTES: '20480',
    CONTACT_RATE_LIMIT_MAX: '5',
    CONTACT_RATE_LIMIT_WINDOW_MS: '600000',
    CONTACT_RATE_LIMIT_MAX_KEYS: '10000',
  };
  const previous = Object.fromEntries(Object.keys(overrides).map((key) => [key, process.env[key]]));
  Object.assign(process.env, overrides);
  const dir = await mkdtemp(join(tmpdir(), 'tvujkarel-project-preview-'));
  try {
    for (const locale of ['cs', 'en', 'ru']) {
      await mkdir(join(dir, 'dist', locale, '404'), { recursive: true });
      await writeFile(
        join(dir, 'dist', locale, '404/index.html'),
        `<html lang="${locale}"><h1>404</h1></html>`,
      );
    }
    const { dev } = await import('astro');
    const development = await dev({
      root: process.cwd(),
      logLevel: 'error',
      server: { host: '127.0.0.1', port: 0 },
    });
    const staticPreview = await startLocalPreview({ root: dir, host: '127.0.0.1', port: 0 });
    try {
      const origins = [
        `http://127.0.0.1:${development.address.port}`,
        `http://127.0.0.1:${(staticPreview.httpServer.address() as AddressInfo).port}`,
      ];
      for (const origin of origins) {
        const result = await fetch(`${origin}/api/contact`, {
          method: 'POST',
          headers: { origin, 'content-type': 'application/json' },
          body,
        });
        assert.equal(result.status, 503, origin);
        assert.deepEqual(await result.json(), { ok: false, code: 'PREVIEW_DISABLED' });
        const redirect = await fetch(`${origin}/?ref=integration`, { redirect: 'manual' });
        assert.equal(redirect.status, 308);
        assert.equal(redirect.headers.get('location'), '/cs/?ref=integration');
        const notFound = await fetch(`${origin}/ru/not-a-real-page`);
        assert.equal(notFound.status, 404);
        assert.match(await notFound.text(), /<html[^>]*lang="ru"/);
      }
    } finally {
      await development.stop();
      await staticPreview.close();
    }
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
    await rm(dir, { recursive: true, force: true });
  }
});
