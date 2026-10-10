import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { Resolver } from 'node:dns/promises';
import { request as httpRequest } from 'node:http';
import { request as httpsRequest } from 'node:https';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
const base = 'https://tvujkarel.cz';
const checks = [];
const publicDns = process.argv.includes('--public-dns');
const resolver = new Resolver();
resolver.setServers(['1.1.1.1', '8.8.8.8']);
// During NS migration, an OS/ISP resolver can retain the former delegation.
// This optional mode uses public recursive DNS, retaining normal Host/SNI and TLS checks.
async function getResponse(url, options = {}) {
  if (!publicDns) return fetch(url, { redirect: 'manual', ...options });
  const target = new URL(url);
  return new Promise((resolveResponse, reject) => {
    const request = (target.protocol === 'https:' ? httpsRequest : httpRequest)(
      target,
      {
        method: options.method || 'GET',
        headers: options.headers,
        lookup: (hostname, settings, done) => {
          resolver.resolve4(hostname).then((addresses) => {
            if (settings.all)
              done(
                null,
                addresses.map((address) => ({ address, family: 4 })),
              );
            else done(null, addresses[0], 4);
          }, done);
        },
      },
      (response) => {
        const chunks = [];
        response.on('data', (chunk) => chunks.push(chunk));
        response.on('error', reject);
        response.on('end', () =>
          resolveResponse(
            new Response(Buffer.concat(chunks), {
              status: response.statusCode,
              headers: Object.fromEntries(
                Object.entries(response.headers).map(([name, value]) => [
                  name,
                  Array.isArray(value) ? value.join(', ') : value || '',
                ]),
              ),
            }),
          ),
        );
      },
    );
    request.setTimeout(20_000, () => request.destroy(new Error('Verification request timed out')));
    request.on('error', reject);
    request.end(options.body);
  });
}
async function check(path, status, options = {}) {
  const response = await getResponse(new URL(path, base), options);
  assert.equal(response.status, status, path);
  checks.push({ path, method: options.method || 'GET', status: response.status });
  return response;
}
assert.equal(
  (await check('/?ref=deploy&v=%D0%B0', 308)).headers.get('location'),
  `${base}/cs/?ref=deploy&v=%D0%B0`,
);
assert.equal(
  (await check('https://www.tvujkarel.cz/en/?ref=deploy', 308)).headers.get('location'),
  `${base}/en/?ref=deploy`,
);
assert.equal((await check('http://tvujkarel.cz/cs/', 301)).headers.get('location'), `${base}/cs/`);
for (const locale of ['cs', 'en', 'ru']) {
  assert.equal((await check(`/${locale}`, 308)).headers.get('location'), `${base}/${locale}/`);
  for (const path of [`/${locale}/`, `/${locale}/privacy/`]) {
    const response = await check(path, 200);
    assert.match(response.headers.get('x-robots-tag') || '', /noindex/);
    assert.match(response.headers.get('strict-transport-security') || '', /max-age=/);
    const html = await response.text();
    assert.match(html, new RegExp(`lang="${locale}"`));
    const localFile = `dist${path}index.html`;
    if (existsSync(localFile)) {
      const hash = (value) => createHash('sha256').update(value).digest('hex');
      assert.equal(hash(html), hash(readFileSync(localFile)), `Published build mismatch: ${path}`);
    }
  }
  assert.match(
    await (await check(`/${locale}/missing`, 404)).text(),
    new RegExp(`lang="${locale}"`),
  );
}
await check('/de/', 404);
await check('/images/missing.webp', 404);
await check('/ru/missing', 404, { method: 'HEAD' });
assert.match(await (await check('/robots.txt', 200)).text(), /Disallow: \/$/m);
await check('/sitemap.xml', 200);
const payload = {
  locale: 'ru',
  name: 'Deployment check',
  phone: '+420777123456',
  email: '',
  location: 'Test',
  message: 'Automated preview check — проверка; no delivery.',
  website: '',
};
for (let attempt = 0; attempt < 2; attempt++) {
  const response = await check('/api/contact', 503, {
    method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal((await response.json()).code, 'PREVIEW_DISABLED');
  assert.doesNotMatch(response.headers.get('x-cache') || '', /^Hit/);
}
if (existsSync('.deployment/outputs.json')) {
  const outputs = JSON.parse(readFileSync('.deployment/outputs.json', 'utf8')).TvujKarelHosting;
  const response = await getResponse(`${outputs.ApiUrl}/api/contact`, {
    method: 'POST',
    headers: { Origin: base, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  assert.equal(
    response.status,
    403,
    'Direct API access must reject requests without CloudFront origin token',
  );
  checks.push({ path: 'direct API', method: 'POST', status: response.status });
}
writeFileSync(
  '.deployment/verification.json',
  JSON.stringify(
    {
      verifiedAt: new Date().toISOString(),
      mode: 'preview',
      dnsResolver: publicDns ? 'Cloudflare/Google public recursive DNS' : 'system resolver',
      checks,
    },
    null,
    2,
  ) + '\n',
);
console.log(`Verified ${checks.length} live preview checks; contact delivery stays disabled.`);
