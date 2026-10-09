// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import react from '@astrojs/react';
import keystatic from '@keystatic/astro';
import { locales, defaultLocale } from './src/i18n/locales.js';

// Адмінка Keystatic працює ТІЛЬКИ локально (npm run dev).
// У зібраному сайті її немає взагалі — нема сторінки входу, нема чого зламувати.
const isDev = process.argv.includes('dev');

// Попередній перегляд на GitHub Pages живе в підпапці: lindigo-design.github.io/datatixx/
// Workflow .github/workflows/pages.yml передає SITE_URL і BASE_PATH.
// Без них (локально та на IONOS) сайт збирається для кореня домену.
const site = process.env.SITE_URL || 'https://www.datatixx.com';
const base = process.env.BASE_PATH || '/';

export default defineConfig({
  site,
  base,
  output: 'static',
  // у dev — 'ignore', бо адмінка Keystatic звертається до адрес без «/» у кінці
  trailingSlash: isDev ? 'ignore' : 'always',

  i18n: {
    locales: [...locales],
    defaultLocale,
    routing: {
      prefixDefaultLocale: true, // /en/, /fr/ — кожна мова має свою адресу
      redirectToDefaultLocale: false, // корінь «/» обробляє src/pages/index.astro і .htaccess
    },
  },

  integrations: [
    sitemap({
      i18n: {
        defaultLocale,
        locales: Object.fromEntries(locales.map(l => [l, l])),
      },
    }),
    ...(isDev ? [react(), keystatic()] : []),
  ],

  security: {
    // Content-Security-Policy: браузер виконає ТІЛЬКИ наші скрипти і стилі.
    // Astro сам рахує їхні хеші під час збірки.
    // frame-ancestors (заборона вбудовувати сайт у чужі сторінки) — у public/.htaccess.
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "form-action 'self'",
        "base-uri 'self'",
        "object-src 'none'",
        'upgrade-insecure-requests',
      ],
    },
  },

  markdown: {
    syntaxHighlight: false,
  },

  build: {
    // жодних вбудованих <style>/<script> — простіше тримати сувору CSP
    inlineStylesheets: 'never',
  },

  vite: {
    build: {
      sourcemap: false, // не віддаємо вихідний код у продакшен
      assetsInlineLimit: 0, // жодних data:-вставок — усе окремими файлами (сувора CSP)
    },
  },
});
