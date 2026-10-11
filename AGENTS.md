# Repository Guidelines

## Project Structure & Module Organization

BrimFrame is an English-only, static Astro site in a pnpm workspace. The application lives in `apps/brimframe/`:

- `src/pages/`, `src/layouts/`, and `src/components/`: routes and reusable Astro views.
- `src/config/`, `src/utils/`, and `src/content.config.ts`: typed configuration, publication logic, and content schema.
- `src/content/devlog/`: Markdown posts; `src/assets/`: processed images; `public/`: unprocessed static files.
- `src/styles/global.css`: shared design tokens and responsive styles.

Root `tests/` holds automated checks; `scripts/` holds utility scripts. Deployment and CI use `render.yaml` and `.github/workflows/ci.yml`.

## Build, Test, and Development Commands

Use Node 24.21.0 and pnpm 10.33.0. Run commands from the repository root:

- `pnpm install --frozen-lockfile`: install pinned dependencies.
- `pnpm dev`: serve locally at `http://127.0.0.1:4321`.
- `pnpm build` / `pnpm preview`: generate `apps/brimframe/dist/` and serve it.
- `pnpm check`: run Astro diagnostics and TypeScript checks.
- `pnpm lint` / `pnpm format`: check or apply Prettier formatting.
- `pnpm test` / `pnpm test:e2e`: run Node tests or Firefox browser tests.
- `pnpm validate`: run the complete CI sequence, including network-dependent Render schema validation.

## Coding Style & Naming Conventions

Use two-space indentation, single-quoted JavaScript/TypeScript strings, and Prettier's Astro plugin. Follow the strictest Astro TypeScript configuration. Name components and layouts in PascalCase, such as `SiteHeader.astro`; use kebab-case for devlog filenames and slugs. Reuse CSS tokens and keep client JavaScript minimal.

## Testing Guidelines

Use Node's built-in test runner for `tests/*.test.mjs` and Playwright for `tests/browser/*.spec.ts`. Build before running tests. Install Firefox with `pnpm exec playwright install firefox`; stop any server on port 4321 before browser tests. Cover changed publication, link, asset, and navigation behavior. Browser checks include axe WCAG 2.2 AA, keyboard navigation, responsive reflow, and enlarged text. No numeric coverage threshold is configured.

## Commit & Pull Request Guidelines

Git history is unavailable in this checkout; no established commit convention can be verified. Use concise, imperative commit subjects. PRs should describe the change, link relevant issues, report validation, and include desktop/mobile screenshots for visual changes. Ensure the **Website checks / quality** job passes.

## Content & Design Constraints

Preserve the frozen V1 design except for usability or accessibility fixes. Keep copy factual and solo-studio focused. Publish devlog entries only with explicit `draft: false`. Preserve the original Riff Racers logo and keep dependencies pinned with the lockfile.
