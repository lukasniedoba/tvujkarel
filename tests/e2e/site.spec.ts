import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { getDictionary } from '../../src/i18n';
import type { Locale, ApiCode } from '../../src/i18n/schema';

const locales: Locale[] = ['cs', 'en', 'ru'];
const themes = ['light', 'dark'] as const;
const widths = [360, 390, 768, 1024, 1440];
const canonicalOrigin = process.env.PUBLIC_SITE_URL || 'https://tvujkarel.cz';
const formValues = {
  name: 'Žaneta Тест',
  phone: '+420 777 123 456',
  email: 'browser-test@example.com',
  location: 'Praha 6 — Dejvice',
  message: 'Potřebuji připojit tiskárnu k Wi-Fi.\nНужна помощь с принтером.',
};

async function navigate(page: Page, path: string) {
  const response = await page.goto(path);
  await page.evaluate(() => document.fonts.ready);
  return response;
}

async function chooseTheme(page: Page, theme: 'light' | 'dark') {
  await page.addInitScript((value) => {
    if (!localStorage.getItem('theme')) localStorage.setItem('theme', value);
  }, theme);
}

async function fillContact(page: Page, values = formValues) {
  for (const [field, value] of Object.entries(values)) {
    await page.locator(`#contact-form [name="${field}"]`).fill(value);
  }
}

async function expectPreserved(page: Page, values = formValues) {
  for (const [field, value] of Object.entries(values)) {
    await expect(page.locator(`#contact-form [name="${field}"]`)).toHaveValue(value);
  }
}

function submitButton(page: Page) {
  return page.locator('#contact-form button[type="submit"]');
}

