import assert from 'node:assert/strict';
import { test } from 'node:test';
import { characterCount, validateContact, type ContactPayload } from '../src/lib/contact';
import { contactConfigFromEnv, DEFAULT_CONTACT_CONFIG, type ContactConfig } from '../server/contact-config';
import { createContactHandler, type ContactLogEvent, type ContactRequest, type MailProvider } from '../server/contact-handler';
import { createRateLimiter } from '../server/rate-limit';
import { createSesMessage } from '../server/ses-provider';

const payload: ContactPayload = {
  locale: 'ru',
  name: 'Анна Новак',
  phone: '+420 777 123 456',
  email: 'anna@example.org',
  location: 'Прага 6 — Дейвице',
  message: 'Здравствуйте!\nПомогите подключить принтер к Wi-Fi.\nČeská diakritika: příliš žluťoučký kůň.\n',
  website: '',
};
const config: ContactConfig = {
  ...DEFAULT_CONTACT_CONFIG,
  mode: 'ses',
  allowedOrigins: ['https://tvujkarel.cz'],
  sender: 'web@tvujkarel.cz',
  recipient: 'requests@example.org',
};
const provider: MailProvider = { send: async () => ({ accepted: true }) };
const request = (overrides: Partial<ContactRequest> = {}): ContactRequest => ({
  method: 'POST',
  headers: { origin: 'https://tvujkarel.cz', 'content-type': 'application/json; charset=utf-8' },
  clientAddress: '192.0.2.1',
  body: JSON.stringify(payload),
  ...overrides,
});
const parsedBody = (result: { body: string }) => JSON.parse(result.body);

test('shared validator preserves Cyrillic, diacritics and original message line breaks', () => {
  assert.deepEqual(validateContact(payload), { ok: true, data: payload });
  assert.equal(characterCount('А😀ě'), 3);
  assert.equal(validateContact({ ...payload, name: '😀'.repeat(100) }).ok, true);
  assert.deepEqual(validateContact({ ...payload, name: '😀'.repeat(101) }), { ok: false, fields: { name: 'TOO_LONG' } });
  assert.equal(validateContact({ ...payload, message: '😀'.repeat(3_000) }).ok, true);
  assert.deepEqual(validateContact({ ...payload, message: '😀'.repeat(3_001) }), { ok: false, fields: { message: 'TOO_LONG' } });
});

test('shared validator checks required fields, types, lengths and locale', () => {
  assert.deepEqual(validateContact({ ...payload, locale: 'de', name: 'x', location: '', message: 123 }), {
    ok: false, fields: { locale: 'UNSUPPORTED_LOCALE', name: 'TOO_SHORT', location: 'REQUIRED', message: 'INVALID_FORMAT' },
  });
  const { locale: _locale, ...withoutLocale } = payload;
  assert.deepEqual(validateContact(withoutLocale), { ok: false, fields: { locale: 'REQUIRED' } });
  assert.deepEqual(validateContact({ ...payload, phone: '123', email: 'broken' }), {
    ok: false, fields: { phone: 'TOO_SHORT', email: 'INVALID_FORMAT' },
  });
  assert.deepEqual(validateContact({ ...payload, location: 'ž'.repeat(151) }), { ok: false, fields: { location: 'TOO_LONG' } });
  assert.equal(validateContact({ ...payload, email: '', phone: '+1 (212) 555-0199' }).ok, true);
  assert.equal(validateContact({ ...payload, phone: '+44 20 7946 0958' }).ok, true);
  assert.equal(validateContact({ ...payload, phone: '++420777123456' }).ok, false);
  assert.equal(validateContact({ ...payload, phone: '+1234567890123456' }).ok, false);
});

test('honeypot and email/header/control injection are rejected', () => {
  for (const input of [
    { ...payload, website: 'https://spam.example' },
    { ...payload, email: 'anna@example.org\r\nBcc: stolen@example.org' },
    { ...payload, name: 'Anna\nBcc: someone@example.org' },
    { ...payload, message: 'Message with NUL \u0000 here' },
    { ...payload, message: 'Lone surrogate here \uD800' },
  ]) assert.equal(validateContact(input).ok, false);
});

