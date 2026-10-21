import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-the-grid-fights-back/';
const weatherRoute = '/devlog/riff-racers-when-the-weather-changes-the-race/';
const title = 'The Grid Fights Back – Making Racing AI Feel Alive';
const description =
  'How I rebuilt the racing AI in Riff Racers: twelve drivers with their own styles, closer races and opponents that remember who ran them wide.';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('the grid fights back publishes with Daniel as author, its own metadata and discovery links', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('title').text(), `${title} — BrimFrame`);
  assert.equal($('h1').text(), title);
  assert.equal($('.article-meta > span').first().text(), 'By Daniel Schmid');
  assert.equal(
    $('.page-intro').text(),
    'Better racing, twelve distinct personalities, and opponents that remember what happened on the track.',
  );
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
    /^https:\/\/brimframe\.de\/_astro\/grid-fights-back-hero.*\.webp$/,
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
    '@type': 'Person',
    name: 'Daniel Schmid',
  });
  assert.equal(article.headline, title);
  assert.equal(article.datePublished, '2026-10-21T00:00:00.000Z');
  assert.equal(article.image.url, hero);
  for (const file of ['index.html', 'devlog/index.html']) {
    const page = load(await read(file));
    const card = page(`.devlog-card:has(a[href="${route}"])`);
    assert.equal(card.length, 1);
    assert.match(card.find('img').attr('src'), /grid-fights-back-hero/);
    assert.match(card.text(), /I used to win Riff Racers by ten or fifteen/);
  }
  const feed = load(await read('rss.xml'), { xmlMode: true });
  const item = feed('item').filter(
    (_, node) => feed(node).find('title').text() === title,
  );
  assert.equal(item.length, 1);
  assert.equal(item.find('link').text(), `https://brimframe.de${route}`);
  assert.match(item.find('author').text(), /^Daniel Schmid /);
  assert.ok((await read('sitemap-0.xml')).includes(route));
  // It sorts ahead of the weather post, which published the same day.
  assert.equal(
    $('.article-navigation a')
      .filter((_, node) => $(node).text().includes('Older update'))
      .attr('href'),
    weatherRoute,
  );
  const older = load(await read(`${weatherRoute}index.html`));
  assert.equal(
    older('.article-navigation a')
      .filter((_, node) => older(node).text().includes('Newer update'))
      .attr('href'),
    route,
  );
});

test('the grid fights back places one gated trailer after the introduction and distributes optimized gameplay images', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.deepEqual(
    $('.article-content h2')
      .toArray()
      .map((node) => $(node).text()),
    [
      'Making the other drivers race properly',
      'Twelve drivers shouldn’t drive like twelve clones',
      'What happens when another driver remembers you?',
      'Hard but fair',
      'Testing instead of guessing',
      'Every race should have its own story',
    ],
  );
  const expectedFigures = [2, 2, 1, 1, 0, 0];
  $('.article-content h2').each((index, node) => {
    assert.equal(
      $(node).nextUntil('h2').filter('.devlog-figure').length,
      expectedFigures[index],
    );
  });
  assert.equal($('.devlog-figure').length, 6);
  assert.equal($('article img').length, 8);
  // The trailer follows the introductory paragraphs and precedes every section.
  assert.equal($('.video-embed').length, 1);
  assert.equal($('.video-embed').prevAll('h2').length, 0);
  assert.ok($('.video-embed').prevAll('p').length >= 2);
  assert.equal($('iframe, video, source[src$=".mp4"]').length, 0);
  assert.equal($('link[rel="preconnect"], link[rel="dns-prefetch"]').length, 0);
  assert.equal(
    $('.video-facade').attr('data-embed-url'),
    'https://www.youtube-nocookie.com/embed/GDF7JZwDZOI',
  );
  assert.equal(
    $('.video-facade').attr('data-title'),
    'Riff Racers – The Grid Fights Back | Racing AI & Rivalries Gameplay',
  );
  assert.equal(
    $('.video-fallback a').attr('href'),
    'https://www.youtube.com/watch?v=GDF7JZwDZOI',
  );
  assert.match(
    $('.video-poster').attr('src'),
    /grid-fights-back-trailer-poster/,
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

test('the grid fights back links to existing pages and avoids promotional boilerplate', async () => {
  const $ = load(await read(`${route}/index.html`));
  const internal = $('.article-content a')
    .toArray()
    .map((node) => $(node).attr('href'))
    .filter((href) => href.startsWith('/'));
  assert.deepEqual(internal, [
    '/games/',
    '/devlog/riff-racers-road-to-first-demo/',
    weatherRoute,
  ]);
  for (const href of internal)
    assert.ok((await stat(path.join(root, href, 'index.html'))).isFile());
  const text = $('.article-content p, .article-content h2, figcaption')
    .toArray()
    .map((node) => $(node).text())
    .join('\n');
  assert.doesNotMatch(
    text,
    /thrilled|excited to (announce|share)|game-changing|next level|testament to|pushing the boundaries|stay tuned|milestone/i,
  );
  assert.doesNotMatch(text, /!/);
});
