import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import { site } from './src/data/site.ts';

// Static site. No server, no React. Vite does the build.
export default defineConfig({
  site: site.links.siteUrl,
  output: 'static',
  trailingSlash: 'never',
  build: { format: 'file', inlineStylesheets: 'auto' },
  integrations: [
    sitemap({
      // Ad landing, thank-you, and the private /form page stay out of the sitemap.
      filter: (page) => !page.endsWith('/call') && !page.endsWith('/booked') && !page.endsWith('/form'),
    }),
  ],
});
