import { test, expect } from './fixtures.ts';
import { AxeBuilder } from '@axe-core/playwright';
import { checkSkipLink } from './accessibility.ts';

const route = '/devlog/riff-racers-thunderforge/';
const title = 'Thunderforge – When a Track Starts to Feel Like a Place';
const playerTitle = 'Riff Racers – Thunderforge | Track 04 Trailer';
const embedUrl =
  'https://www.youtube-nocookie.com/embed/_cMQi0Td_SU?autoplay=1';
const fallbackUrl = 'https://www.youtube.com/watch?v=_cMQi0Td_SU';

for (const [width, height] of [
  [320, 800],
  [844, 390],
  [768, 1024],
  [1440, 1000],
]) {
  test(`Thunderforge is accessible and stays local at ${width}×${height}`, async ({
    page,
  }, testInfo) => {
    const external: string[] = [];
    const errors: string[] = [];
    const failures: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
        external.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    page.on('response', (response) => {
      if (response.status() >= 400) failures.push(response.url());
    });
    await page.setViewportSize({ width, height });
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.article-meta')).toContainText(
      '16 October 2026',
    );
    await expect(page.locator('iframe')).toHaveCount(0);
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await expect(play).toBeVisible();
    await expect(play).toHaveAccessibleDescription(/data may be transferred/);
    await checkSkipLink(page);
    for (const image of await page.locator('article img').all()) {
      await image.scrollIntoViewIfNeeded();
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
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
    }
    await expect(page.locator('footer')).toBeVisible();
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`thunderforge-${width}.png`),
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
    expect(failures).toEqual([]);
  });
}

for (const activation of ['Enter', 'Space', 'pointer'] as const) {
  test(`Thunderforge trailer loads after ${activation} and keeps its space`, async ({
    page,
  }) => {
    const loads: string[] = [];
    // Provider-independent privacy/interaction regression; live playback is checked separately.
    await page.route('https://www.youtube-nocookie.com/**', async (request) => {
      loads.push(request.request().url());
      await request.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Player fixture</title>',
      });
    });
    await page.goto(route);
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await play.scrollIntoViewIfNeeded();
    const facade = page.locator('.video-facade');
    const before = (await facade.boundingBox())!;
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
    await expect(iframe).toHaveAttribute('src', embedUrl);
    await expect(iframe).toHaveAttribute('title', playerTitle);
    await expect(iframe).toHaveAttribute('allowfullscreen', '');
    await expect.poll(() => loads).toEqual([embedUrl]);
    const after = (await facade.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    for (const [width, height] of [
      [320, 800],
      [844, 390],
      [768, 1024],
      [1440, 1000],
    ]) {
      await page.setViewportSize({ width, height });
      const box = (await iframe.boundingBox())!;
      expect(box.width / box.height).toBeCloseTo(16 / 9, 1);
      expect(box.x + box.width).toBeLessThanOrEqual(width);
    }
    await expect(
      page.getByRole('link', { name: 'Watch on YouTube' }),
    ).toHaveAttribute('href', fallbackUrl);
  });
}

test('Thunderforge remains readable without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: 'http://127.0.0.1:4321',
    viewport: { width: 320, height: 800 },
  });
  try {
    const page = await context.newPage();
    const external: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
        external.push(request.url());
    });
    await page.goto(route);
    await expect(
      page.getByRole('button', { name: `Play ${playerTitle}` }),
    ).toHaveCount(0);
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Watch on YouTube' }),
    ).toHaveAttribute('href', fallbackUrl);
    await expect(
      page.getByRole('heading', { name: 'Four tracks down' }),
    ).toBeVisible();
    expect(external).toEqual([]);
  } finally {
    await context.close();
  }
});

test('a blocked YouTube player leaves the trailer link and article available', async ({
  page,
}) => {
  await page.route('https://www.youtube-nocookie.com/**', (request) =>
    request.abort(),
  );
  await page.goto(route);
  await page.getByRole('button', { name: `Play ${playerTitle}` }).click();
  await expect(
    page.getByRole('link', { name: 'Watch on YouTube' }),
  ).toHaveAttribute('href', fallbackUrl);
  await expect(
    page.getByRole('heading', { name: 'Four tracks down' }),
  ).toBeVisible();
});

test('Thunderforge is linked from the devlog and adjacent update', async ({
  page,
}) => {
  await page.goto('/devlog/');
  const card = page.locator('.devlog-card').filter({
    has: page.getByRole('link', { name: title, exact: true }),
  });
  await expect(card).toContainText(
    'Thunderforge looked finished more than once.',
  );
  await card.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(route);
  await page.getByRole('link', { name: /Older update/ }).click();
  await expect(page).toHaveURL('/devlog/riff-racers-into-the-cathedral/');
  await page.getByRole('link', { name: /Newer update/ }).click();
  await expect(page).toHaveURL(route);
});
