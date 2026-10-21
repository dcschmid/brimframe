import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-thunderforge/';
const title = 'Thunderforge – When a Track Starts to Feel Like a Place';
const description =
  'Building Thunderforge for Riff Racers: an industrial mountain track with stormy cliffs, huge jumps, shortcuts, hazards and a forge that finally feels alive.';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('Thunderforge metadata and discovery use the published article and its own hero', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('title').text(), `${title} — BrimFrame`);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    assert.equal($(selector).attr('content'), description);
  }
  assert.equal(
    $('meta[property="og:title"]').attr('content'),
    `${title} — BrimFrame`,
  );
  assert.equal(
    $('link[rel="canonical"]').attr('href'),
    `https://brimframe.de${route}`,
  );
  assert.equal(
    $('meta[property="og:url"]').attr('content'),
    `https://brimframe.de${route}`,
  );
  assert.equal($('meta[property="og:type"]').attr('content'), 'article');
  assert.equal(
    $('meta[name="twitter:card"]').attr('content'),
    'summary_large_image',
  );
  const image = $('meta[property="og:image"]').attr('content');
  assert.match(
    image,
    /^https:\/\/brimframe\.de\/_astro\/thunderforge-hero.*\.webp$/,
  );
  assert.equal($('meta[name="twitter:image"]').attr('content'), image);
  assert.equal($('meta[property="og:image:width"]').attr('content'), '1200');
  assert.equal($('meta[property="og:image:height"]').attr('content'), '675');
  assert.ok(
    (await stat(path.join(root, new URL(image).pathname))).size < 250 * 1024,
  );
  const article = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).html()))
    .find((data) => data['@type'] === 'BlogPosting');
  assert.equal(article.headline, title);
  assert.equal(article.author.name, 'Daniel Schmid');
  assert.equal(article.publisher.name, 'BrimFrame');
  assert.equal(article.datePublished, '2026-10-16T00:00:00.000Z');
  assert.equal(article.image.url, image);
  // The homepage shows only the three newest posts; older updates stay in the archive.
  const page = load(await read('devlog/index.html'));
  const card = page(`.devlog-card:has(h3 a[href="${route}"])`);
  assert.equal(card.length, 1);
  assert.match(card.find('img').attr('src'), /^\/_astro\/thunderforge-hero/);
  assert.match(card.text(), /Thunderforge looked finished more than once\./);
  assert.equal(card.find('time').attr('datetime'), article.datePublished);
  const feed = load(await read('rss.xml'), { xmlMode: true });
  assert.equal(
    feed('item').filter(
      (_, node) =>
        feed(node).find('link').text() === `https://brimframe.de${route}`,
    ).length,
    1,
  );
  assert.ok((await read('sitemap-0.xml')).includes(route));
});

test('Thunderforge reserves local media space and exposes no eager third-party resource', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('article h1').length, 1);
  assert.equal($('.article-content h2').length, 9);
  assert.equal($('.devlog-figure').length, 8);
  assert.equal($('iframe').length, 0);
  assert.equal($('link[rel="preconnect"], link[rel="dns-prefetch"]').length, 0);
  assert.equal($('.video-embed').prevAll('h2').length, 0);
  assert.equal(
    $('.video-facade').attr('data-embed-url'),
    'https://www.youtube-nocookie.com/embed/_cMQi0Td_SU',
  );
  assert.match(
    $('.video-poster').attr('src'),
    /^\/_astro\/thunderforge-trailer-poster/,
  );
  assert.equal(
    $('.video-fallback a').attr('href'),
    'https://www.youtube.com/watch?v=_cMQi0Td_SU',
  );
  assert.equal($('.article-image').attr('loading'), 'eager');
  assert.equal($('.article-image').attr('fetchpriority'), 'high');
  for (const node of $('article img').toArray()) {
    const image = $(node);
    assert.ok(image.attr('alt').trim());
    assert.equal(
      Number(image.attr('width')) / Number(image.attr('height')),
      16 / 9,
    );
    assert.ok(
      (await stat(path.join(root, image.attr('src')))).size < 300 * 1024,
    );
    if (!image.hasClass('article-image'))
      assert.equal(image.attr('loading'), 'lazy');
  }
  for (const node of $('[src], source[srcset]').toArray()) {
    assert.doesNotMatch(
      $(node).attr('src') ?? $(node).attr('srcset'),
      /^https?:/,
    );
  }
});
