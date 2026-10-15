import { test, expect, FATHOM_SCRIPT_URL } from './fixtures.ts';
import { AxeBuilder } from '@axe-core/playwright';
import { checkSkipLink } from './accessibility.ts';

const routes = [
  '/',
  '/games/',
  '/about/',
  '/devlog/',
  '/contact/',
  '/accessibility/',
  '/impressum/',
  '/datenschutz/',
  '/not-a-page/',
];

for (const route of routes) {
  test(`${route} renders without accessibility violations or runtime errors`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    const response = await page.goto(route);
    expect(response?.status()).toBe(route === '/not-a-page/' ? 404 : 200);
    await expect(page.locator('main h1')).toBeVisible();
    await expect(page).toHaveTitle(/BrimFrame/);
    await expect(page.getByRole('main')).toHaveCount(1);
    await expect(page.locator('#main-content')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
    expect(errors).toEqual([]);
  });
}

test('desktop navigation reaches Games and only the real game appears', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Games', exact: true })
    .click();
  await expect(page).toHaveURL(/\/games\/$/);
  await expect(
    page.getByRole('heading', { name: 'Riff Racers', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.game-spotlight')).toHaveCount(1);
  await expect(page.locator('[aria-current="page"]')).toHaveText('Games');
  const feature = page
    .locator('.game-spotlight')
    .filter({ has: page.locator('#riff-racers-title') });
  const gameSiteLink = feature.getByRole('link', {
    name: 'Visit the Riff Racers website',
  });
  if (await gameSiteLink.count()) {
    await expect(gameSiteLink).toHaveAttribute('href', /^https:\/\//);
  } else {
    await expect(feature.getByRole('link')).toHaveCount(0);
    await expect(
      feature.getByText('Dedicated game site in development.'),
    ).toBeVisible();
  }
});

test('the brand and hero retain readable HTML names alongside decorative vector artwork', async ({
  page,
}) => {
  await page.goto('/');
  await expect(page).toHaveTitle('BrimFrame — Independent Games');
  const brand = page.locator('.site-header .brand-link');
  await expect(brand).toHaveAccessibleName('BRIMFRAME Independent Games home');
  await expect(brand.locator('svg')).toBeVisible();
  await expect(brand.locator('svg')).toHaveAttribute('aria-hidden', 'true');
  const headline = page.getByRole('heading', {
    level: 1,
    name: 'Different Games. New Worlds. Same Passion.',
  });
  await expect(headline).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Explore Games', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'About BrimFrame', exact: true }),
  ).toBeVisible();
  await expect(page.locator('.hero-artwork')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.hero-artwork [tabindex]')).toHaveCount(0);
  await expect(page.locator('.hero-artwork svg')).toHaveAttribute(
    'focusable',
    'false',
  );
});

test('mobile menu works with pointer, keyboard and Escape', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  const toggle = page.locator('.menu-toggle');
  await expect(toggle).toHaveAccessibleName('Menu');
  const nav = page.getByRole('navigation', { name: 'Main navigation' });
  await expect(toggle).toHaveAttribute('aria-expanded', 'false');
  await expect(nav).toBeHidden();
  await toggle.click();
  await expect(toggle).toHaveAttribute('aria-expanded', 'true');
  await expect(toggle).toHaveAccessibleName('Close');
  await nav.getByRole('link', { name: 'About', exact: true }).click();
  await expect(page).toHaveURL(/\/about\/$/);
  await page.getByRole('button', { name: 'Menu', exact: true }).focus();
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  await expect(
    nav.getByRole('link', { name: 'Home', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Menu', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Space');
  const results = await new AxeBuilder({ page })
    .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa'])
    .analyze();
  expect(results.violations).toEqual([]);
});

for (const route of routes) {
  test(`${route} has a first-Tab skip link that visibly focuses and bypasses navigation`, async ({
    page,
  }) => {
    await page.goto(route);
    await checkSkipLink(page);
  });
}

test('the devlog shows published entries or an honest empty state', async ({
  page,
}) => {
  await page.goto('/devlog/');
  const cards = page.locator('.devlog-card');
  if (await cards.count()) {
    await expect(page.locator('.devlog-empty')).toHaveCount(0);
    await expect(cards.first().getByRole('link')).toBeVisible();
  } else {
    await expect(page.locator('.devlog-empty')).toBeVisible();
  }
});

test('menu focus remains usable when changing between mobile and desktop', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 812 });
  await page.goto('/');
  await page.locator('.menu-toggle').focus();
  await page.setViewportSize({ width: 1024, height: 900 });
  const home = page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Home', exact: true });
  await expect(home).toBeFocused();
  await page.setViewportSize({ width: 375, height: 812 });
  await expect(page.locator('.menu-toggle')).toBeFocused();
  await expect(page.locator('#primary-navigation')).toBeHidden();
});

test('unknown routes and unpublished drafts return the custom 404', async ({
  page,
}) => {
  for (const route of [
    '/not-a-page/',
    '/devlog/authoring-example/',
    '/press/',
  ]) {
    const response = await page.goto(route);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Nothing here.' }),
    ).toBeVisible();
  }
});

