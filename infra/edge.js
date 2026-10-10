// CloudFront Function, JavaScript runtime 2.0. Keep this file below 10 KB.
function handler(event) {
  var request = event.request;
  var uri = request.uri;
  var query = [];
  Object.keys(request.querystring || {}).forEach(function (key) {
    var item = request.querystring[key];
    (item.multiValue || [item]).forEach(function (value) {
      query.push(key + '=' + value.value);
    });
  });
  var suffix = query.length ? '?' + query.join('&') : '';
  function redirect(path) {
    return {
      statusCode: 308,
      statusDescription: 'Permanent Redirect',
      headers: {
        location: { value: 'https://tvujkarel.cz' + path + suffix },
        'cache-control': { value: 'no-store' },
      },
    };
  }
  if (request.headers.host.value === 'www.tvujkarel.cz') return redirect(uri);
  if (uri === '/') return redirect('/cs/');
  if (uri.indexOf('/api/') === 0) {
    // Always overwrite the viewer-supplied value. The API also checks an origin token.
    request.headers['x-tvujkarel-client-ip'] = { value: event.viewer.ip };
    return request;
  }
  if (/^\/(cs|en|ru)(\/privacy)?$/.test(uri)) return redirect(uri + '/');
  if (/^\/(cs|en|ru)\/(privacy\/)?$/.test(uri)) {
    request.uri += 'index.html';
    return request;
  }
  if (
    /^\/(?:_astro|images)\//.test(uri) ||
    /^\/(?:favicon\.svg|robots\.txt|sitemap\.xml)$/.test(uri)
  )
    return request;
  var match = uri.match(/^\/(cs|en|ru)(?:\/|$)/);
  var locale = match ? match[1] : 'cs';
  var texts = {
    cs: ['Stránka nenalezena', 'Zpět na hlavní stránku'],
    en: ['Page not found', 'Back to home'],
    ru: ['Страница не найдена', 'На главную'],
  };
  return {
    statusCode: 404,
    statusDescription: 'Not Found',
    headers: {
      'content-type': { value: 'text/html; charset=utf-8' },
      'cache-control': { value: 'no-store' },
      'x-robots-tag': { value: 'noindex' },
      'x-content-type-options': { value: 'nosniff' },
    },
    body:
      '<!doctype html><html lang="' +
      locale +
      '"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>404 · Tvůj Karel</title><style>body{margin:0;background:#f7f3e8;color:#19382d;font:1.2rem system-ui;display:grid;place-items:center;min-height:100vh}main{padding:2rem}a{color:inherit}h1{font-family:Georgia,serif}</style><main><p>Tvůj Karel · 404</p><h1>' +
      texts[locale][0] +
      '</h1><a href="/' +
      locale +
      '/">' +
      texts[locale][1] +
      '</a></main></html>',
  };
}
