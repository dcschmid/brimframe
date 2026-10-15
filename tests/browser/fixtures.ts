import { test as base } from '@playwright/test';

export { expect } from '@playwright/test';

export const FATHOM_SCRIPT_URL = 'https://cdn.usefathom.com/script.js';
export const FATHOM_TEST_DEPARTURE_URL =
  'https://cdn.usefathom.com/test-departure';

export const test = base.extend({
  context: async ({ context }, use) => {
    // Exercise script loading without sending test visits to the live account.
    await context.route('https://cdn.usefathom.com/**', (route) =>
      route.request().url() !== FATHOM_SCRIPT_URL
        ? route.fulfill({ status: 204 })
        : route.fulfill({
            contentType: 'application/javascript',
            body: `let tracked = false;
          window.fathom = {
            trackPageview() {
              if (localStorage.getItem('blockFathomTracking')) return;
              tracked = true;
              window.dispatchEvent(new Event('fathom-test-pageview'));
            }
          };
          // Like Fathom, send a departure beacon only while tracking is enabled.
          window.addEventListener('pagehide', () => {
            if (tracked && !localStorage.getItem('blockFathomTracking'))
              navigator.sendBeacon('${FATHOM_TEST_DEPARTURE_URL}', 'departure');
          });`,
          }),
    );
    await use(context);
  },
});
