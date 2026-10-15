import { AxeBuilder } from '@axe-core/playwright';
import {
  test,
  expect,
  FATHOM_SCRIPT_URL,
  FATHOM_TEST_DEPARTURE_URL,
} from './fixtures.ts';
import {
  ANALYTICS_CONSENT_KEY,
  ANALYTICS_CONSENT_MAX_AGE,
} from '../../apps/brimframe/src/utils/analytics-consent.ts';

const banner = '#analytics-consent';
const script = `head script[src="${FATHOM_SCRIPT_URL}"]`;

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    window.addEventListener('fathom-test-pageview', () => {
      const root = document.documentElement;
      root.dataset.testPageviews = String(
        Number(root.dataset.testPageviews ?? 0) + 1,
      );
    });
  });
});

for (const width of [320, 1440]) {
  test(`the consent banner is accessible and gives equal choices at ${width}px`, async ({
    page,
  }, testInfo) => {
    const external: string[] = [];
    page.on('request', (request) => {
      if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
        external.push(request.url());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await expect(page.locator(banner)).toBeVisible();
    await expect(page.locator(script)).toHaveCount(0);
    const reject = page.getByRole('button', {
      name: 'Reject analytics',
      exact: true,
    });
    const accept = page.getByRole('button', {
      name: 'Accept analytics',
      exact: true,
    });
    const rejectBox = (await reject.boundingBox())!;
    const acceptBox = (await accept.boundingBox())!;
    expect(rejectBox.width).toBeCloseTo(acceptBox.width, 2);
    expect(rejectBox.height).toBeCloseTo(acceptBox.height, 2);
    expect(rejectBox.height).toBeGreaterThanOrEqual(44);
    await page.locator(banner).screenshot({
      path: testInfo.outputPath('analytics-consent.png'),
    });
    await page.evaluate(
      () => (document.documentElement.style.fontSize = '200%'),
    );
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    // Measure contrast after the existing homepage entrance animation finishes.
    await expect(page.locator('.hero-description')).toHaveCSS('opacity', '1');
    const results = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa', 'best-practice'])
      .analyze();
    expect(results.violations).toEqual([]);
    await page.evaluate(
      () => (document.documentElement.style.fontSize = '100%'),
    );
    await page.goto('/games/');
    await expect(page.locator(banner)).toBeVisible();
    expect(external).toEqual([]);
  });
}

test('only explicit acceptance loads Fathom, once per page, and is remembered', async ({
  page,
}) => {
  const loads: string[] = [];
  page.on('request', (request) => {
    if (request.url() === FATHOM_SCRIPT_URL) loads.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator(script)).toHaveCount(0);
  expect(loads).toEqual([]);
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .focus();
  await page.keyboard.press('Enter');
  await expect(page.locator(banner)).toBeHidden();
  await expect(page.locator(script)).toHaveAttribute('data-site', 'RRAEUJZF');
  await expect(page.locator(script)).toHaveAttribute('data-auto', 'false');
  await expect(page.locator(script)).toHaveAttribute('defer', '');
  await expect(page.locator('html')).toHaveAttribute(
    'data-test-pageviews',
    '1',
  );
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await expect(page.locator('.consent-status')).toHaveText(
    'Analytics is currently on.',
  );
  await page.getByRole('button', { name: 'Keep current choice' }).click();
  await expect(
    page.getByRole('button', { name: 'Cookie settings', exact: true }),
  ).toBeFocused();
  expect(loads).toHaveLength(1);
  await page.goto('/games/');
  await expect(page.locator(banner)).toBeHidden();
  await expect(page.locator('html')).toHaveAttribute(
    'data-test-pageviews',
    '1',
  );
  expect(loads).toHaveLength(2);
  const consent = await page.evaluate(
    (key) => JSON.parse(localStorage.getItem(key)!),
    ANALYTICS_CONSENT_KEY,
  );
  expect(consent.choice).toBe('accepted');
  expect(consent.updatedAt).toBeGreaterThan(Date.now() - 60_000);
});

test('rejection is remembered and settings reopen without changing the choice', async ({
  page,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Reject analytics', exact: true })
    .click();
  await page.reload();
  await expect(page.locator(banner)).toBeHidden();
  await expect(page.locator(script)).toHaveCount(0);
  const settings = page.getByRole('button', {
    name: 'Cookie settings',
    exact: true,
  });
  await settings.focus();
  await page.keyboard.press('Enter');
  await expect(
    page.getByRole('heading', { name: 'Your privacy choices' }),
  ).toBeFocused();
  await expect(page.locator('.consent-status')).toHaveText(
    'Analytics is currently off.',
  );
  await page.getByRole('button', { name: 'Keep current choice' }).click();
  await expect(settings).toBeFocused();
  await expect(page.locator(script)).toHaveCount(0);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([
    ANALYTICS_CONSENT_KEY,
  ]);
});

test('withdrawing consent reloads without analytics and allows a later explicit acceptance', async ({
  page,
}) => {
  const departures: string[] = [];
  page.on('request', (request) => {
    if (request.url() === FATHOM_TEST_DEPARTURE_URL)
      departures.push(request.url());
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-test-pageviews',
    '1',
  );
  // Verify the provider's departure behavior before testing its suppression.
  await page.goto('/games/');
  await expect.poll(() => departures.length).toBe(1);
  await expect(page.locator('html')).toHaveAttribute(
    'data-test-pageviews',
    '1',
  );
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Reject analytics', exact: true }).click(),
  ]);
  await expect(page.locator(script)).toHaveCount(0);
  await expect(page.locator(banner)).toBeHidden();
  expect(departures).toHaveLength(1);
  await page.goto('/about/');
  await expect(page.locator(script)).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator('html')).toHaveAttribute(
    'data-test-pageviews',
    '1',
  );
  expect(
    await page.evaluate(() => localStorage.getItem('blockFathomTracking')),
  ).toBeNull();
});

test('an independent Fathom opt-out survives changes to site consent', async ({
  page,
}) => {
  await page.addInitScript(() => {
    localStorage.setItem('blockFathomTracking', 'true');
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator(script)).toHaveCount(1);
  await expect(page.locator('html')).not.toHaveAttribute('data-test-pageviews');
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Reject analytics', exact: true }).click(),
  ]);
  expect(
    await page.evaluate(() => localStorage.getItem('blockFathomTracking')),
  ).toBe('true');
});

test('without JavaScript, no analytics loads or consent controls appear', async ({
  browser,
}) => {
  const context = await browser.newContext({ javaScriptEnabled: false });
  const page = await context.newPage();
  const external: string[] = [];
  page.on('request', (request) => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4321')
      external.push(request.url());
  });
  await page.goto('/');
  await expect(page.locator(banner)).toBeHidden();
  await expect(
    page.getByRole('button', { name: 'Cookie settings' }),
  ).toBeHidden();
  await expect(page.locator(script)).toHaveCount(0);
  expect(external).toEqual([]);
  await context.close();
});

