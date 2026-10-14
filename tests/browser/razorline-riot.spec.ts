import { test, expect } from '@playwright/test';
import { AxeBuilder } from '@axe-core/playwright';
import { checkSkipLink } from './accessibility.ts';

const route = '/devlog/riff-racers-razorline-riot/';
const ironChorus = '/devlog/riff-racers-iron-chorus-reworked/';
const title = 'Razorline Riot – Faster, Tighter, Meaner';
const playerTitle = 'Riff Racers – Razorline Riot Track Showcase';
const embedUrl =
  'https://www.youtube-nocookie.com/embed/wDDfm4oY-no?autoplay=1';

for (const width of [320, 375, 768, 1440]) {
  test(`Razorline Riot is readable and loads only local assets at ${width}px`, async ({
    page,
    context,
  }) => {
    const external: string[] = [];
    const errors: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
        external.push(request.url());
    });
    page.on('pageerror', (error) => errors.push(error.message));
    await page.setViewportSize({ width, height: 900 });
    await page.goto(route);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(page.locator('.article-meta')).toContainText('Daniel Schmid');
    await expect(page.locator('.devlog-figure')).toHaveCount(7);
    await expect(page.locator('iframe')).toHaveCount(0);
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await expect(play).toBeVisible();
    await expect(play).toHaveAccessibleDescription(/data may be transferred/);
    await expect(page.locator('.video-title')).toHaveText(playerTitle);
    await expect(page.locator('.video-poster')).toHaveAttribute(
      'src',
      /^\/_astro\/riff-racers-devlog-razorline-riot-arena-hero/,
    );
    await checkSkipLink(page);

    // Traverse the whole article to trigger every lazy image, not just the hero.
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
    await expect(page.locator('.article-navigation')).toBeVisible();
    await expect(page.locator('footer')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    const audit = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(audit.violations).toEqual([]);
    expect(external).toEqual([]);
    expect(errors).toEqual([]);
    expect(await context.cookies()).toEqual([]);
    expect(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
    ).toBe(0);
    await expect(
      page.locator('link[rel="preconnect"], link[rel="dns-prefetch"]'),
    ).toHaveCount(0);
  });
}

for (const activation of ['Enter', 'Space', 'pointer'] as const) {
  test(`video loads once after ${activation} with stable responsive geometry`, async ({
    page,
  }) => {
    // Stub the provider here so the privacy regression is network-independent.
    // Live playback is checked separately against the actual YouTube player.
    const loads: string[] = [];
    await page.route('https://www.youtube-nocookie.com/**', async (request) => {
      loads.push(request.request().url());
      await request.fulfill({
        contentType: 'text/html',
        body: '<!doctype html><title>Player fixture</title><p>Player loaded</p>',
      });
    });
    await page.goto(route);
    const facade = page.locator('.video-facade');
    const play = page.getByRole('button', { name: `Play ${playerTitle}` });
    await play.scrollIntoViewIfNeeded();
    const before = (await facade.boundingBox())!;
    expect(before.width / before.height).toBeCloseTo(16 / 9, 1);
    expect(loads).toEqual([]);
    if (activation === 'pointer') {
      await play.click({ clickCount: 2 });
    } else {
      await checkSkipLink(page);
      for (let step = 0; step < 20; step++) {
        if (await play.evaluate((node) => node === document.activeElement))
          break;
        await page.keyboard.press('Tab');
      }
      await expect(play).toBeFocused();
      const focus = await play.evaluate((node) => {
        const style = getComputedStyle(node);
        return {
          style: style.outlineStyle,
          width: parseFloat(style.outlineWidth),
        };
      });
      expect(focus.style).toBe('solid');
      expect(focus.width).toBeGreaterThanOrEqual(3);
      await page.keyboard.press(activation);
    }
    const iframe = facade.locator('iframe');
    await expect(iframe).toHaveCount(1);
    await expect(iframe).toHaveAttribute('src', embedUrl);
    await expect(iframe).toHaveAttribute('title', playerTitle);
    await expect(iframe).toHaveAttribute('allowfullscreen', '');
    await expect(iframe).toHaveAttribute('loading', 'lazy');
    await expect(iframe).toHaveAttribute(
      'referrerpolicy',
      'strict-origin-when-cross-origin',
    );
    await expect(iframe).toHaveAttribute(
      'allow',
      /autoplay.*picture-in-picture/,
    );
    await expect(
      page.getByRole('button', { name: `Play ${playerTitle}` }),
    ).toHaveCount(0);
    await expect.poll(() => loads).toEqual([embedUrl]);
    const after = (await facade.boundingBox())!;
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

test('video fallback works without JavaScript and enlarged text reflows', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL: 'http://127.0.0.1:4321',
    viewport: { width: 320, height: 900 },
  });
  const page = await context.newPage();
  const external: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
      external.push(request.url());
  });
  try {
    await page.goto(route);
    await expect(
      page.getByRole('button', { name: `Play ${playerTitle}` }),
    ).toHaveCount(0);
    await expect(
      page.getByRole('link', { name: 'Watch on YouTube' }),
    ).toHaveAttribute('href', 'https://www.youtube.com/watch?v=wDDfm4oY-no');
    await page.evaluate(() =>
      document.documentElement.style.setProperty(
        'font-size',
        '200%',
        'important',
      ),
    );
    await expect(page.locator('.video-privacy')).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await expect(page.locator('iframe')).toHaveCount(0);
    expect(external).toEqual([]);
  } finally {
    await context.close();
  }
});

test('new article appears in the devlog and keeps automatic adjacent navigation', async ({
  page,
}) => {
  await page.goto('/devlog/');
  await page.getByRole('link', { name: title, exact: true }).click();
  await expect(page).toHaveURL(route);
  await expect(page.locator('.article-navigation a')).toHaveAttribute(
    'href',
    ironChorus,
  );
  await page.locator('.article-navigation a').click();
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(
    'Iron Chorus: From Demo Track to Real Circuit',
  );
  await expect(
    page
      .locator('.article-navigation')
      .getByRole('link', { name: /Razorline Riot/ }),
  ).toHaveAttribute('href', route);
  await expect(page.locator('.video-play')).toBeVisible();
  await expect(page.locator('iframe')).toHaveCount(0);
});