test('success happens only after provider accepts; original UTF-8 payload is passed through', async () => {
  let accept: ((value: { accepted: boolean }) => void) | undefined;
  let received: ContactPayload | undefined;
  let completed = false;
  const handler = createContactHandler({
    config,
    provider: { send: async data => { received = data; return new Promise(resolve => { accept = resolve; }); } },
  });
  const pending = handler(request()).then(result => { completed = true; return result; });
  await Promise.resolve();
  assert.equal(completed, false);
  assert.deepEqual(received, payload);
  assert.ok(accept);
  accept({ accepted: true });
  const result = await pending;
  assert.equal(result.statusCode, 200);
  assert.deepEqual(parsedBody(result), { ok: true, code: 'ACCEPTED' });
  assert.equal(result.headers['Cache-Control'], 'no-store');
});

test('disabled preview never calls provider and never reports success', async () => {
  let calls = 0;
  const handler = createContactHandler({
    config: { ...config, mode: 'disabled' },
    provider: { send: async () => { calls++; return { accepted: true }; } },
  });
  const result = await handler(request());
  assert.equal(result.statusCode, 503);
  assert.deepEqual(parsedBody(result), { ok: false, code: 'PREVIEW_DISABLED' });
  assert.equal(calls, 0);
});

test('provider failure/unconfirmed acceptance never produces a success', async () => {
  for (const failingProvider of [
    { send: async () => ({ accepted: false }) },
    { send: async () => { throw new Error('Sensitive provider detail anna@example.org'); } },
  ]) {
    const handler = createContactHandler({ config, provider: failingProvider });
    const result = await handler(request());
    assert.equal(result.statusCode, 502);
    assert.deepEqual(parsedBody(result), { ok: false, code: 'DELIVERY_FAILED' });
    assert.ok(!result.body.includes('anna'));
  }
});

test('API rejects invalid input and marks fields without sending', async () => {
  let calls = 0;
  const handler = createContactHandler({ config, provider: { send: async () => { calls++; return { accepted: true }; } } });
  const result = await handler(request({ body: JSON.stringify({ ...payload, locale: 'fr', message: 'short' }) }));
  assert.equal(result.statusCode, 400);
  assert.deepEqual(parsedBody(result), {
    ok: false, code: 'VALIDATION_ERROR', fields: { locale: 'UNSUPPORTED_LOCALE', message: 'TOO_SHORT' },
  });
  assert.equal(calls, 0);
});

test('method and exact allowed origin are mandatory; CORS is never enabled', async () => {
  const handler = createContactHandler({ config, provider });
  const methodResult = await handler(request({ method: 'GET' }));
  assert.equal(methodResult.statusCode, 405);
  assert.equal(methodResult.headers.Allow, 'POST');
  for (const origin of [undefined, 'null', 'https://tvujkarel.cz.evil.example', 'https://tvujkarel.cz/', 'http://tvujkarel.cz']) {
    const result = await handler(request({ headers: { origin, 'content-type': 'application/json' } }));
    assert.equal(result.statusCode, 403);
    assert.equal(parsedBody(result).code, 'ORIGIN_NOT_ALLOWED');
    assert.equal(result.headers['Access-Control-Allow-Origin'], undefined);
  }
});

test('body size is checked in bytes including multibyte UTF-8 and declared size', async () => {
  const body = JSON.stringify(payload);
  const byteLength = new TextEncoder().encode(body).length;
  assert.ok(byteLength > body.length);
  const handler = createContactHandler({ config: { ...config, maxBodyBytes: body.length }, provider });
  const oversized = await handler(request({ body }));
  assert.equal(oversized.statusCode, 413);
  assert.equal(parsedBody(oversized).code, 'PAYLOAD_TOO_LARGE');
  const declared = await createContactHandler({ config, provider })(request({
    headers: { origin: 'https://tvujkarel.cz', 'content-type': 'application/json', 'content-length': '999999' },
  }));
  assert.equal(declared.statusCode, 413);
});

test('malformed JSON/UTF-8 and unsupported content types are rejected', async () => {
  for (const body of ['{', '[]', 'null', '42', Uint8Array.from([0xc3, 0x28])]) {
    const result = await createContactHandler({ config, provider })(request({ body }));
    assert.equal(result.statusCode, 400);
    assert.equal(parsedBody(result).code, 'INVALID_REQUEST');
  }
  const result = await createContactHandler({ config, provider })(request({
    headers: { origin: 'https://tvujkarel.cz', 'content-type': 'text/plain' },
  }));
  assert.equal(result.statusCode, 415);
});

