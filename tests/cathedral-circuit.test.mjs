import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, access, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-into-the-cathedral/';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('Cathedral metadata, social image and discovery use the published article', async () => {
  const $ = load(await read(`${route}/index.html`));
  const description =
    'A look behind the creation of Cathedral Circuit, the dark gothic third track for Riff Racers, featuring shortcuts, jumps, hazards, a pit lane and a living cathedral environment.';
  assert.equal($('meta[name="description"]').attr('content'), description);
  assert.equal(
    $('meta[property="og:description"]').attr('content'),
    description,
  );
  assert.equal(
    $('meta[name="twitter:description"]').attr('content'),
    description,
  );
  assert.equal(
    $('link[rel="canonical"]').attr('href'),
    `https://brimframe.de${route}`,
  );
  assert.equal($('meta[property="og:type"]').attr('content'), 'article');
  assert.equal(
    $('meta[name="twitter:card"]').attr('content'),
    'summary_large_image',
  );
  assert.equal(
    $('.page-intro').text(),
    'Track 3 is finished — and this one took Riff Racers somewhere quite a bit darker.',
  );
  const image = $('meta[property="og:image"]').attr('content');
  assert.match(
    image,
    /^https:\/\/brimframe\.de\/_astro\/cathedral-circuit-hero.*\.webp$/,
  );
  assert.equal($('meta[name="twitter:image"]').attr('content'), image);
  const imagePath = path.join(root, new URL(image).pathname);
  await access(imagePath);
  assert.ok((await stat(imagePath)).size < 250 * 1024);
  const article = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).html()))
    .find((data) => data['@type'] === 'BlogPosting');
  assert.equal(article.author.name, 'Daniel Schmid');
  assert.equal(article.publisher.name, 'BrimFrame');
  assert.equal(article.datePublished, '2026-10-15T00:00:00.000Z');
  assert.equal(article.image.url, image);
  assert.equal($('iframe').length, 0);
  assert.equal($('.video-embed').prevAll('h2').length, 0);
  // The homepage shows only the three newest posts; older updates stay in the archive.
  const page = load(await read('devlog/index.html'));
  const card = page(`.devlog-card:has(h3 a[href="${route}"])`);
  assert.equal(card.length, 1);
  assert.match(card.text(), /Riff Racers heads somewhere darker\./);
  const feed = load(await read('rss.xml'), { xmlMode: true });
  const item = feed('item').filter(
    (_, node) =>
      feed(node).find('link').text() === `https://brimframe.de${route}`,
  );
  assert.equal(item.length, 1);
  assert.match(
    item.find('description').text(),
    /Riff Racers heads somewhere darker\./,
  );
  assert.ok((await read('sitemap-0.xml')).includes(route));
});
