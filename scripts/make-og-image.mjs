// Regenerate apps/brimframe/public/og-image.png (1200x630 social card).
// Run: node scripts/make-og-image.mjs
import { readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const sharp = require(path.resolve('apps/brimframe/node_modules/sharp'));

const repoRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

// Brand wordmark geometry from src/assets/brand/wordmark.svg (viewBox 0 0 908 132).
const wordmark = await readFile(
  path.join(repoRoot, 'apps/brimframe/src/assets/brand/wordmark.svg'),
  'utf8',
);

// 1200x630 canvas: brand background, the brim (accent) motif enlarged,
// wordmark centered, tagline beneath.
const scale = 1.05; // wordmark ~953px wide
const dx = (1200 - 908 * scale) / 2;
const dy = 250;
const W = 908 * scale;
const H = 132 * scale;

const svg = `<svg width="1200" height="630" viewBox="0 0 1200 630" xmlns="http://www.w3.org/2000/svg">
  <rect width="1200" height="630" fill="#0B0F14"/>
  <rect x="0" y="614" width="1200" height="16" fill="#f97316"/>
  <text x="600" y="140" text-anchor="middle" font-family="DejaVu Sans" font-weight="bold" font-size="52" fill="#f4f2ec" letter-spacing="14">BRIMFRAME</text>
  <text x="600" y="205" text-anchor="middle" font-family="DejaVu Sans" font-size="30" fill="#c4c8ce">Independent Games</text>
  <g fill="#f4f2ec" transform="translate(${dx} ${dy}) scale(${scale})" opacity="0.14">${wordmark
    .replace(/^<svg[^>]*>/, '')
    .replace(/<\/svg>\s*$/, '')}</g>
  <text x="600" y="500" text-anchor="middle" font-family="DejaVu Sans" font-size="34" fill="#f4f2ec">Different Games. New Worlds. Same Passion.</text>
  <text x="600" y="560" text-anchor="middle" font-family="DejaVu Sans" font-size="26" fill="#f97316">brimframe.de</text>
</svg>`;

const out = path.join(repoRoot, 'apps/brimframe/public/og-image.png');
await sharp(Buffer.from(svg), { density: 144 })
  .resize(1200, 630)
  .png({ optimizationLevel: 9 })
  .toFile(out);
const info = await sharp(out).metadata();
console.log(`og-image.png ${info.width}x${info.height} ${info.size} bytes`);