test('rate limiting returns 429 + Retry-After and recovers after the fixed interval', async () => {
  let now = 0;
  const limiter = createRateLimiter({ max: 2, windowMs: 60_000, maxKeys: 2, now: () => now });
  const handler = createContactHandler({ config, provider, limiter });
  assert.equal((await handler(request())).statusCode, 200);
  assert.equal((await handler(request())).statusCode, 200);
  now = 1_000;
  const blocked = await handler(request());
  assert.equal(blocked.statusCode, 429);
  assert.equal(blocked.headers['Retry-After'], '59');
  assert.equal(parsedBody(blocked).code, 'RATE_LIMITED');
  assert.equal((await handler(request({ clientAddress: '192.0.2.2' }))).statusCode, 200);
  // At capacity, unknown keys are blocked rather than evicting existing limits.
  assert.equal((await handler(request({ clientAddress: '192.0.2.3' }))).statusCode, 429);
  now = 60_000;
  assert.equal((await handler(request())).statusCode, 200);
});

test('logs have only technical result codes, never PII, request text or provider errors', async () => {
  const events: ContactLogEvent[] = [];
  const handler = createContactHandler({ config, logger: event => events.push(event), provider: {
    send: async () => { throw new Error(`Failure for ${payload.email}: ${payload.message}`); },
  } });
  await handler(request());
  assert.deepEqual(events, [{ event: 'contact_result', code: 'DELIVERY_FAILED', status: 502 }]);
  for (const value of [payload.name, payload.email, payload.phone, payload.message, '192.0.2.1']) {
    assert.ok(!JSON.stringify(events).includes(value));
  }
});

test('SES uses fixed verified sender, optional reply-to, constant subject and UTF-8 plain text', () => {
  const message = createSesMessage(config, payload);
  assert.equal(message.FromEmailAddress, config.sender);
  assert.deepEqual(message.Destination, { ToAddresses: [config.recipient] });
  assert.deepEqual(message.ReplyToAddresses, [payload.email]);
  assert.equal(message.Content?.Simple?.Body?.Text?.Charset, 'UTF-8');
  assert.ok(message.Content?.Simple?.Body?.Text?.Data?.endsWith(payload.message));
  assert.ok(message.Content?.Simple?.Body?.Text?.Data?.includes('Jazyk webu: ru'));
  assert.equal(message.Content?.Simple?.Body?.Html, undefined);
  assert.equal(createSesMessage(config, { ...payload, email: '' }).ReplyToAddresses, undefined);
});

test('environment is disabled by default and SES requires explicit valid configuration', () => {
  assert.deepEqual(contactConfigFromEnv({}), DEFAULT_CONTACT_CONFIG);
  assert.throws(() => contactConfigFromEnv({ CONTACT_MODE: 'ses' }), /CONTACT_ALLOWED_ORIGINS/);
  assert.throws(() => contactConfigFromEnv({ CONTACT_MODE: 'pretend' }), /CONTACT_MODE/);
  assert.throws(() => contactConfigFromEnv({ CONTACT_RATE_LIMIT_MAX: '0' }), /CONTACT_RATE_LIMIT_MAX/);
  assert.throws(() => contactConfigFromEnv({ CONTACT_ALLOWED_ORIGINS: 'https://tvujkarel.cz/' }), /CONTACT_ALLOWED_ORIGINS/);
  assert.throws(() => contactConfigFromEnv({ CONTACT_MODE: 'ses', CONTACT_ALLOWED_ORIGINS: 'https://tvujkarel.cz', CONTACT_SENDER: 'a@example.org\nBcc: b@example.org' }), /CONTACT_SENDER/);
  const configured = contactConfigFromEnv({
    CONTACT_MODE: 'ses', CONTACT_ALLOWED_ORIGINS: 'https://tvujkarel.cz,http://localhost:4321',
    CONTACT_SENDER: config.sender, CONTACT_RECIPIENT: config.recipient,
  });
  assert.equal(configured.mode, 'ses');
  assert.equal(configured.sesRegion, 'eu-central-1');
  assert.equal(configured.allowedOrigins.length, 2);
});