for (const locale of locales) {
  const t = getDictionary(locale);

  test.describe(`${locale} layout and navigation`, () => {
    for (const width of widths) {
      for (const theme of themes) {
        test(`${width}px ${theme} has no horizontal overflow`, async ({ page }) => {
          await page.setViewportSize({ width, height: 900 });
          await chooseTheme(page, theme);
          await navigate(page, `/${locale}/`);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          await expect(page.locator('#main h1')).toHaveCount(1);
          const dimensions = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
            table: document.querySelector('.price-table')!.getBoundingClientRect().right,
            form: document.querySelector('#contact-form')!.getBoundingClientRect().right,
          }));
          expect(dimensions.document).toBeLessThanOrEqual(dimensions.viewport + 1);
          expect(dimensions.body).toBeLessThanOrEqual(dimensions.viewport + 1);
          expect(dimensions.table).toBeLessThanOrEqual(dimensions.viewport + 1);
          expect(dimensions.form).toBeLessThanOrEqual(dimensions.viewport + 1);
          await expect(page.locator('.languages')).toBeVisible();
          await expect(page.locator('.languages a')).toHaveCount(3);
          await navigate(page, `/${locale}/privacy/`);
          await expect(page.locator('html')).toHaveAttribute('data-theme', theme);
          const privacyDimensions = await page.evaluate(() => ({
            viewport: document.documentElement.clientWidth,
            document: document.documentElement.scrollWidth,
            body: document.body.scrollWidth,
          }));
          expect(privacyDimensions.document).toBeLessThanOrEqual(privacyDimensions.viewport + 1);
          expect(privacyDimensions.body).toBeLessThanOrEqual(privacyDimensions.viewport + 1);
        });
      }
    }

    for (const type of ['home', 'privacy'] as const) {
      const path = `/${locale}/${type === 'privacy' ? 'privacy/' : ''}`;

      test(`${type} exposes localized metadata and equivalent language routes`, async ({
        page,
      }) => {
        const response = await navigate(page, path);
        expect(response?.status()).toBe(200);
        await expect(page.locator('html')).toHaveAttribute('lang', locale);
        await expect(page).toHaveTitle(type === 'home' ? t.seo.title : t.privacy.seoTitle);
        await expect(page.locator('#main h1')).toHaveCount(1);
        await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
          'href',
          new URL(path, canonicalOrigin).href,
        );
        await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
        await expect(page.locator('.languages [aria-current="page"]')).toHaveAttribute(
          'lang',
          locale,
        );
        for (const target of locales) {
          const targetPath = `/${target}/${type === 'privacy' ? 'privacy/' : ''}`;
          await expect(page.locator(`link[rel="alternate"][hreflang="${target}"]`)).toHaveAttribute(
            'href',
            new URL(targetPath, canonicalOrigin).href,
          );
          await expect(page.locator(`.languages a[lang="${target}"]`)).toHaveJSProperty(
            'href',
            new URL(targetPath, page.url()).href,
          );
        }
        await expect(page.locator('link[rel="alternate"][hreflang="x-default"]')).toHaveAttribute(
          'href',
          new URL(`/cs/${type === 'privacy' ? 'privacy/' : ''}`, canonicalOrigin).href,
        );
        await expect(page.locator('footer a[href$="/privacy/"]')).toHaveAttribute(
          'href',
          `/${locale}/privacy/`,
        );
      });

      for (const theme of themes) {
        test(`${type} ${theme} passes WCAG A and AA checks on mobile and desktop`, async ({
          page,
        }) => {
          test.setTimeout(90_000);
          await chooseTheme(page, theme);
          for (const width of [390, 1440]) {
            await page.setViewportSize({ width, height: 900 });
            await navigate(page, path);
            // Preview noindex is intentional. Axe checks accessibility, not indexing or SEO.
            const result = await new AxeBuilder({ page })
              .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
              .analyze();
            expect(
              result.violations,
              `${path} ${theme} ${width}px: ${JSON.stringify(result.violations.map((v) => ({ id: v.id, impact: v.impact, targets: v.nodes.map((n) => n.target) })))}`,
            ).toEqual([]);
          }
        });
      }

      test(`${type} language switch preserves the page and fragment`, async ({ page }) => {
        const target = locales[(locales.indexOf(locale) + 1) % locales.length]!;
        const fragment = type === 'home' ? '#cenik' : '#main';
        await navigate(page, `${path}${fragment}`);
        const link = page.locator(`.languages a[lang="${target}"]`);
        await expect(link).toHaveJSProperty(
          'href',
          new URL(`/${target}/${type === 'privacy' ? 'privacy/' : ''}${fragment}`, page.url()).href,
        );
        await link.click();
        await expect(page).toHaveURL(
          new RegExp(`/${target}/${type === 'privacy' ? 'privacy/' : ''}${fragment}$`),
        );
        await expect(page.locator('html')).toHaveAttribute('lang', target);
      });
    }

    test('theme and mobile menu work with the keyboard and retain theme after navigation', async ({
      page,
    }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await chooseTheme(page, 'light');
      await navigate(page, `/${locale}/`);
      const theme = page.locator('.theme-toggle');
      await theme.focus();
      await theme.press('Enter');
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      await expect(theme).toHaveAccessibleName(t.a11y.themeLight);
      await page.reload();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
      const menu = page.locator('.menu-toggle');
      await menu.focus();
      await menu.press('Enter');
      await expect(menu).toHaveAttribute('aria-expanded', 'true');
      await expect(page.locator('#mobile-menu')).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await expect(menu).toBeFocused();
      await menu.press('Space');
      const serviceLink = page.locator('#mobile-menu a[href$="#sluzby"]');
      await serviceLink.focus();
      await serviceLink.press('Enter');
      await expect(page).toHaveURL(new RegExp(`/${locale}/#sluzby$`));
      await expect(page.locator('#mobile-menu')).toBeHidden();
      await expect(menu).toHaveAttribute('aria-expanded', 'false');
      await page.locator('footer a[href$="/privacy/"]').click();
      await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
    });

    test('FAQ keyboard controls expose answers and lead to the price section', async ({ page }) => {
      await navigate(page, `/${locale}/`);
      const item = page.locator('.faq details').nth(1);
      const summary = item.locator('summary');
      await expect(item).not.toHaveAttribute('open', '');
      await summary.focus();
      await summary.press('Enter');
      await expect(item).toHaveAttribute('open', '');
      await expect(item.locator('.faq-answer')).toBeVisible();
      await summary.press('Space');
      await expect(item.locator('.faq-answer')).toBeHidden();
      await summary.press('Enter');
      await item.locator('a[href="#cenik"]').click();
      await expect(page).toHaveURL(new RegExp(`/${locale}/#cenik$`));
    });

    test('mobile contact bar yields to focused form fields', async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await navigate(page, `/${locale}/`);
      const bar = page.locator('.mobile-contact');
      await expect(bar).toBeVisible();
      await bar.getByRole('link', { name: t.nav.write, exact: true }).click();
      await page.locator('#name').focus();
      await expect(bar).toBeHidden();
      await page.locator('.theme-toggle').focus();
      await expect(bar).toBeVisible();
    });
  });

  test.describe(`${locale} contact form`, () => {
    test.beforeEach(async ({ page }) => {
      await navigate(page, `/${locale}/#kontakt`);
    });

    test('validates required fields and optional email in the page language', async ({ page }) => {
      let requests = 0;
      await page.route('**/api/contact', async (route) => {
        requests++;
        await route.fulfill({ status: 200, json: { ok: true, code: 'ACCEPTED' } });
      });
      await submitButton(page).click();
      await expect(page.locator('#form-status')).toContainText(t.form.codes.VALIDATION_ERROR);
      for (const field of ['name', 'phone', 'location', 'message'] as const) {
        await expect(page.locator(`#${field}`)).toHaveAttribute('aria-invalid', 'true');
        await expect(page.locator(`#${field}-error`)).toContainText(t.form.fieldErrors.REQUIRED);
      }
      await expect(page.locator('#name')).toBeFocused();
      await expect(page.locator('#email')).not.toHaveAttribute('aria-invalid', 'true');
      expect(requests).toBe(0);
      await fillContact(page, { ...formValues, email: 'not-an-email' });
      await submitButton(page).click();
      await expect(page.locator('#email')).toBeFocused();
      await expect(page.locator('#email-error')).toContainText(t.form.fieldErrors.INVALID_FORMAT);
      expect(requests).toBe(0);
      await page.locator('#email').fill('');
      await submitButton(page).click();
      await expect(page.locator('#form-status')).toContainText(t.form.codes.ACCEPTED);
      expect(requests).toBe(1);
      await expect(page.locator('#contact-form a[href$="/privacy/"]')).toHaveAttribute(
        'href',
        `/${locale}/privacy/`,
      );
    });

    test('waits for acceptance, blocks duplicate submission and sends Unicode plus locale', async ({
      page,
    }) => {
      let count = 0;
      let payload: unknown;
      let accept!: () => void;
      const providerAnswer = new Promise<void>((resolve) => {
        accept = resolve;
      });
      await page.route('**/api/contact', async (route) => {
        count++;
        payload = route.request().postDataJSON();
        await providerAnswer;
        await route.fulfill({ status: 200, json: { ok: true, code: 'ACCEPTED' } });
      });
      await fillContact(page);
      await submitButton(page).click();
      await expect(submitButton(page)).toBeDisabled();
      await expect(submitButton(page)).toContainText(t.form.submitting);
      await expect(page.locator('#contact-form')).toHaveAttribute('aria-busy', 'true');
      await expect(page.locator('#form-status')).toBeHidden();
      await expectPreserved(page);
      // The pending request owns these values until the provider replies; edits must not
      // be accepted here and then silently discarded by the successful form reset.
      for (const field of Object.keys(formValues)) {
        await expect(page.locator(`#${field}`)).toBeDisabled();
      }
      // A second submit event also exercises the guard beyond the disabled button.
      await page
        .locator('#contact-form')
        .evaluate((form) =>
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })),
        );
      await expect.poll(() => count).toBe(1);
      expect(payload).toEqual({ ...formValues, locale, website: '' });
      accept();
      await expect(page.locator('#form-status')).toContainText(t.form.codes.ACCEPTED);
      await expect(page.locator('#form-status')).toHaveClass(/success/);
      await expect(page.locator('#form-status')).toBeFocused();
      await expect(submitButton(page)).toBeEnabled();
      await expect(page.locator('#contact-form')).not.toHaveAttribute('aria-busy', 'true');
      for (const field of Object.keys(formValues)) {
        await expect(page.locator(`#${field}`)).toHaveValue('');
        await expect(page.locator(`#${field}`)).toBeEditable();
      }
      expect(count).toBe(1);
    });

    const failures: Array<{ name: string; status: number; body: unknown; expected: ApiCode }> = [
      { name: 'rate limit without JSON', status: 429, body: null, expected: 'RATE_LIMITED' },
      {
        name: 'provider rejection',
        status: 502,
        body: { ok: false, code: 'DELIVERY_FAILED' },
        expected: 'DELIVERY_FAILED',
      },
      {
        name: 'server validation',
        status: 400,
        body: { ok: false, code: 'VALIDATION_ERROR', fields: { phone: 'INVALID_FORMAT' } },
        expected: 'VALIDATION_ERROR',
      },
      { name: 'unexpected server page', status: 500, body: null, expected: 'UNKNOWN_ERROR' },
      {
        name: 'unknown success payload',
        status: 200,
        body: { ok: true },
        expected: 'UNKNOWN_ERROR',
      },
      {
        name: 'acceptance body with failed HTTP status',
        status: 500,
        body: { ok: true, code: 'ACCEPTED' },
        expected: 'UNKNOWN_ERROR',
      },
    ];
    for (const failure of failures) {
      test(`${failure.name} preserves data and permits a retry`, async ({ page }) => {
        let attempts = 0;
        await page.route('**/api/contact', async (route) => {
          attempts++;
          if (attempts > 1)
            await route.fulfill({ status: 200, json: { ok: true, code: 'ACCEPTED' } });
          else if (failure.body === null)
            await route.fulfill({
              status: failure.status,
              contentType: 'text/html',
              body: '<h1>Unavailable</h1>',
            });
          else await route.fulfill({ status: failure.status, json: failure.body });
        });
        await fillContact(page);
        await submitButton(page).click();
        await expect(page.locator('#form-status')).toContainText(t.form.codes[failure.expected]);
        await expect(page.locator('#form-status')).not.toHaveClass(/success/);
        await expectPreserved(page);
        await expect(submitButton(page)).toBeEnabled();
        for (const field of Object.keys(formValues)) {
          await expect(page.locator(`#${field}`)).toBeEditable();
        }
        if (failure.name === 'server validation') {
          await expect(page.locator('#phone')).toHaveAttribute('aria-invalid', 'true');
          await expect(page.locator('#phone')).toBeFocused();
          await expect(page.locator('#phone-error')).toContainText(
            t.form.fieldErrors.INVALID_FORMAT,
          );
        }
        await submitButton(page).click();
        await expect(page.locator('#form-status')).toContainText(t.form.codes.ACCEPTED);
        expect(attempts).toBe(2);
      });
    }

    test('network failure preserves data and uses a localized message', async ({ page }) => {
      await page.route('**/api/contact', (route) => route.abort('failed'));
      await fillContact(page);
      await submitButton(page).click();
      await expect(page.locator('#form-status')).toContainText(t.form.codes.NETWORK_ERROR);
      await expectPreserved(page);
      await expect(submitButton(page)).toBeEnabled();
      for (const field of Object.keys(formValues)) {
        await expect(page.locator(`#${field}`)).toBeEditable();
      }
    });
  });
}

