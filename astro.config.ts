import { defineConfig } from 'astro/config';
import { readProductionEnv, validateProductionEnv } from './scripts/check-production';
import { localRoutingPlugin } from './server/local-routing';
import { contactApiPlugin } from './server/vite-contact';
export default defineConfig({
  integrations: [
    {
      name: 'production-configuration',
      hooks: {
        'astro:build:start': () => {
          const env = readProductionEnv();
          if (env.PUBLIC_SITE_MODE === 'production') {
            const errors = validateProductionEnv(env);
            if (errors.length)
              throw new Error('Production configuration rejected:\n' + errors.join('\n'));
          }
        },
      },
    },
  ],
  site: process.env.PUBLIC_SITE_URL || 'https://tvujkarel.cz',
  devToolbar: { enabled: false },
  build: { inlineStylesheets: 'always' },
  output: 'static',
  trailingSlash: 'always',
  i18n: {
    locales: ['cs', 'en', 'ru'],
    defaultLocale: 'cs',
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
  server: { host: '127.0.0.1', port: 4321 },
  vite: { plugins: [contactApiPlugin(), localRoutingPlugin()] },
});
