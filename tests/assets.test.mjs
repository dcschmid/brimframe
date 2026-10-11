import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';

test('the official logo source is unchanged and responsive PNGs keep transparency and aspect ratio', async () => {
  const assetRoot = 'apps/brimframe/src/assets/games/riff-racers';
  const original = await readFile(path.join(assetRoot, 'logo.png'));
  const documentation = await readFile(
    path.join(assetRoot, 'README.md'),
    'utf8',
  );
  const documentedHash = documentation.match(/[a-f0-9]{64}/)?.[0];
  assert.equal(
    createHash('sha256').update(original).digest('hex'),
    documentedHash,
  );
  const output = 'apps/brimframe/dist';
  for (const route of ['index.html', 'games/index.html']) {
    const $ = load(await readFile(path.join(output, route), 'utf8'));
    const logo = $('img.game-logo');
    assert.equal(logo.length, 1);
    assert.equal(logo.attr('alt'), '');
    assert.equal(logo.attr('loading'), 'lazy');
    assert.ok(logo.attr('sizes'));
    const candidates = logo.attr('srcset')?.split(',') ?? [];
    assert.ok(candidates.length >= 3);
    for (const candidate of candidates) {
      const [url, descriptor] = candidate.trim().split(/\s+/);
      const file = path.join(output, url);
      const png = await readFile(file);
      assert.deepEqual(
        [...png.subarray(0, 8)],
        [137, 80, 78, 71, 13, 10, 26, 10],
      );
      const width = png.readUInt32BE(16);
      const height = png.readUInt32BE(20);
      assert.equal(width, Number.parseInt(descriptor));
      assert.equal(width / height, 3);
      assert.equal(
        png[25],
        6,
        'PNG must retain true-colour RGBA, without a quantised palette',
      );
      assert.ok((await stat(file)).size < original.length);
    }
  }
});
