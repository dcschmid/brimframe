import { test, expect } from './fixtures.ts';

for (const route of ['/', '/games/']) {
  for (const width of [320, 768, 1440]) {
    test(`game artwork preserves small heading contrast on ${route} at ${width}px`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(route);
      await page.evaluate(() => document.fonts.ready);
      const heading = page.locator('.game-identity .eyebrow');
      await heading.scrollIntoViewIfNeeded();
      const artwork = page.locator('.game-visual img').first();
      await expect
        .poll(() =>
          artwork.evaluate((node) => {
            const image = node as HTMLImageElement;
            return image.complete && image.naturalWidth > 0;
          }),
        )
        .toBe(true);
      const foreground = await heading.evaluate(
        (node) => getComputedStyle(node).color,
      );
      const text = await heading.screenshot();
      // Capture the actual artwork and gradient beneath the same glyphs.
      await heading.evaluate((node) => (node.style.color = 'transparent'));
      const backdrop = await heading.screenshot();
      const measured = await page.evaluate(
        async ({ text, backdrop, foreground }) => {
          async function pixels(base64: string) {
            const image = new Image();
            image.src = `data:image/png;base64,${base64}`;
            await image.decode();
            const canvas = document.createElement('canvas');
            canvas.width = image.width;
            canvas.height = image.height;
            const context = canvas.getContext('2d')!;
            context.drawImage(image, 0, 0);
            return context.getImageData(0, 0, canvas.width, canvas.height).data;
          }
          function luminance(rgb: number[]) {
            const linear = rgb.map((channel) => {
              const value = channel / 255;
              return value <= 0.04045
                ? value / 12.92
                : ((value + 0.055) / 1.055) ** 2.4;
            });
            return (
              linear[0]! * 0.2126 + linear[1]! * 0.7152 + linear[2]! * 0.0722
            );
          }
          const withText = await pixels(text);
          const withoutText = await pixels(backdrop);
          const ink = luminance(
            foreground
              .match(/[\d.]+/g)!
              .slice(0, 3)
              .map(Number),
          );
          let minimum = Infinity;
          let glyphPixels = 0;
          for (let index = 0; index < withText.length; index += 4) {
            // Ignore unchanged background and nearly transparent antialiasing.
            if (
              Math.max(
                ...[0, 1, 2].map((channel) =>
                  Math.abs(
                    withText[index + channel]! - withoutText[index + channel]!,
                  ),
                ),
              ) <= 30
            )
              continue;
            const background = luminance(
              Array.from(withoutText.slice(index, index + 3)),
            );
            minimum = Math.min(
              minimum,
              (Math.max(ink, background) + 0.05) /
                (Math.min(ink, background) + 0.05),
            );
            glyphPixels++;
          }
          return { minimum, glyphPixels };
        },
        {
          text: text.toString('base64'),
          backdrop: backdrop.toString('base64'),
          foreground,
        },
      );
      expect(measured.glyphPixels).toBeGreaterThan(100);
      expect(measured.minimum).toBeGreaterThanOrEqual(4.5);
    });
  }
}
