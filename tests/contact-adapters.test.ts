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
import type { ContactPayload } from '../src/lib/contact';

const payload: ContactPayload = {
  locale: 'ru', name: 'Анна', phone: '+420 777 123 456', email: '',
  location: 'Прага 6', message: 'Помогите настроить принтер.\nDěkuji.', website: '',
};
const body = JSON.stringify(payload);
const event: HttpApiEvent = {
  rawPath: '/api/contact', headers: { origin: 'https://tvujkarel.cz', 'content-type': 'application/json' },
  body, requestContext: { http: { method: 'POST', sourceIp: '192.0.2.1' } },
};

test('Lambda accepts UTF-8 JSON and base64 events and uses trusted source IP for limits', async () => {
  const received: ContactPayload[] = [];
  const handler = createLambdaHandler({
    config: { ...DEFAULT_CONTACT_CONFIG, mode: 'ses', allowedOrigins: ['https://tvujkarel.cz'], rateLimitMax: 2 },
    provider: { send: async data => { received.push(data); return { accepted: true }; } },
  });
  assert.equal((await handler(event)).statusCode, 200);
  assert.equal((await handler({ ...event, body: Buffer.from(body).toString('base64'), isBase64Encoded: true })).statusCode, 200);
  assert.deepEqual(received, [payload, payload]);
  // Forging proxy headers does not bypass API Gateway's source address.
  assert.equal((await handler({ ...event, headers: { ...event.headers, 'x-forwarded-for': '192.0.2.55' } })).statusCode, 429);
});

test('Lambda rejects other routes, malformed base64, invalid UTF-8 and oversized decoding allocations', async () => {
  const handler = createLambdaHandler({
    config: { ...DEFAULT_CONTACT_CONFIG, allowedOrigins: ['https://tvujkarel.cz'], maxBodyBytes: 1_000 },
  });
  assert.equal((await handler({ ...event, rawPath: '/other' })).statusCode, 404);
  assert.equal((await handler({ ...event, body: '!!!!', isBase64Encoded: true })).statusCode, 400);
  assert.equal((await handler({ ...event, body: Buffer.from([0xc3, 0x28]).toString('base64'), isBase64Encoded: true })).statusCode, 400);
  assert.equal((await handler({ ...event, body: 'A'.repeat(2_000), isBase64Encoded: true })).statusCode, 413);
});

test('same-origin API works in Vite dev and static preview with safe disabled default', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'tvujkarel-contact-'));
  try {
    await mkdir(join(dir, 'dist'), { recursive: true });
    await writeFile(join(dir, 'dist/index.html'), '<p>Static preview</p>');
    for (const mode of ['dev', 'preview'] as const) {
      const settings = {
        configFile: false as const, root: dir, envDir: dir, plugins: [contactApiPlugin()],
        server: { host: '127.0.0.1', port: 0 }, preview: { host: '127.0.0.1', port: 0 },
      };
      const server = mode === 'dev' ? await createServer(settings) : await preview(settings);
      if ('listen' in server) await server.listen();
      try {
        const origin = `http://127.0.0.1:${(server.httpServer!.address() as AddressInfo).port}`;
        const response = await fetch(`${origin}/api/contact`, {
          method: 'POST', headers: { origin, 'content-type': 'application/json' }, body,
        });
        assert.equal(response.status, 503, mode);
        assert.deepEqual(await response.json(), { ok: false, code: 'PREVIEW_DISABLED' });
        const blocked = await fetch(`${origin}/api/contact`, {
          method: 'POST', headers: { origin: 'https://evil.example', 'content-type': 'application/json' }, body,
        });
        assert.equal(blocked.status, 403, mode);
        const large = await fetch(`${origin}/api/contact`, {
          method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: 'x'.repeat(21_000),
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
