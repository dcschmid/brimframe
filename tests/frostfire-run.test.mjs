import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-frostfire-run/';
const title = 'Riff Racers – Building Frostfire Run';
const description =
  'A look at Frostfire Run, the fifth and final track of the first Riff Racers demo lineup, from ice-and-fire level design to shortcuts, hazards and final polish.';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('Frostfire publishes through the existing metadata, cards, feed and navigation', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('title').text(), `${title} — BrimFrame`);
  assert.equal($('h1').text(), title);
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ]) {
    assert.equal($(selector).attr('content'), description);
  }
  for (const selector of [
    'meta[property="og:title"]',
    'meta[name="twitter:title"]',
  ]) {
    assert.equal($(selector).attr('content'), `${title} — BrimFrame`);
  }
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
  const hero = $('meta[property="og:image"]').attr('content');
  assert.match(
    hero,
    /^https:\/\/brimframe\.de\/_astro\/frostfire-run-hero.*\.webp$/,
  );
  assert.equal($('meta[name="twitter:image"]').attr('content'), hero);
  assert.equal($('meta[property="og:image:width"]').attr('content'), '1200');
  assert.equal($('meta[property="og:image:height"]').attr('content'), '675');
  assert.equal(
    $('meta[property="og:image:alt"]').attr('content'),
    $('.article-image').attr('alt'),
  );
  assert.ok(
    (await stat(path.join(root, new URL(hero).pathname))).size < 250 * 1024,
  );
  const structured = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).html()));
  const article = structured.find((data) => data['@type'] === 'BlogPosting');
  assert.equal(article.headline, title);
  assert.equal(article.author.name, 'Daniel Schmid');
  assert.equal(article.image.url, hero);
  assert.equal(article.datePublished, '2026-10-16T00:00:00.000Z');
  assert.equal(
    structured
      .find((data) => data['@type'] === 'BreadcrumbList')
      .itemListElement.at(-1).name,
    title,
  );
  for (const file of ['index.html', 'devlog/index.html']) {
    const page = load(await read(file));
    assert.equal(page('.devlog-card h3 a').first().attr('href'), route);
    assert.match(
      page('.devlog-card').first().find('img').attr('src'),
      /frostfire-run-hero/,
    );
  }
  const feed = load(await read('rss.xml'), { xmlMode: true });
  assert.equal(
    feed('item').first().find('link').text(),
    `https://brimframe.de${route}`,
  );
  assert.ok((await read('sitemap-0.xml')).includes(route));
  assert.equal(
    $('.article-navigation a').attr('href'),
    '/devlog/riff-racers-thunderforge/',
  );
});

test('Frostfire ships responsive local images and a consent-gated trailer after the first section', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('iframe, video, source[src$=".mp4"]').length, 0);
  assert.equal($('link[rel="preconnect"], link[rel="dns-prefetch"]').length, 0);
  assert.equal($('.video-embed').prevAll('h2').length, 1);
  assert.equal(
    $('.video-facade').attr('data-embed-url'),
    'https://www.youtube-nocookie.com/embed/tVvz5qD9b7Q',
  );
  assert.match($('.video-poster').attr('src'), /frostfire-run-trailer-poster/);
  assert.equal(
    $('.video-fallback a').attr('href'),
    'https://www.youtube.com/watch?v=tVvz5qD9b7Q',
  );
  assert.equal($('.article-image').attr('loading'), 'eager');
  for (const node of $('article img').toArray()) {
    const image = $(node);
    assert.ok(image.attr('alt')?.trim());
    assert.equal(
      Number(image.attr('width')) / Number(image.attr('height')),
      16 / 9,
    );
    assert.ok(image.attr('sizes'));
    assert.equal(
      image.parent('picture').find('source[type="image/avif"]').length,
      1,
    );
    assert.equal(
      image.parent('picture').find('source[type="image/webp"]').length,
      1,
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
