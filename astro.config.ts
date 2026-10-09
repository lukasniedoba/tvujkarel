import { defineConfig } from 'astro/config';
import { contactApiPlugin } from './server/vite-contact';
export default defineConfig({
  site: process.env.PUBLIC_SITE_URL || 'https://tvujkarel.cz',
  output: 'static', trailingSlash: 'always',
  i18n: { locales: ['cs', 'en', 'ru'], defaultLocale: 'cs', routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false } },
  server: { host: '127.0.0.1', port: 4321 },
  vite: { plugins: [contactApiPlugin()] },
});
