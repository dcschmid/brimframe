import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import { parse } from 'yaml';
import { site, legal } from './src/config/site.ts';

// The virtual `astro:content` module cannot be imported from this file (it
// only resolves inside the Vite module graph), so the sitemap reads the
// devlog frontmatter directly. The file stem is the collection id and
// therefore the last path segment of each article URL.
const devlogDirectory = new URL('./src/content/devlog/', import.meta.url);
let postDates;
const getPostDates = () => {
  postDates ??= (async () => {
    const map = new Map();
    for (const file of (await readdir(devlogDirectory)).sort()) {
      if (!file.endsWith('.md') && !file.endsWith('.mdx')) continue;
      const match = (
        await readFile(path.join(devlogDirectory.pathname, file), 'utf8')
      ).match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
      if (!match) continue;
      const data = parse(match[1]);
      if (data.draft === true) continue;
      const id = path.basename(file, path.extname(file));
      map.set(`/devlog/${id}/`, new Date(data.updatedDate ?? data.publishDate));
    }
    return map;
  })();
  return postDates;
};

export default defineConfig({
  site: site.url,
  output: 'static',
  trailingSlash: 'always',
  integrations: [
    mdx(),
    sitemap({
      filter: (url) =>
        !url.endsWith('/404/') &&
        (legal.ready ||
          (!url.endsWith('/impressum/') && !url.endsWith('/datenschutz/'))),
      serialize: async (item) => {
        const pathname = new URL(item.url, site.url).pathname;
        const lastmod = (await getPostDates()).get(pathname);
        return lastmod ? { ...item, lastmod } : item;
      },
    }),
  ],
});