for (const [name, value] of [
  ['malformed', '{invalid'],
  ['unrecognised', JSON.stringify({ choice: 'yes', updatedAt: Date.now() })],
  [
    'expired',
    JSON.stringify({
      choice: 'accepted',
      updatedAt: Date.now() - ANALYTICS_CONSENT_MAX_AGE - 1,
    }),
  ],
  [
    'future-dated',
    JSON.stringify({
      choice: 'accepted',
      updatedAt: Date.now() + ANALYTICS_CONSENT_MAX_AGE,
    }),
  ],
] as const) {
  test(`${name} preferences leave analytics off and ask for consent`, async ({
    page,
  }) => {
    await page.addInitScript(
      ({ key, value }) => localStorage.setItem(key, value),
      {
        key: ANALYTICS_CONSENT_KEY,
        value,
      },
    );
    await page.goto('/');
    await expect(page.locator(banner)).toBeVisible();
    await expect(page.locator(script)).toHaveCount(0);
    await expect(page.locator('html')).not.toHaveAttribute(
      'data-test-pageviews',
    );
  });
}

test('inaccessible storage fails closed and rejection remains usable', async ({
  page,
}) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'localStorage', {
      get() {
        throw new DOMException('Storage disabled', 'SecurityError');
      },
    });
  });
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator('.consent-status')).toHaveText(
    /could not save your choice/,
  );
  await expect(page.locator(script)).toHaveCount(0);
  await page
    .getByRole('button', { name: 'Reject analytics', exact: true })
    .click();
  await expect(page.locator(banner)).toBeHidden();
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await expect(page.locator(banner)).toBeVisible();
});

test('withdrawal in another open tab disables analytics in both tabs', async ({
  page,
  context,
}) => {
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator(script)).toHaveCount(1);
  const other = await context.newPage();
  await other.goto('/games/');
  await expect(other.locator(script)).toHaveCount(1);
  await other
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await Promise.all([
    other.waitForEvent('load'),
    page.waitForEvent('load'),
    other
      .getByRole('button', { name: 'Reject analytics', exact: true })
      .click(),
  ]);
  await expect(page.locator(script)).toHaveCount(0);
  await expect(other.locator(script)).toHaveCount(0);
});

test('a delayed provider response cannot start tracking after withdrawal', async ({
  page,
}) => {
  let release!: () => void;
  const response = new Promise<void>((resolve) => {
    release = resolve;
  });
  await page.route(FATHOM_SCRIPT_URL, async (route) => {
    await response;
    await route
      .fulfill({
        contentType: 'application/javascript',
        body: `window.fathom = { trackPageview() { throw new Error('Tracking after withdrawal'); } };`,
      })
      .catch(() => {}); // Withdrawal cancels the old document's script request.
  });
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/');
  await page
    .getByRole('button', { name: 'Accept analytics', exact: true })
    .click();
  await expect(page.locator(script)).toHaveCount(1);
  await page
    .getByRole('button', { name: 'Cookie settings', exact: true })
    .click();
  await Promise.all([
    page.waitForEvent('load'),
    page.getByRole('button', { name: 'Reject analytics', exact: true }).click(),
  ]);
  release();
  await expect(page.locator(script)).toHaveCount(0);
  expect(errors).toEqual([]);
});
