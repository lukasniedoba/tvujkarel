import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';
import { createHash } from 'node:crypto';
import { chromium } from '@playwright/test';
import { launch } from 'chrome-launcher';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const option = (name, fallback) => {
  const index = process.argv.indexOf(name);
  if (index < 0) return fallback;
  if (!process.argv[index + 1] || process.argv[index + 1].startsWith('--'))
    throw new Error(`Missing value for ${name}`);
  return process.argv[index + 1];
};
const baseUrl = new URL(option('--url', 'http://127.0.0.1:4324'));
if (
  !['localhost', '127.0.0.1', '[::1]'].includes(baseUrl.hostname) ||
  !['http:', 'https:'].includes(baseUrl.protocol) ||
  baseUrl.username ||
  baseUrl.password ||
  baseUrl.pathname !== '/' ||
  baseUrl.search ||
  baseUrl.hash
) {
  throw new Error(
    'This audit is limited to a local preview origin (localhost, 127.0.0.1, or [::1]).',
  );
}
const outputPrefix = resolve(option('--output-prefix', 'docs/verification/lighthouse'));
const categories = ['performance', 'accessibility', 'best-practices', 'seo'];
const metricIds = [
  'first-contentful-paint',
  'largest-contentful-paint',
  'speed-index',
  'total-blocking-time',
  'cumulative-layout-shift',
];
const locales = ['cs', 'en', 'ru'];
const desktopLocales = option('--desktop-locales', 'cs,en,ru').split(',');
if (
  !desktopLocales.length ||
  desktopLocales.some((locale) => !locales.includes(locale)) ||
  new Set(desktopLocales).size !== desktopLocales.length
)
  throw new Error('Use unique cs,en,ru values for --desktop-locales.');
const profiles = ['mobile', 'desktop'];
const chromeFlags = ['--headless=new', '--disable-gpu'];
const results = [];

function usefulDetails(details) {
  if (!details || typeof details !== 'object') return undefined;
  if (Array.isArray(details.items))
    return details.items.slice(0, 8).map((item) => {
      const result = {};
      for (const key of [
        'url',
        'totalBytes',
        'wastedBytes',
        'wastedMs',
        'cacheLifetimeMs',
        'label',
        'value',
        'name',
        'source',
        'subItems',
      ]) {
        if (item[key] !== undefined && typeof item[key] !== 'object') result[key] = item[key];
      }
      if (item.node)
        result.node = {
          selector: item.node.selector,
          explanation: item.node.explanation,
          snippet: item.node.snippet,
        };
      if (item.type === 'table') result.items = usefulDetails(item);
      if (item.subItems) result.subItems = usefulDetails(item.subItems);
      return result;
    });
  return undefined;
}

function summarize(lhr, locale, profile, htmlHash) {
  const relevantAudits = new Map();
  for (const id of categories) {
    for (const reference of lhr.categories[id].auditRefs) {
      const audit = lhr.audits[reference.id];
      if (audit && reference.weight > 0 && audit.score !== null && audit.score < 1) {
        const existing = relevantAudits.get(audit.id);
        if (existing) existing.categories.push(id);
        else
          relevantAudits.set(audit.id, {
            id: audit.id,
            title: audit.title,
            categories: [id],
            score: audit.score,
            displayValue: audit.displayValue,
            details: usefulDetails(audit.details),
          });
      }
    }
  }
  return {
    locale,
    profile,
    url: lhr.finalDisplayedUrl,
    fetchedAt: lhr.fetchTime,
    htmlSha256: htmlHash,
    lighthouseVersion: lhr.lighthouseVersion,
    userAgent: lhr.userAgent,
    environment: lhr.environment,
    settings: {
      formFactor: lhr.configSettings.formFactor,
      throttlingMethod: lhr.configSettings.throttlingMethod,
      throttling: lhr.configSettings.throttling,
      screenEmulation: lhr.configSettings.screenEmulation,
    },
    categories: Object.fromEntries(
      categories.map((id) => [id, Math.round(lhr.categories[id].score * 100)]),
    ),
    metrics: Object.fromEntries(
      metricIds.map((id) => [
        id,
        {
          numericValue: lhr.audits[id].numericValue,
          numericUnit: lhr.audits[id].numericUnit,
          displayValue: lhr.audits[id].displayValue,
        },
      ]),
    ),
    totalTransferBytes: lhr.audits['total-byte-weight']?.numericValue,
    warnings: lhr.runWarnings,
    failingAudits: [...relevantAudits.values()],
    insights: Object.values(lhr.audits)
      .filter((audit) => audit.id.endsWith('-insight') && audit.score !== null && audit.score < 1)
      .map((audit) => ({
        id: audit.id,
        title: audit.title,
        displayValue: audit.displayValue,
        metricSavings: audit.metricSavings,
        details: usefulDetails(audit.details),
      })),
  };
}

