import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-when-the-weather-changes-the-race/';
const title = 'Riff Racers – When the Weather Changes the Race';
const description =
  'From sunny races to wet roads and snow-covered corners: a look at how dynamic weather is changing the feel of Riff Racers.';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('weather publishes with BrimFrame attribution, current metadata and discovery links', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('title').text(), `${title} — BrimFrame`);
  assert.equal($('h1').text(), title);
  assert.equal($('.article-meta > span').first().text(), 'By BrimFrame');
  for (const selector of [
    'meta[name="description"]',
    'meta[property="og:description"]',
    'meta[name="twitter:description"]',
  ])
    assert.equal($(selector).attr('content'), description);
  assert.equal(
    $('link[rel="canonical"]').attr('href'),
    `https://brimframe.de${route}`,
  );
  assert.equal(
    $('meta[property="og:url"]').attr('content'),
    `https://brimframe.de${route}`,
  );
  assert.equal($('meta[property="og:type"]').attr('content'), 'article');
  const hero = $('meta[property="og:image"]').attr('content');
  assert.match(
    hero,
    /^https:\/\/brimframe\.de\/_astro\/dynamic-weather-hero.*\.webp$/,
  );
  assert.equal($('meta[name="twitter:image"]').attr('content'), hero);
  assert.equal(
    $('meta[name="twitter:card"]').attr('content'),
    'summary_large_image',
  );
  assert.equal($('meta[property="og:image:width"]').attr('content'), '1200');
  assert.equal($('meta[property="og:image:height"]').attr('content'), '675');
  assert.equal(
    $('meta[property="og:image:alt"]').attr('content'),
    $('.article-image').attr('alt'),
  );
  assert.ok(
    (await stat(path.join(root, new URL(hero).pathname))).size < 250 * 1024,
  );
  const article = $('script[type="application/ld+json"]')
    .toArray()
    .map((node) => JSON.parse($(node).html()))
    .find((data) => data['@type'] === 'BlogPosting');
  assert.deepEqual(article.author, {
    '@type': 'Organization',
    name: 'BrimFrame',
  });
  assert.equal(article.datePublished, '2026-10-21T00:00:00.000Z');
  assert.equal(article.image.url, hero);
  for (const file of ['index.html', 'devlog/index.html']) {
    const page = load(await read(file));
    assert.equal(page('.devlog-card h3 a').first().attr('href'), route);
    assert.match(
      page('.devlog-card').first().find('img').attr('src'),
      /dynamic-weather-hero/,
    );
  }
  const feed = load(await read('rss.xml'), { xmlMode: true });
  assert.equal(
    feed('item').first().find('link').text(),
    `https://brimframe.de${route}`,
  );
  assert.match(feed('item').first().find('author').text(), /^BrimFrame /);
  assert.ok((await read('sitemap-0.xml')).includes(route));
  assert.equal(
    $('.article-navigation a').attr('href'),
    '/devlog/riff-racers-frostfire-run/',
  );
  const older = load(await read('devlog/riff-racers-frostfire-run/index.html'));
  assert.equal(older('.article-navigation a').first().attr('href'), route);
});

test('weather distributes optimized gameplay images and places one gated trailer in A closer look', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.deepEqual(
    $('.article-content h2')
      .toArray()
      .map((node) => $(node).text()),
    [
      'A weather system that didn’t want to rain',
      'Rain needs to feel like rain',
      'Snow is a different story',
      'It also changes how the karts drive',
      'Same track, different race',
      'A closer look',
    ],
  );
  const expectedFigures = [2, 3, 3, 1, 0, 1];
  $('.article-content h2').each((index, node) => {
    assert.equal(
      $(node).nextUntil('h2').filter('.devlog-figure').length,
      expectedFigures[index],
    );
  });
  assert.equal($('.devlog-figure').length, 10);
  assert.equal($('article img').length, 12);
  assert.equal($('.video-embed').length, 1);
  assert.equal($('.video-embed').prevAll('h2').first().text(), 'A closer look');
  assert.equal($('iframe, video, source[src$=".mp4"]').length, 0);
  assert.equal($('link[rel="preconnect"], link[rel="dns-prefetch"]').length, 0);
  assert.equal(
    $('.video-facade').attr('data-embed-url'),
    'https://www.youtube-nocookie.com/embed/iSuBuV3RGTs',
  );
  assert.equal(
    $('.video-fallback a').attr('href'),
    'https://www.youtube.com/watch?v=iSuBuV3RGTs',
  );
  assert.match(
    $('.video-poster').attr('src'),
    /dynamic-weather-trailer-poster/,
  );
  assert.equal($('.article-image').attr('loading'), 'eager');
  assert.equal($('.article-image').attr('fetchpriority'), 'high');
  for (const node of $('article img').toArray()) {
    const image = $(node);
    assert.ok(image.attr('alt')?.trim());
    assert.equal(
      Number(image.attr('width')) / Number(image.attr('height')),
      16 / 9,
    );
    assert.ok(image.attr('sizes'));
    for (const format of ['avif', 'webp']) {
      assert.match(
        image
          .parent('picture')
          .find(`source[type="image/${format}"]`)
          .attr('srcset'),
        /480w.*800w.*1200w/,
      );
    }
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
