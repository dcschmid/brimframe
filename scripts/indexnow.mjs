// Notify IndexNow engines (Bing, DuckDuckGo, Yandex, ChatGPT Search, …)
// about every URL in the freshly built sitemap. Run this AFTER the new build
// is live, e.g. as the last step after a Render deploy:
//
//   pnpm build && pnpm notify:indexnow
//
// The key file ships with the site (public/), which proves domain ownership.
import { readFile } from 'node:fs/promises';
import path from 'node:path';
const endpoint =
  process.env.INDEXNOW_ENDPOINT?.trim() || 'https://api.bing.com/indexnow';
const host = 'brimframe.de';
const key = '70a67d60f66ebd41fe4e8ef5b8eb58be';
const keyLocation = `https://${host}/${key}.txt`;

const root = path.resolve('apps/brimframe/dist');
const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
const urls = [...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
if (urls.length === 0) {
  console.error('No <loc> entries found in apps/brimframe/dist/sitemap-0.xml.');
  process.exit(1);
}
if (!urls.every((url) => new URL(url).host === host)) {
  console.error('Sitemap contains URLs outside the IndexNow host scope.');
  process.exit(1);
}

const body = JSON.stringify({ host, key, keyLocation, urlList: urls });
const response = await fetch(endpoint, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json; charset=utf-8' },
  body,
  signal: AbortSignal.timeout(30000),
});
if (response.status === 200) {
  console.log(`IndexNow accepted ${urls.length} URLs.`);
} else {
  const detail = await response.text();
  console.error(`IndexNow ping failed: ${response.status} ${detail}`);
  process.exit(1);
}
