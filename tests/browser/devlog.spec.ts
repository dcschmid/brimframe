import { test, expect } from './fixtures.ts';
import { AxeBuilder } from '@axe-core/playwright';
import {
  cp,
  mkdir,
  mkdtemp,
  readFile,
  rm,
  symlink,
  writeFile,
} from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { createServer } from 'node:http';
import { checkSkipLink } from './accessibility.ts';

// Synthetic content stays in a disposable copy, never in the public collection.
test('published Devlog cards and articles support keyboard navigation, skip links and axe', async ({
  page,
}, testInfo) => {
  test.setTimeout(60000);
  const temporary = await mkdtemp(
    path.join(tmpdir(), 'brimframe-browser-content-'),
  );
  const original = path.resolve('apps/brimframe');
  const output = path.join(temporary, 'dist');
  const server = createServer(async (request, response) => {
    try {
      let pathname = decodeURIComponent(
        new URL(request.url ?? '/', 'http://localhost').pathname,
      );
      if (pathname.endsWith('/')) pathname += 'index.html';
      const file = path.resolve(output, `.${pathname}`);
      if (!file.startsWith(output + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      const body = await readFile(file);
      const types: Record<string, string> = {
        '.html': 'text/html; charset=utf-8',
        '.css': 'text/css',
        '.js': 'text/javascript',
        '.png': 'image/png',
        '.svg': 'image/svg+xml',
        '.woff2': 'font/woff2',
      };
      response
        .writeHead(200, {
          'Content-Type':
            types[path.extname(file)] ?? 'application/octet-stream',
        })
        .end(body);
    } catch {
      response
        .writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' })
        .end(await readFile(path.join(output, '404.html')));
    }
  });
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
    const content = path.join(temporary, 'src/content/devlog');
    await rm(content, { recursive: true, force: true });
    await mkdir(content, { recursive: true });
    for (const [number, draft] of [
      [1, false],
      [2, false],
      [3, false],
      [4, true],
    ] as const) {
      await writeFile(
        path.join(content, `fixture-${number}.md`),
        `---
title: 'Isolated browser fixture ${number}'
description: 'Synthetic content used only by browser tests.'
publishDate: 2026-10-0${number}
draft: ${draft}
tags: ['development']
game: 'riff-racers'
---

## A development note

I use this paragraph to test article reading and navigation. Visit the [Games page](/games/) for the current project.
`,
      );
    }
    const build = await promisify(execFile)(
      process.execPath,
      [path.join(original, 'node_modules/astro/bin/astro.mjs'), 'build'],
      { cwd: temporary, timeout: 45000 },
    );
    await writeFile(
      testInfo.outputPath('fixture-build.log'),
      build.stdout + build.stderr,
    );
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    const address = server.address();
    if (!address || typeof address === 'string')
      throw new Error('No fixture server address');
    const origin = `http://127.0.0.1:${address.port}`;
    const external: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== origin)
        external.push(request.url());
    });
    for (const width of [320, 375, 430, 768, 1024, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      await page.goto(`${origin}/devlog/fixture-2/`);
      await page.evaluate(() => document.fonts.ready);
      await expect(page.getByRole('main')).toHaveCount(1);
      await expect(page.locator('#main-content')).toHaveCount(1);
      await expect(page.locator('article h1')).toHaveCount(1);
      await expect(page).toHaveTitle(/Isolated browser fixture 2/);
      await checkSkipLink(page);
      await expect(
        page.getByRole('link', { name: 'Back to the devlog' }),
      ).toBeFocused();
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
    }
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: testInfo.outputPath('article.png'),
      fullPage: true,
    });
    const articleResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(articleResults.violations).toEqual([]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${origin}/devlog/`);
    await expect(page.locator('.devlog-card')).toHaveCount(3);
    await checkSkipLink(page);
    await expect(
      page.getByRole('link', { name: 'Isolated browser fixture 3' }),
    ).toBeFocused();
    const indexResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(indexResults.violations).toEqual([]);
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${origin}/devlog/fixture-3/`);
    await page.getByRole('link', { name: /Older update/ }).focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL(`${origin}/devlog/fixture-2/`);
    const response = await page.goto(`${origin}/devlog/fixture-4/`);
    expect(response?.status()).toBe(404);
    await checkSkipLink(page);
    expect(external).toEqual([]);
  } finally {
    if (server.listening) {
      await new Promise<void>((resolve, reject) =>
        server.close((error) => (error ? reject(error) : resolve())),
      );
    }
    await rm(temporary, { recursive: true, force: true });
  }
});
