import test from 'node:test';
import assert from 'node:assert/strict';
import { readdir, readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { legal, site } from '../apps/brimframe/src/config/site.ts';

const root = path.resolve('apps/brimframe/dist');
async function filesIn(directory) {
  const entries = await readdir(directory, { withFileTypes: true });
  return (
    await Promise.all(
      entries.map((entry) =>
        entry.isDirectory()
          ? filesIn(path.join(directory, entry.name))
          : path.join(directory, entry.name),
      ),
    )
  ).flat();
}

test('every production internal link and local asset resolves, including fragments', async () => {
  const files = (await filesIn(root)).filter((file) => file.endsWith('.html'));
  assert.ok(files.length >= 9);
  const failures = [];
  for (const file of files) {
    const $ = load(await readFile(file, 'utf8'));
    const pagePath =
      '/' + path.relative(root, file).replace(/index\.html$/, '');
    const base = new URL(pagePath, 'https://brimframe.de');
    for (const element of $(
      'a[href], img[src], script[src], link[href]',
    ).toArray()) {
      const href = $(element).attr('href') ?? $(element).attr('src');
      if (!href || /^(mailto:|tel:|data:)/.test(href)) continue;
      const url = new URL(href, base);
      if (url.origin !== base.origin) continue;
      let target = path.join(root, decodeURIComponent(url.pathname));
      try {
        if ((await stat(target)).isDirectory())
          target = path.join(target, 'index.html');
        const body = await readFile(target, 'utf8');
        if (url.hash && target.endsWith('.html')) {
          const targetDocument = load(body);
          assert.ok(
            targetDocument('[id]')
              .toArray()
              .some(
                (node) =>
                  targetDocument(node).attr('id') ===
                  decodeURIComponent(url.hash.slice(1)),
              ),
          );
        }
      } catch {
        failures.push(`${pagePath} → ${href}`);
      }
    }
    assert.equal($('main').length, 1, file);
    assert.equal($('h1').length, 1, file);
    assert.ok($('title').text().includes('BrimFrame'), file);
    assert.ok(!/Brimframe|Brandframe|BRANDFRAME/.test($('html').text()), file);
    assert.ok($('meta[name="description"]').attr('content'), file);
  }
  assert.deepEqual(failures, []);
});

test('draft sample and legal pages awaiting launch review are excluded from indexing', async () => {
  const sitemap = await readFile(path.join(root, 'sitemap-0.xml'), 'utf8');
  assert.ok(!sitemap.includes('authoring-example'));
  assert.equal(sitemap.includes('/impressum/'), legal.ready);
  assert.equal(sitemap.includes('/datenschutz/'), legal.ready);
  for (const route of ['impressum', 'datenschutz']) {
    const $ = load(
      await readFile(path.join(root, route, 'index.html'), 'utf8'),
    );
    assert.equal(
      $('meta[name="robots"]').attr('content'),
      legal.ready ? 'index, follow' : 'noindex, follow',
    );
  }
});

test('all public pages are English and the postal address stays on the two legal pages', async () => {
  const files = (await filesIn(root)).filter((file) => file.endsWith('.html'));
  for (const file of files) {
    const html = await readFile(file, 'utf8');
    const $ = load(html);
    assert.equal($('html').attr('lang'), 'en', file);
    if (
      ['impressum', 'datenschutz'].some(
        (route) => file === path.join(root, route, 'index.html'),
      )
    ) {
      assert.ok($('address').text().includes(legal.addressLines[0]));
      assert.ok($('main').text().includes(site.developerName));
    } else {
      assert.ok(!html.includes(legal.addressLines[0]), file);
      assert.ok(!html.includes(legal.addressLines[1]), file);
    }
    assert.ok(!/Hiltenspergerstr|80796/.test($('header, footer').text()), file);
    assert.ok(
      !/\b(our team|we are|we’re|our current|our values)\b/i.test(
        $('body').text(),
      ),
      file,
    );
  }
  const contact = load(
    await readFile(path.join(root, 'contact', 'index.html'), 'utf8'),
  );
  assert.equal(
    contact('main a[href^="mailto:"]').attr('href'),
    `mailto:${site.contactEmail}`,
  );
  assert.equal(contact('form').length, 0);
});