function markdown(report) {
  const lines = [
    '# Lighthouse — místní statický build',
    '',
    `Měření: ${new Intl.DateTimeFormat('cs-CZ', { dateStyle: 'long', timeStyle: 'long', timeZone: 'Europe/Prague' }).format(new Date(report.measuredAt))}. Lighthouse ${report.lighthouseVersion}; Node ${report.nodeVersion}.`,
    '',
    `Testovaný origin: \`${report.baseUrl}\`. Každá kombinace jazyka a profilu má jeden samostatný běh na statickém výstupu Astra. Mobilní profil používá výchozí simulované omezení Lighthouse; desktop odpovídá jeho desktopovému presetu. Přesné metriky, nastavení a SHA-256 testovaných HTML jsou v sousedním JSON.`,
    '',
    '**Náhled zůstává neindexovaný.** Audit nemění HTML, meta robots, robots.txt ani aplikační konfiguraci. Nižší skóre SEO může být očekávaným důsledkem tohoto režimu. Cíl 95 pro produkční SEO vyžaduje nové měření po schváleném zapnutí indexace. Lokální měření neověřuje CDN, skutečný mobilní hardware, Safari ani reálné provozní podmínky.',
    '',
    '| Jazyk | Profil | Performance | Accessibility | Best Practices | SEO | FCP | LCP | TBT | CLS |',
    '| --- | --- | ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |',
  ];
  for (const result of report.results) {
    const score = result.categories;
    const metric = result.metrics;
    lines.push(
      `| ${result.locale} | ${result.profile} | ${score.performance} | ${score.accessibility} | ${score['best-practices']} | ${score.seo} | ${metric['first-contentful-paint'].displayValue} | ${metric['largest-contentful-paint'].displayValue} | ${metric['total-blocking-time'].displayValue} | ${metric['cumulative-layout-shift'].displayValue} |`,
    );
  }
  lines.push(
    '',
    `Cíl alespoň 95 pro Performance, Accessibility a Best Practices: **${report.targetPassed ? `splněn ve všech ${report.results.length} bězích` : 'nesplněn ve všech bězích; podrobnosti níže'}**.`,
    '',
    '## Nálezy',
  );
  for (const result of report.results) {
    lines.push('', `### ${result.locale} / ${result.profile}`, '');
    const audits = [...result.failingAudits, ...result.insights];
    const seen = new Set();
    for (const audit of audits) {
      if (seen.has(audit.id)) continue;
      seen.add(audit.id);
      lines.push(
        `- \`${audit.id}\`: ${audit.title}${audit.displayValue ? ` — ${audit.displayValue}` : ''}.`,
      );
      for (const item of audit.details ?? []) {
        if (item.node?.selector)
          lines.push(
            `  - Prvek: \`${item.node.selector.replaceAll('`', '')}\`${item.node.explanation ? ` — ${item.node.explanation.replaceAll('\n', ' ')}` : ''}.`,
          );
        else if (item.url)
          lines.push(
            `  - Zdroj: \`${item.url}\`${item.wastedBytes !== undefined ? `; potenciální úspora ${item.wastedBytes} B` : ''}.`,
          );
      }
    }
    if (!audits.length)
      lines.push('- Žádné nedosažené bodované kontroly ani nevyřešené performance insights.');
    for (const warning of result.warnings ?? []) lines.push(`- Poznámka Lighthouse: ${warning}`);
  }
  lines.push(
    '',
    '## Opakování',
    '',
    '```sh',
    'npm run build',
    `npm run preview -- --host ${new URL(report.baseUrl).hostname} --port ${new URL(report.baseUrl).port || '80'}`,
    '# V druhém terminálu:',
    `node scripts/audit-lighthouse.mjs --url ${report.baseUrl} --desktop-locales ${report.results
      .filter((result) => result.profile === 'desktop')
      .map((result) => result.locale)
      .join(',')}`,
    '```',
    '',
    'Během měření omezte souběžné zátěžové testy. Skóre výkonu se může mezi běhy lišit; výsledky jsou laboratorní měření, nikoli garance rychlosti. Žádný formulář nebyl v tomto auditu odeslán.',
    '',
  );
  return lines.join('\n');
}