test.describe('contact privacy without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  for (const locale of locales) {
    test(`${locale} native submission keeps personal details out of the URL`, async ({ page }) => {
      await page.route('**/api/contact', (route) =>
        route.fulfill({
          status: 415,
          contentType: 'text/plain',
          body: 'This test endpoint does not send email.',
        }),
      );
      await page.goto(`/${locale}/#kontakt`);
      const form = page.locator('#contact-form');
      await expect(form).toHaveAttribute('method', 'post');
      await expect(form).toHaveAttribute('action', '/api/contact');
      await expect(form.locator('noscript p')).toBeVisible();
      await expect(form.locator('noscript p')).toHaveText(getDictionary(locale).form.noScript);
      await fillContact(page);

      const requestPromise = page.waitForRequest(
        (request) =>
          request.isNavigationRequest() && new URL(request.url()).pathname === '/api/contact',
      );
      await submitButton(page).click();
      const request = await requestPromise;
      const submittedURL = new URL(request.url());
      expect(request.method()).toBe('POST');
      expect(submittedURL.search).toBe('');
      const body = new URLSearchParams(request.postData() ?? '');
      for (const [field, value] of Object.entries(formValues)) {
        // HTML form submission normalizes textarea newlines to CRLF.
        expect(body.get(field)?.replace(/\r\n/g, '\n')).toBe(value);
      }
      await expect(page).toHaveURL(`${submittedURL.origin}/api/contact`);
    });
  }
});

