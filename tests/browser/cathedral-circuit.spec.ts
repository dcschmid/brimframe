import { test, expect } from './fixtures.ts';
import { AxeBuilder } from '@axe-core/playwright';
import { checkSkipLink } from './accessibility.ts';

const route = '/devlog/riff-racers-into-the-cathedral/';
const title = 'Riff Racers Devlog: Into the Cathedral';
const playerTitle = 'Riff Racers – Cathedral Circuit Track Showcase';
const embedUrl =
  'https://www.youtube-nocookie.com/embed/MvOc2T5NI2g?autoplay=1';

for (const width of [320, 375, 768, 1440]) {
  test(`Cathedral Circuit stays local, accessible and readable at ${width}px`, async ({
    page,
  }, testInfo) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
        external.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.article-meta')).toContainText(
      '15 October 2026',
    );
    await expect(page.locator('.article-meta')).toContainText('Daniel Schmid');
    await expect(page.locator('.article-content h1')).toHaveCount(0);
    await expect(page.locator('.article-content h2')).toHaveCount(10);
    await expect(page.locator('.devlog-figure')).toHaveCount(7);
    await expect(page.locator('iframe')).toHaveCount(0);
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await expect(play).toBeVisible();
    await expect(play).toHaveAccessibleDescription(/data may be transferred/);
    await expect(page.locator('.video-poster')).toHaveAttribute(
      'src',
      /^\/_astro\/cathedral-circuit-hero/,
    );
    await checkSkipLink(page);
    for (const image of await page.locator('article img').all()) {
      await image.scrollIntoViewIfNeeded();
      await expect(image).toHaveAttribute('alt', /\S+/);
      await expect
        .poll(() =>
          image.evaluate(
            (node: HTMLImageElement) => node.complete && node.naturalWidth > 0,
          ),
        )
        .toBe(true);
      const box = (await image.boundingBox())!;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await expect(page.locator('footer')).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`cathedral-${width}.png`),
      fullPage: true,
    });
    await page.evaluate(() => {
      document.documentElement.style.fontSize = '200%';
    });
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
    await expect(
      page.locator('link[rel="preconnect"], link[rel="dns-prefetch"]'),
    ).toHaveCount(0);
  });
}

for (const activation of ['Enter', 'Space', 'pointer'] as const) {
  test(`Cathedral trailer needs ${activation} activation and keeps its 16:9 space`, async ({
    page,
  }) => {
    const loads: string[] = [];
    // Keep this regression deterministic; the actual player is reviewed separately.
    await page.route('https://www.youtube-nocookie.com/**', async (request) => {
      loads.push(request.request().url());
      await request.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Player fixture</title><p>Player loaded</p>',
      });
    });
    await page.goto(route);
    await expect(
      page.getByRole('link', { name: 'Watch on YouTube' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=MvOc2T5NI2g');
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await play.scrollIntoViewIfNeeded();
    const before = (await page.locator('.video-facade').boundingBox())!;
    expect(loads).toEqual([]);
    if (activation === 'pointer') {
      await play.click();
    } else {
      await checkSkipLink(page);
      for (let step = 0; step < 24; step++) {
        if (await play.evaluate((node) => node === document.activeElement))
          break;
        await page.keyboard.press('Tab');
      }
      await expect(play).toBeFocused();
      expect(
        await play.evaluate((node) => getComputedStyle(node).outlineStyle),
      ).toBe('solid');
      await page.keyboard.press(activation);
    }
    const iframe = page.locator('.video-frame');
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('src', embedUrl);
    await expect(iframe).toHaveAttribute('title', playerTitle);
    await expect.poll(() => loads).toEqual([embedUrl]);
    const after = (await page.locator('.video-facade').boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    for (const width of [320, 768, 1440]) {
      await page.setViewportSize({ width, height: 900 });
      const frame = (await iframe.boundingBox())!;
      expect(frame.width / frame.height).toBeCloseTo(16 / 9, 1);
      expect(frame.x).toBeGreaterThanOrEqual(0);
      expect(frame.x + frame.width).toBeLessThanOrEqual(width);
    }
  });
}

test('Cathedral Circuit is discoverable through the index and adjacent posts', async ({
  page,
}) => {
  await page.goto('/devlog/');
  const card = page.locator('.devlog-card').first();
  await expect(card).toContainText('Riff Racers heads somewhere darker.');
  await card.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(route);
  await page.getByRole('link', { name: /Older update/ }).click();
  await expect(page).toHaveURL('/devlog/riff-racers-razorline-riot/');
  await page.getByRole('link', { name: /Newer update/ }).click();
  await expect(page).toHaveURL(route);
});
