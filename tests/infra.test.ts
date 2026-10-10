import assert from 'node:assert/strict';
import { readFileSync, statSync } from 'node:fs';
import { runInNewContext } from 'node:vm';
import { test } from 'node:test';
import { trustedCloudFrontEvent } from '../server/aws-entry';

const code = readFileSync('infra/edge.js', 'utf8');
function edge(uri: string, host = 'tvujkarel.cz', querystring = {}) {
  return runInNewContext(`${code}; handler(event)`, {
    event: {
      request: {
        uri,
        method: 'GET',
        headers: { host: { value: host }, 'x-tvujkarel-client-ip': { value: 'spoofed' } },
        querystring,
      },
      viewer: { ip: '203.0.113.2' },
    },
  });
}
test('CloudFront routing preserves encoded/repeated queries, maps pages, and serves real localized 404s', () => {
  assert.ok(statSync('infra/edge.js').size < 10_000);
  assert.equal(
    edge('/', 'tvujkarel.cz', { ref: { multiValue: [{ value: '%D0%B0' }, { value: 'second' }] } })
      .headers.location.value,
    'https://tvujkarel.cz/cs/?ref=%D0%B0&ref=second',
  );
  assert.equal(
    edge('/en/privacy/', 'www.tvujkarel.cz').headers.location.value,
    'https://tvujkarel.cz/en/privacy/',
  );
  for (const locale of ['cs', 'en', 'ru']) {
    assert.equal(edge(`/${locale}/`).uri, `/${locale}/index.html`);
    assert.equal(edge(`/${locale}/privacy/`).uri, `/${locale}/privacy/index.html`);
    assert.equal(edge(`/${locale}`).statusCode, 308);
    for (const path of ['404/', 'unknown', 'unknown.html']) {
      const response = edge(`/${locale}/${path}`);
      assert.equal(response.statusCode, 404);
      assert.match(response.body, new RegExp(`lang="${locale}"`));
    }
  }
  for (const path of ['/de/', '/enquiry/', '/index.html']) assert.equal(edge(path).statusCode, 404);
  for (const path of ['/images/hero.webp', '/_astro/code.js', '/robots.txt', '/sitemap.xml'])
    assert.equal(edge(path).uri, path);
  assert.equal(edge('/api/contact').headers['x-tvujkarel-client-ip'].value, '203.0.113.2');
});
test('API origin authentication rejects direct/spoofed requests and trusts only overwritten edge IP', () => {
  const event = {
    headers: { 'X-Tvujkarel-Origin': 'secret', 'X-Tvujkarel-Client-Ip': '203.0.113.2' },
    requestContext: { http: { method: 'POST', sourceIp: '192.0.2.1' } },
  };
  assert.equal(trustedCloudFrontEvent(event, ''), null);
  assert.equal(trustedCloudFrontEvent(event, 'other'), null);
  assert.equal(
    trustedCloudFrontEvent(
      { ...event, headers: { ...event.headers, 'X-Tvujkarel-Client-Ip': 'spoof' } },
      'secret',
    ),
    null,
  );
  assert.equal(
    trustedCloudFrontEvent(event, 'secret')?.requestContext?.http?.sourceIp,
    '203.0.113.2',
  );
});
