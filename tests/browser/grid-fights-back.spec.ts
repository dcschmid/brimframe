import { test, expect } from './fixtures.ts';
import { AxeBuilder } from '@axe-core/playwright';
import { checkSkipLink } from './accessibility.ts';

const route = '/devlog/riff-racers-the-grid-fights-back/';
const weatherRoute = '/devlog/riff-racers-when-the-weather-changes-the-race/';
const title = 'The Grid Fights Back – Making Racing AI Feel Alive';
const playerTitle =
  'Riff Racers – The Grid Fights Back | Racing AI & Rivalries Gameplay';
const embedUrl =
  'https://www.youtube-nocookie.com/embed/GDF7JZwDZOI?autoplay=1';
const fallbackUrl = 'https://www.youtube.com/watch?v=GDF7JZwDZOI';

for (const [width, height] of [
  [320, 800],
  [768, 1024],
  [1440, 1000],
]) {
  test(`The grid fights back renders without external requests or overflow at ${width}×${height}`, async ({
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
    page.on('response', (response) => {
      if (response.status() >= 400)
        errors.push(`${response.status()} ${response.url()}`);
    });
    await page.setViewportSize({ width, height });
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await checkSkipLink(page);
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await expect(play).toBeVisible();
    await expect(play).toHaveAccessibleDescription(
      /data may be transferred to Google\/YouTube/,
    );
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
    await expect(page.locator('iframe')).toHaveCount(0);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(audit.violations).toEqual([]);
    await page.screenshot({
      path: testInfo.outputPath(`grid-fights-back-${width}.png`),
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
  });
}

for (const activation of ['Enter', 'Space', 'pointer'] as const) {
  test(`The grid fights back loads the privacy player only after ${activation} and reserves its size`, async ({
    page,
  }) => {
    const loads: string[] = [];
    // Keep CI independent of YouTube availability; live playback is checked separately.
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
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'strict-origin-when-cross-origin',
    );
    await expect(iframe).toHaveAttribute('allowfullscreen', '');
    await expect(iframe).toHaveAttribute(
      'allow',
      'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share',
    );
    await expect.poll(() => loads).toEqual([embedUrl]);
    const after = (await facade.boundingBox())!;
    expect(after.width).toBeCloseTo(before.width, 1);
    expect(after.height).toBeCloseTo(before.height, 1);
    for (const [width, height] of [
      [320, 800],
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

test('The grid fights back keeps its local poster and trailer link without JavaScript', async ({
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
    await expect(page.locator('iframe')).toHaveCount(0);
    await expect(
      page.getByRole('button', { name: `Play ${playerTitle}` }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Watch on YouTube' }),
    ).toHaveAttribute('href', fallbackUrl);
    await expect(
      page.getByRole('heading', { name: 'Hard but fair' }),
    ).toBeVisible();
    expect(external).toEqual([]);
  } finally {
    await context.close();
  }
});

test('The grid fights back is discoverable and connects to the previous update', async ({
  page,
}) => {
  for (const listing of ['/', '/devlog/']) {
    await page.goto(listing);
    await page.getByRole('link', { name: title, exact: true }).click();
    await expect(page).toHaveURL(route);
  }
  await page.getByRole('link', { name: /Older update/ }).click();
  await expect(page).toHaveURL(weatherRoute);
  await page.getByRole('link', { name: /Newer update/ }).click();
  await expect(page).toHaveURL(route);
});
