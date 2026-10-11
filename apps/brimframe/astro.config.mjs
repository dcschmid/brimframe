import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site, legal } from './src/config/site.ts';

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    sitemap({
      filter: (url) =>
        !url.endsWith('/404/') &&
        (legal.ready ||
          (!url.endsWith('/impressum/') && !url.endsWith('/datenschutz/'))),
    }),
  ],
});
