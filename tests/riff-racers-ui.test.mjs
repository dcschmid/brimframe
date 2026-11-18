import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const route = '/devlog/riff-racers-the-interface-joins-the-race/';
const olderRoute =
  '/devlog/riff-racers-beyond-the-finish-line-championship-career/';
const weatherRoute = '/devlog/riff-racers-when-the-weather-changes-the-race/';
const title =
  'The Interface Joins the Race – Fixing the Riff Racers UI in One Week';
const seoTitle = 'Riff Racers UI: One Week of Menu and HUD Fixes';
const description =
  'What changed in the Riff Racers interface in one November week: driver select, grid tyres, the race HUD, results, controller focus and accessibility.';
const videoId = 'tN3YGgsmaJQ';
const read = (file) => readFile(path.join(root, file), 'utf8');

test('the interface devlog publishes with Daniel as author, its own metadata and discovery links', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.equal($('html').attr('lang'), 'en');
  assert.equal($('title').text(), `${seoTitle} — BrimFrame`);
  assert.equal($('h1').text(), title);
  assert.equal($('.article-meta > span').first().text(), 'By Daniel Schmid');
  assert.equal(
    $('.article-meta time').first().attr('datetime'),
    '2026-11-18T00:00:00.000Z',
  );
  assert.ok(description.length <= 160);
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
    /^https:\/\/brimframe\.de\/_astro\/riff-racers-ui-grid-forecast-and-tyres.*\.webp$/,
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
    url: 'https://brimframe.de/about/',
  });
  assert.equal(article.headline, title);
  assert.equal(article.datePublished, '2026-11-18T00:00:00.000Z');
  assert.equal(article.image.url, hero);
  for (const file of ['index.html', 'devlog/index.html']) {
    const page = load(await read(file));
    const card = page(`.devlog-card:has(a[href="${route}"])`);
    assert.equal(card.length, 1);
    assert.match(card.find('img').attr('src'), /riff-racers-ui-grid-forecast/);
    assert.match(card.text(), /An old build could lose a race result/);
  }
  const feed = load(await read('rss.xml'), { xmlMode: true });
  const item = feed('item').filter(
    (_, node) => feed(node).find('title').text() === title,
  );
  assert.equal(item.length, 1);
  assert.equal(item.find('link').text(), `https://brimframe.de${route}`);
  assert.match(item.find('author').text(), /^Daniel Schmid /);
  assert.ok((await read('sitemap-0.xml')).includes(route));
  // Newest update: no newer neighbour, Beyond the Finish Line is the older one.
  const navigation = $('.article-navigation a');
  assert.equal(
    navigation.filter((_, node) => $(node).text().includes('Newer update'))
      .length,
    0,
  );
  assert.equal(
    navigation
      .filter((_, node) => $(node).text().includes('Older update'))
      .attr('href'),
    olderRoute,
  );
  const older = load(await read(`${olderRoute}index.html`));
  assert.equal(
    older('.article-navigation a')
      .filter((_, node) => older(node).text().includes('Newer update'))
      .attr('href'),
    route,
  );
});

test('the interface devlog keeps the section order, stacks before/after pairs and gates one video', async () => {
  const $ = load(await read(`${route}/index.html`));
  assert.deepEqual(
    $('.article-content h2')
      .toArray()
      .map((node) => $(node).text()),
    [
      'Audit first, redraw second',
      'A kart that did not fit the frame',
      'Tracks and sets, written out',
      'Tyres before the green light',
      'The race still matters most',
      'Fewer interruptions between races',
      'Built for a controller, checked at handheld sizes',
      'Accessibility, and an honest default',
      'Tried, dropped, and still open',
      'The same week in 88 seconds',
      'One week, and then back to the game',
    ],
  );
  assert.equal($('.devlog-figure').length, 11);
  // 1 hero + 11 figures + 1 video poster
  assert.equal($('article img').length, 13);
  // Before/after pairs are consecutive figures, labelled in the visible caption.
  const captions = $('.devlog-figure figcaption')
    .toArray()
    .map((node) => $(node).text());
  for (const [before, after] of [
    [0, 1],
    [2, 3],
    [4, 5],
  ]) {
    assert.match(
      captions[before],
      /^Before: build [0-9a-f]{7} from 1[34] November/,
    );
    assert.match(captions[after], /^After: main at 4de82a8/);
    assert.ok(
      $($('.devlog-figure')[before]).next().is('.devlog-figure'),
      'pair is stacked, not a side-by-side composite',
    );
  }
  assert.equal($('.video-embed').length, 1);
  // The video sits in its own section: nine earlier sections plus its own heading.
  assert.equal($('.video-embed').prevAll('h2').length, 10);
  assert.equal($('iframe, video, source[src$=".mp4"]').length, 0);
  assert.equal($('link[rel="preconnect"], link[rel="dns-prefetch"]').length, 0);
  assert.equal(
    $('.video-facade').attr('data-embed-url'),
    `https://www.youtube-nocookie.com/embed/${videoId}`,
  );
  assert.equal(
    $('.video-facade').attr('data-title'),
    'Riff Racers – Sprint 2 UI/UX Showcase | The Interface Joins the Race',
  );
  assert.equal(
    $('.video-fallback a').attr('href'),
    `https://www.youtube.com/watch?v=${videoId}`,
  );
  assert.match(
    $('.video-poster').attr('src'),
    /riff-racers-ui-showcase-poster/,
  );
  assert.equal($('.article-image').attr('loading'), 'eager');
  assert.equal($('.article-image').attr('fetchpriority'), 'high');
  for (const node of $('article img').toArray()) {
    const image = $(node);
    assert.ok(image.attr('alt')?.trim());
    assert.ok(Number(image.attr('width')) > 0);
    assert.ok(Number(image.attr('height')) > 0);
    assert.ok(image.attr('sizes'));
    for (const format of ['avif', 'webp']) {
      assert.match(
        image
          .parent('picture')
          .find(`source[type="image/${format}"]`)
          .attr('srcset'),
        /480w.*800w/,
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

test('the interface devlog links to existing pages and stays inside the documented claims', async () => {
  const $ = load(await read(`${route}/index.html`));
  const internal = $('.article-content a')
    .toArray()
    .map((node) => $(node).attr('href'))
    .filter((href) => href.startsWith('/'));
  assert.deepEqual(internal, ['/games/', olderRoute, weatherRoute, '/devlog/']);
  for (const href of internal)
    assert.ok((await stat(path.join(root, href, 'index.html'))).isFile());
  const text = $('.article-content p, .article-content h2, figcaption')
    .toArray()
    .map((node) => $(node).text())
    .join('\n');
  assert.doesNotMatch(
    text,
    /thrilled|excited to (announce|share)|game-changing|next level|testament to|pushing the boundaries|stay tuned|milestone|seamless/i,
  );
  assert.doesNotMatch(text, /!/);
  // Editorial limits from the fact base: no accessibility, platform or release overclaims.
  assert.doesNotMatch(
    text,
    /fully accessible|WCAG|Steam Deck verified|release date|available now|out now/i,
  );
  // Required disclosures stay with the material they qualify.
  assert.match(text, /virtual gamepad/);
  assert.match(text, /game[’']s (own )?AI/);
  assert.match(text, /developer switch/);
});