test('mobile content and navigation work without JavaScript', async ({
  browser,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    viewport: { width: 320, height: 800 },
  });
  const page = await context.newPage();
  await page.goto('http://127.0.0.1:4321/');
  await checkSkipLink(page);
  await expect(page.getByRole('button', { name: 'Menu' })).toHaveCount(0);
  await page
    .getByRole('navigation', { name: 'Main navigation' })
    .getByRole('link', { name: 'Games', exact: true })
    .click();
  await expect(
    page.getByRole('heading', { name: 'Riff Racers', exact: true }),
  ).toBeVisible();
  await context.close();
});

for (const width of [320, 375, 430, 768, 1024, 1440, 1920]) {
  test(`all routes reflow without horizontal overflow at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        route,
      ).toBe(true);
      await checkSkipLink(page);
    }
  });
}

test('content and controls remain usable with text enlarged to 200%', async ({
  page,
}) => {
  for (const width of [320, 720]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.evaluate(async () => {
        document.documentElement.style.fontSize = '200%';
        await document.fonts.ready;
      });
      await checkSkipLink(page);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= window.innerWidth,
        ),
        `${route} at ${width}px / 200% text`,
      ).toBe(true);
      await expect(page.locator('main h1')).toBeVisible();
      const toggle = page.locator('.menu-toggle');
      await toggle.click();
      await expect(
        page.getByRole('navigation', { name: 'Main navigation' }),
      ).toBeVisible();
      await page.keyboard.press('Escape');
      await expect(toggle).toBeFocused();
    }
  }
});

test('no tracking or storage before consent; reduced motion is respected', async ({
  page,
  context,
}) => {
  const external: string[] = [];
  page.on('request', (request) => {
    if (!request.url().startsWith('http://127.0.0.1:4321/'))
      external.push(request.url());
  });
  await page.emulateMedia({ reducedMotion: 'reduce' });
  for (const route of routes) {
    await page.goto(route);
    const analytics = page.locator(`head script[src="${FATHOM_SCRIPT_URL}"]`);
    await expect(analytics).toHaveCount(0);
    await page.evaluate(() => document.fonts.ready);
    expect(
      await page.evaluate(() => localStorage.length + sessionStorage.length),
      route,
    ).toBe(0);
    await checkSkipLink(page);
  }
  expect(external).toEqual([]);
  expect(await context.cookies()).toEqual([]);
  await page.goto('/');
  expect(
    await page
      .locator('.button')
      .first()
      .evaluate((node) => getComputedStyle(node).transitionDuration),
  ).toBe('0s');
});

test('skip navigation remains usable with forced colours and reduced motion', async ({
  page,
}) => {
  await page.emulateMedia({ forcedColors: 'active', reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto('/datenschutz/');
  await checkSkipLink(page);
  await expect(
    page.getByRole('heading', { name: 'Privacy Policy', exact: true }),
  ).toBeVisible();
});

test('the current page remains visibly marked in light and dark forced colours', async ({
  page,
}) => {
  for (const colorScheme of ['light', 'dark'] as const) {
    await page.emulateMedia({ forcedColors: 'active', colorScheme });
    await page.goto('/games/');
    const current = page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Games', exact: true });
    await expect(current).toHaveAttribute('aria-current', 'page');
    const marker = await current.evaluate((link) => {
      const indicator = getComputedStyle(link, '::after');
      return {
        borderWidth: parseFloat(indicator.borderBottomWidth),
        borderColor: indicator.borderBottomColor,
        canvas: getComputedStyle(document.body).backgroundColor,
      };
    });
    expect(marker.borderWidth).toBeGreaterThanOrEqual(2);
    expect(marker.borderColor).not.toBe(marker.canvas);
    expect(marker.borderColor).not.toBe('rgba(0, 0, 0, 0)');
    await current.focus();
    await page.keyboard.press('Tab');
    await expect(
      page
        .getByRole('navigation', { name: 'Main navigation' })
        .getByRole('link', { name: 'About', exact: true }),
    ).toBeFocused();
  }
});

test('reader text spacing preserves content and mobile navigation', async ({
  page,
}) => {
  for (const width of [320, 768]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      await page.addStyleTag({
        content: `
          * {
            line-height: 1.5 !important;
            letter-spacing: 0.12em !important;
            word-spacing: 0.16em !important;
          }
          p { margin-bottom: 2em !important; }
        `,
      });
      await page.evaluate(() => document.fonts.ready);
      await expect(page.locator('main h1')).toBeVisible();
      if (width === 320) {
        await page.getByRole('button', { name: 'Menu', exact: true }).click();
        const navigation = page.getByRole('navigation', {
          name: 'Main navigation',
        });
        await expect(navigation).toBeVisible();
        for (const link of await navigation.getByRole('link').all()) {
          await expect(link).toBeInViewport();
        }
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
        `${route} at ${width}px with reader text spacing`,
      ).toBe(true);
      if (width === 320) {
        await page.keyboard.press('Escape');
        await expect(page.locator('.menu-toggle')).toBeFocused();
      }
    }
  }
});

for (const width of [375, 1440]) {
  test(`forward and reverse keyboard order stays visible and predictable at ${width}px`, async ({
    page,
  }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      await page.goto(route);
      if (width < 768) {
        await page.locator('.menu-toggle').focus();
        await page.keyboard.press('Enter');
        await expect(page.locator('#primary-navigation')).toBeVisible();
        // Keep the disclosure open and start the full walk at the skip link.
        // First-Tab behaviour is verified separately on every route and width.
        await page.locator('.skip-link').focus();
      }
      const targets = await page.evaluate(() =>
        [
          ...document.querySelectorAll<HTMLElement>(
            'a[href], button:not([disabled]), [tabindex="0"]',
          ),
        ]
          .filter((node) => node.checkVisibility())
          .map((node, index) => {
            node.dataset.focusOrder = String(index);
            return { index, name: node.textContent?.trim() ?? node.tagName };
          }),
      );
      for (const { index, name } of targets) {
        if (width >= 768 || index > 0) await page.keyboard.press('Tab');
        const target = page.locator(`[data-focus-order="${index}"]`);
        await expect(target, `${route}: ${name}`).toBeFocused();
        const style = await target.evaluate((node) => ({
          outline: getComputedStyle(node).outlineStyle,
          width: parseFloat(getComputedStyle(node).outlineWidth),
          x: node.getBoundingClientRect().x,
          right: node.getBoundingClientRect().right,
          y: node.getBoundingClientRect().y,
          bottom: node.getBoundingClientRect().bottom,
        }));
        expect(style.outline, `${route}: ${name}`).toBe('solid');
        expect(style.width).toBeGreaterThanOrEqual(3);
        expect(style.x).toBeGreaterThanOrEqual(8);
        expect(style.right).toBeLessThanOrEqual(width - 8);
        expect(style.y, `${route}: ${name}`).toBeGreaterThanOrEqual(8);
        expect(style.bottom, `${route}: ${name}`).toBeLessThanOrEqual(892);
      }
      for (const { index, name } of targets.slice(0, -1).reverse()) {
        await page.keyboard.press('Shift+Tab');
        await expect(
          page.locator(`[data-focus-order="${index}"]`),
          `${route}: reverse ${name}`,
        ).toBeFocused();
      }
      if (width < 768) {
        await page.keyboard.press('Escape');
        await expect(page.locator('.menu-toggle')).toBeFocused();
        await expect(page.locator('#primary-navigation')).toBeHidden();
      }
    }
  });
}

test('desktop navigation and email links activate with Enter', async ({
  page,
}) => {
  await page.goto('/');
  await page.keyboard.press('Tab'); // Skip link
  await page.keyboard.press('Tab'); // BrimFrame home
  await page.keyboard.press('Tab'); // Home
  await page.keyboard.press('Tab'); // Games
  await expect(
    page
      .getByRole('navigation', { name: 'Main navigation' })
      .getByRole('link', { name: 'Games', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/games\/$/);
  await page.goto('/contact/');
  await checkSkipLink(page);
  const mail = page.locator('main a[href^="mailto:"]');
  await expect(mail).toBeFocused();
  await mail.evaluate((node) =>
    node.addEventListener(
      'click',
      (event) => {
        event.preventDefault(); // Verify activation without opening a system mail app.
        node.setAttribute('data-keyboard-activated', 'true');
      },
      { once: true },
    ),
  );
  await page.keyboard.press('Enter');
  await expect(mail).toHaveAttribute('data-keyboard-activated', 'true');
});

test('privacy contents move keyboard focus to the chosen section', async ({
  page,
}) => {
  await page.setViewportSize({ width: 375, height: 900 });
  await page.goto('/datenschutz/');
  await checkSkipLink(page);
  for (let step = 0; step < 3; step++) await page.keyboard.press('Tab');
  await expect(
    page
      .getByRole('navigation', { name: 'Privacy policy sections' })
      .getByRole('link', { name: 'Contact by email', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/#email-contact$/);
  await expect(
    page.getByRole('heading', { name: '4. Contact by email', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', {
      name: 'Murena’s published provider information',
      exact: true,
    }),
  ).toBeFocused();
});
