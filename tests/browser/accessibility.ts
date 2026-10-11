import { expect, type Page } from '@playwright/test';

// Use real keyboard input: a focus() call would not verify the first Tab target.
export async function checkSkipLink(page: Page) {
  const skip = page.getByRole('link', {
    name: 'Skip to main content',
    exact: true,
  });
  await expect(skip).toHaveCount(1);
  await expect(skip).toHaveAttribute('href', '#main-content');
  await expect(page.locator('main#main-content')).toHaveCount(1);
  const hidden = await skip.boundingBox();
  expect(hidden).not.toBeNull();
  expect(hidden!.y + hidden!.height).toBeLessThanOrEqual(0);

  await page.keyboard.press('Tab');
  await expect(skip).toBeFocused();
  const visible = await skip.boundingBox();
  expect(visible).not.toBeNull();
  const viewport = page.viewportSize()!;
  expect(visible!.x).toBeGreaterThanOrEqual(8);
  expect(visible!.y).toBeGreaterThanOrEqual(8);
  expect(visible!.x + visible!.width).toBeLessThanOrEqual(viewport.width - 8);
  expect(visible!.y + visible!.height).toBeLessThanOrEqual(viewport.height - 8);
  expect(visible!.height).toBeGreaterThanOrEqual(44);
  const style = await skip.evaluate((node) => {
    const style = getComputedStyle(node);
    const rect = node.getBoundingClientRect();
    return {
      outline: style.outlineStyle,
      outlineWidth: parseFloat(style.outlineWidth),
      display: style.display,
      visibility: style.visibility,
      frontmost: node.contains(
        document.elementFromPoint(rect.x + 12, rect.y + 12),
      ),
    };
  });
  expect(style.outline).toBe('solid');
  expect(style.outlineWidth).toBeGreaterThanOrEqual(3);
  expect(style.display).not.toBe('none');
  expect(style.visibility).toBe('visible');
  expect(style.frontmost).toBe(true);

  await page.keyboard.press('Enter');
  await expect(page.locator('main#main-content')).toBeFocused();
  await page.keyboard.press('Tab');
  expect(
    await page.evaluate(
      () =>
        document.activeElement?.matches('a, button') &&
        !document.querySelector('header')?.contains(document.activeElement) &&
        !document.activeElement.matches('.skip-link'),
    ),
  ).toBe(true);
}