test('system dark preference is used before a stored theme exists', async ({ page }) => {
  await page.emulateMedia({ colorScheme: 'dark' });
  await navigate(page, '/cs/');
  await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
});

test('real local API explicitly refuses delivery in preview mode', async ({ page }) => {
  await navigate(page, '/cs/#kontakt');
  await fillContact(page);
  const responsePromise = page.waitForResponse(
    (response) => response.url().endsWith('/api/contact') && response.request().method() === 'POST',
  );
  await submitButton(page).click();
  const response = await responsePromise;
  expect(response.status()).toBe(503);
  expect(await response.json()).toEqual({ ok: false, code: 'PREVIEW_DISABLED' });
  await expect(page.locator('#form-status')).toContainText(
    getDictionary('cs').form.codes.PREVIEW_DISABLED,
  );
  await expect(page.locator('#form-status')).not.toHaveClass(/success/);
  await expectPreserved(page);
});

test('root sends an HTTP 308 redirect to the default locale', async ({ request, baseURL }) => {
  const response = await request.get('/?source=e2e', { maxRedirects: 0 });
  expect(response.status()).toBe(308);
  const target = new URL(response.headers().location!, baseURL);
  expect(target.pathname).toBe('/cs/');
  expect(target.search).toBe('?source=e2e');
});

for (const locale of locales) {
  test(`${locale} unknown route has a real localized HTTP 404`, async ({ page }) => {
    const response = await navigate(page, `/${locale}/this-page-does-not-exist/`);
    expect(response?.status()).toBe(404);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('#main h1')).toHaveText(getDictionary(locale).notFound.title);
    await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', /noindex/);
  });
}

test('unsupported language prefixes return HTTP 404', async ({ request }) => {
  const response = await request.get('/de/');
  expect(response.status()).toBe(404);
});