await mkdir(dirname(outputPrefix), { recursive: true });
const probe = await fetch(new URL('/cs/', baseUrl));
if (!probe.ok || !probe.headers.get('content-type')?.includes('text/html'))
  throw new Error('Local preview is not serving the built homepage.');
const probeHtml = await probe.text();
if (probeHtml.includes('/@vite/client') || probeHtml.includes('astro-dev-toolbar'))
  throw new Error('Run this audit against the static build preview, not the dev server.');
if (!/noindex/iu.test(probeHtml))
  throw new Error('The local build must remain in preview mode with noindex for this task.');

const chrome = await launch({
  chromePath: chromium.executablePath(),
  chromeFlags,
  logLevel: 'error',
});
try {
  for (const profile of profiles) {
    for (const locale of profile === 'desktop' ? desktopLocales : locales) {
      const url = new URL(`/${locale}/`, baseUrl).href;
      const before = await (await fetch(url)).text();
      const htmlHash = createHash('sha256').update(before).digest('hex');
      console.log(`Lighthouse ${locale} ${profile}: starting`);
      const run = await lighthouse(
        url,
        {
          port: chrome.port,
          logLevel: 'error',
          onlyCategories: categories,
          output: 'json',
        },
        profile === 'desktop' ? desktopConfig : undefined,
      );
      if (!run || run.lhr.runtimeError)
        throw new Error(
          `Lighthouse failed for ${locale}/${profile}: ${run?.lhr.runtimeError?.message ?? 'no result'}`,
        );
      const after = await (await fetch(url)).text();
      if (createHash('sha256').update(after).digest('hex') !== htmlHash)
        throw new Error('Static build changed during the audit; rerun on a stable build.');
      const result = summarize(run.lhr, locale, profile, htmlHash);
      results.push(result);
      console.log(`Lighthouse ${locale} ${profile}: ${JSON.stringify(result.categories)}`);
    }
  }
} finally {
  await Promise.resolve(chrome.kill());
}

const packageJson = JSON.parse(
  await readFile(new URL('../node_modules/lighthouse/package.json', import.meta.url), 'utf8'),
);
const report = {
  measuredAt: new Date().toISOString(),
  baseUrl: baseUrl.origin,
  nodeVersion: process.version,
  lighthouseVersion: packageJson.version,
  browser: 'Playwright Chromium, temporary isolated profile',
  chromeFlags,
  scope: 'Local static preview, default noindex preserved, no deployment or form submission',
  targetPassed: results.every((result) =>
    ['performance', 'accessibility', 'best-practices'].every((id) => result.categories[id] >= 95),
  ),
  results,
};
await writeFile(`${outputPrefix}.json`, `${JSON.stringify(report, null, 2)}\n`);
await writeFile(`${outputPrefix}.md`, markdown(report));
console.log(`Saved ${outputPrefix}.json and ${outputPrefix}.md`);
if (!report.targetPassed) process.exitCode = 1;
