import test from 'node:test';
import assert from 'node:assert/strict';
import {
  cp,
  mkdir,
  mkdtemp,
  symlink,
  writeFile,
  readFile,
  rm,
  access,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { load } from 'cheerio';

const run = promisify(execFile);
test(
  'real collection builds handle zero and multiple published articles, excluding drafts and limiting homepage updates',
  { timeout: 60000 },
  async () => {
    const temporary = await mkdtemp(
      path.join(tmpdir(), 'brimframe-content-test-'),
    );
    const original = path.resolve('apps/brimframe');
    try {
      for (const file of [
        'src',
        'public',
        'astro.config.mjs',
        'tsconfig.json',
        'package.json',
      ]) {
        await cp(path.join(original, file), path.join(temporary, file), {
          recursive: true,
        });
      }
      await symlink(
        path.join(original, 'node_modules'),
        path.join(temporary, 'node_modules'),
        'dir',
      );
      const contentDirectory = path.join(temporary, 'src/content/devlog');
      await rm(contentDirectory, { recursive: true, force: true });
      await mkdir(contentDirectory, { recursive: true });
      await writeFile(
        path.join(contentDirectory, 'draft.md'),
        "---\ntitle: 'An isolated draft'\ndescription: 'Not for publication.'\npublishDate: 2026-10-05\ndraft: true\n---\nPrivate draft body.\n",
      );
      const build = () =>
        run(
          process.execPath,
          [path.join(original, 'node_modules/astro/bin/astro.mjs'), 'build'],
          { cwd: temporary, timeout: 45000 },
        );
      await build();
      const emptyIndex = load(
        await readFile(path.join(temporary, 'dist/devlog/index.html'), 'utf8'),
      );
      assert.equal(emptyIndex('.devlog-card').length, 0);
      assert.equal(emptyIndex('.devlog-empty').length, 1);
      await assert.rejects(
        access(path.join(temporary, 'dist/devlog/draft/index.html')),
      );
      for (const [index, draft] of [
        [1, false],
        [2, false],
        [3, false],
        [4, false],
        [5, true],
      ]) {
        await writeFile(
          path.join(temporary, 'src/content/devlog', `fixture-${index}.md`),
          `---\ntitle: 'Test fixture ${index}'\ndescription: 'Only used in an isolated test build.'\npublishDate: 2026-10-0${index}\ndraft: ${draft}\ntags: ['test']\ngame: 'riff-racers'\n---\n\n## A test section\n\nA test paragraph.\n`,
        );
      }
      await build();
      const home = load(
        await readFile(path.join(temporary, 'dist/index.html'), 'utf8'),
      );
      const index = load(
        await readFile(path.join(temporary, 'dist/devlog/index.html'), 'utf8'),
      );
      assert.equal(home('.devlog-card').length, 3);
      assert.equal(index('.devlog-card').length, 4);
      assert.deepEqual(
        index('.devlog-card h3')
          .toArray()
          .map((node) => index(node).text().replace('↗', '').trim()),
        [
          'Test fixture 4',
          'Test fixture 3',
          'Test fixture 2',
          'Test fixture 1',
        ],
      );
      const article = load(
        await readFile(
          path.join(temporary, 'dist/devlog/fixture-3/index.html'),
          'utf8',
        ),
      );
      assert.equal(article('article h1').text(), 'Test fixture 3');
      assert.equal(article('.article-content h2').text(), 'A test section');
      assert.equal(
        article('meta[property="og:type"]').attr('content'),
        'article',
      );
      assert.equal(article('.article-navigation a').length, 2);
      await assert.rejects(
        access(path.join(temporary, 'dist/devlog/fixture-5/index.html')),
      );
    } finally {
      await rm(temporary, { recursive: true, force: true });
    }
  },
);
