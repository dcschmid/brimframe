import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

const root = path.resolve('apps/brimframe/dist');
const read = (p) => readFile(path.join(root, p), 'utf8');

test('robots.txt ships and points crawlers at the sitemap', async () => {
  const robots = await read('robots.txt');
  assert.match(robots, /User-agent: \*\nAllow: \//);
  assert.match(robots, /Sitemap: https:\/\/brimframe\.de\/sitemap-index\.xml/);
});

test('RSS feed is valid and excludes drafts; items carry absolute links', async () => {
  const feed = await read('rss.xml');
  const $ = load(feed, { xmlMode: true });
  assert.equal($('channel > title').text(), 'BrimFrame Devlog');
  assert.equal($('channel > language').text(), 'en');
  assert.equal(
    $('channel > image > url').text(),
    'https://brimframe.de/og-image.png',
  );
  assert.equal($('channel > image > title').text(), 'BrimFrame');
  assert.equal($('channel > image > link').text(), 'https://brimframe.de');
  assert.equal($('channel > image > width').text(), '1200');
  assert.equal($('channel > image > height').text(), '630');
  assert.ok(
    $('item').length === 0 || $('item > link').length === $('item').length,
  );
  const links = $('item > link')
    .toArray()
    .map((el) => $(el).text());
  assert.ok(
    !links.some((l) => l.includes('authoring-example')),
    'drafts must not appear in the feed',
  );
  for (const link of links) {
    assert.match(link, /^https:\/\/brimframe\.de\/devlog\/[a-z0-9-]+\/$/);
  }
});

test('every indexable page carries canonical, og:image and twitter card', async () => {
  for (const p of ['index.html', 'games/index.html', 'devlog/index.html']) {
    const $ = load(await read(p));
    assert.equal($('link[rel="canonical"]').length, 1, p);
    assert.match(
      $('link[rel="canonical"]').attr('href'),
      /^https:\/\/brimframe\.de\//,
      p,
    );
    assert.equal($('meta[property="og:image"]').length, 1, p);
    assert.match(
      $('meta[property="og:image"]').attr('content'),
      /og-image\.png$/,
      p,
    );
    assert.equal(
      $('meta[property="og:image:width"]').attr('content'),
      '1200',
      p,
    );
    assert.equal(
      $('meta[property="og:image:height"]').attr('content'),
      '630',
      p,
    );
    assert.ok($('meta[property="og:image:alt"]').attr('content').length > 0, p);
    assert.equal(
      $('meta[name="twitter:card"]').attr('content'),
      'summary_large_image',
      p,
    );
    assert.equal(
      $('link[rel="alternate"][type="application/rss+xml"]').length,
      1,
      p,
    );
    assert.equal($('link[rel="sitemap"]').length, 1, p);
    const blocks = $('script[type="application/ld+json"]')
      .toArray()
      .map((el) =>
        JSON.parse(
          $(el)
            .html()
            .replace(/\\u003c/g, '<'),
        ),
      );
    const org = blocks.find((b) => b['@type'] === 'Organization');
    assert.ok(org, `${p}: Organization JSON-LD`);
    assert.equal(org.founder?.name, 'Daniel Schmid', `${p}: founder`);
    assert.match(org.logo, /og-image\.png$/, `${p}: logo`);
    assert.equal(org.email, 'dcschmid@murena.io', `${p}: email`);
  }
});

test('devlog articles emit BlogPosting and BreadcrumbList JSON-LD', async () => {
  const feed = await read('rss.xml');
  const $ = load(feed, { xmlMode: true });
  const links = $('item > link')
    .toArray()
    .map((el) => $(el).text());
  for (const link of links) {
    const slug = link.split('/').filter(Boolean).pop();
    const page = load(await read(`devlog/${slug}/index.html`));
    const blocks = page('script[type="application/ld+json"]')
      .toArray()
      .map((el) =>
        JSON.parse(
          page(el)
            .html()
            .replace(/\\u003c/g, '<'),
        ),
      );
    const article = blocks.find((b) => b['@type'] === 'BlogPosting');
    const crumbs = blocks.find((b) => b['@type'] === 'BreadcrumbList');
    assert.ok(article, `${link}: needs BlogPosting JSON-LD`);
    assert.ok(article.headline, `${link}: headline`);
    assert.equal(
      page('.article-heading .article-meta > span').first().text(),
      `By ${article.author?.name}`,
      `${link}: visible and structured author agree`,
    );
    assert.equal(
      article.author?.['@type'],
      article.author?.name === 'BrimFrame' ? 'Organization' : 'Person',
      `${link}: author type`,
    );
    assert.ok(article.datePublished, `${link}: datePublished`);
    const image = article.image;
    assert.ok(image, `${link}: image from real content`);
    assert.match(
      typeof image === 'object' ? image.url : image,
      /^https:\/\/brimframe\.de\//,
      `${link}: absolute image URL`,
    );
    assert.ok(crumbs, `${link}: needs BreadcrumbList JSON-LD`);
    assert.deepEqual(
      crumbs.itemListElement.map((e) => e.position),
      [1, 2, 3],
      `${link}: three crumbs`,
    );
    assert.equal(
      crumbs.itemListElement[1].item,
      'https://brimframe.de/devlog/',
      `${link}: devlog crumb`,
    );
    assert.equal(
      crumbs.itemListElement[2].item,
      undefined,
      `${link}: last crumb carries no item`,
    );
  }
});

test('404 page is noindexed and has no canonical', async () => {
  const $ = load(await read('404.html'));
  assert.match($('meta[name="robots"]').attr('content'), /^noindex/);
  assert.equal($('link[rel="canonical"]').length, 0);
});

test('OG image is a real 1200x630 PNG within social-card size budget', async () => {
  const { createRequire } = await import('node:module');
  const sharp = createRequire(import.meta.url)(
    '../apps/brimframe/node_modules/sharp',
  );
  const meta = await sharp(path.join(root, 'og-image.png')).metadata();
  assert.equal(meta.format, 'png');
  assert.equal(meta.width, 1200);
  assert.equal(meta.height, 630);
  const { size } = await stat(path.join(root, 'og-image.png'));
  assert.ok(size < 300 * 1024, `og-image.png too large: ${size}`);
});

test('sitemap carries a lastmod for every published devlog article', async () => {
  const $ = load(await read('sitemap-0.xml'), { xmlMode: true });
  const devlog = $('url')
    .toArray()
    .map((el) => $(el))
    .filter((url) =>
      url.find('loc').text().startsWith('https://brimframe.de/devlog/'),
    );
  const articles = devlog.filter(
    (url) => url.find('loc').text() !== 'https://brimframe.de/devlog/',
  );
  const feed = load(await read('rss.xml'), { xmlMode: true });
  assert.equal(articles.length, feed('item').length);
  for (const url of articles) {
    const lastmod = url.find('lastmod').text();
    assert.match(
      lastmod,
      /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/,
      `${url.find('loc').text()} needs an ISO lastmod`,
    );
  }
});

test('every published devlog article ships avif and webp sources with a light fallback', async () => {
  const feed = load(await read('rss.xml'), { xmlMode: true });
  for (const link of feed('item > link')
    .toArray()
    .map((el) => feed(el).text())) {
    const slug = link.split('/').filter(Boolean).pop();
    const page = load(await read(`devlog/${slug}/index.html`));
    const images = page('article img');
    assert.ok(images.length > 0, `${slug}: article needs images`);
    for (const node of images.toArray()) {
      const image = page(node);
      assert.equal(
        image.parent('picture').find('source[type="image/avif"]').length,
        1,
        `${slug}: missing avif source`,
      );
      assert.equal(
        image.parent('picture').find('source[type="image/webp"]').length,
        1,
        `${slug}: missing webp source`,
      );
      assert.ok(
        (await stat(path.join(root, image.attr('src')))).size < 300 * 1024,
        `${slug}: fallback ${image.attr('src')} exceeds 300 kB`,
      );
    }
  }
});

test('devlog index loads the first card eagerly and the rest lazily', async () => {
  const $ = load(await read('devlog/index.html'));
  const cards = $('.devlog-card');
  assert.ok(cards.length > 1);
  const first = $(cards[0]).find('img');
  assert.equal(first.attr('loading'), 'eager');
  assert.equal(first.attr('fetchpriority'), 'high');
  for (const card of cards.toArray().slice(1)) {
    assert.equal($(card).find('img').attr('loading'), 'lazy');
  }
});
