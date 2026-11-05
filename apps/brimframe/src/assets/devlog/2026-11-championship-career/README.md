# Beyond the Finish Line — content review

Prepared on 5 November 2026. **Publication approved; enabled for production.**

## Article and publication

- Title: Beyond the Finish Line – Building Championships and a Racing Career in Riff Racers
- Article: `apps/brimframe/src/content/devlog/riff-racers-beyond-the-finish-line-championship-career.mdx`
- Author: Daniel Schmid / BrimFrame; English, first-person singular.
- Length: approximately 1,100 words of prose; 1,239 words including image captions.
- Publication date: `2026-11-05`.
- Publication branch: `main`; the original draft was reviewed on `content/riff-racers-championship-career`.
- Preview: http://127.0.0.1:4322/devlog/riff-racers-beyond-the-finish-line-championship-career/
- Public URL: https://brimframe.de/devlog/riff-racers-beyond-the-finish-line-championship-career/

The owner approved publication on 5 November 2026. The source now uses `draft: false`, so the regular build includes the article in its routes, homepage, listing, RSS and sitemap. The original draft was checked using an isolated publication preview at `artifacts/championship-career-review/site/`.

Publication follows the existing Git/CI/Render workflow: push `main`, pass Website checks / quality, and let Render deploy that commit. Production is built from the repository; the isolated preview output is not used for deployment. The validation results below document the original draft and publication-preview review.

## Integration

Uses the existing MDX collection, dynamic devlog route, `Picture`, figure/caption classes, article layout, and adjacent-post navigation. No schema, CSS, component, dependency or existing article was changed. The filename supplies the requested slug.

The shared layout supplies the canonical URL, Open Graph and Twitter titles/descriptions/image, BlogPosting/Person and breadcrumb structured data. The existing convention uses the article title for SEO/social titles, rather than introducing a separate SEO-title field. The 16:9 hero produces a 1200×675 social image. Article images have 480/800/1200-pixel AVIF and WebP variants plus JPEG fallback; originals are not shipped as public assets.

Internal links connect the demo plan, technical workflow, cathedral, Frostfire, weather and racing-AI articles. In the isolated publication build the article is newest in the home/listing/RSS/sitemap, and the AI article links forward to it.

## Image selection and provenance

All eight prepared sources are **1280×720 (16:9)**. Total prepared size: **823,530 bytes** (about 804 KiB). Sharp converted copies to WebP at quality 90 / effort 6 without cropping, resizing, retouching or changing screenshot contents. Original and optimized SHA-256 hashes, exact paths, dimensions, byte sizes, sections and alt text are recorded in [sources.json](sources.json). The originals were rehashed after preparation and remained unchanged.

Original files below are relative to `/home/danielschmid/Downloads/Riff Racers/Championship-UI-Review/`. Optimized filenames are relative to this directory.

| Section                           | Original                                                            | Optimized file                                                                                   | Size      |
| --------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------ | --------- |
| Hero / menu presentation          | `after/driver-kira_pulse-1280x720.png`                              | [riff-racers-championship-driver-selection.webp](riff-racers-championship-driver-selection.webp) | 100,978 B |
| Five races, one world champion    | `after/world-1280x720.png`                                          | [riff-racers-championship-world-selection.webp](riff-racers-championship-world-selection.webp)   | 130,576 B |
| Every position matters            | `after/results-1280x720.png`                                        | [riff-racers-championship-race-results.webp](riff-racers-championship-race-results.webp)         | 123,408 B |
| Every position matters            | `native-championship/verify-completed-championship_standings-1.png` | [riff-racers-championship-standings.webp](riff-racers-championship-standings.webp)               | 111,852 B |
| Building a racing career          | `after/career-1280x720.png`                                         | [riff-racers-racing-career.webp](riff-racers-racing-career.webp)                                 | 119,880 B |
| Building a racing career          | `native-championship/verify-completed-career-1.png`                 | [riff-racers-racing-career-records.webp](riff-racers-racing-career-records.webp)                 | 102,868 B |
| A proper championship celebration | `after/ceremony-lift-1280x720.png`                                  | [riff-racers-championship-victory.webp](riff-racers-championship-victory.webp)                   | 76,372 B  |
| A proper championship celebration | `after/trophy-1280x720.png`                                         | [riff-racers-trophy-collection.webp](riff-racers-trophy-collection.webp)                         | 57,596 B  |

### Alternative text and evidence

- **riff-racers-championship-driver-selection.webp** — Riff Racers championship setup with Kira Pulse’s own 3D model, twelve driver cards, five difficulty choices and a Start Championship button; five driver models are marked 3D pending.
  Provenance: Native-rendered setup with controlled review-profile progress.
- **riff-racers-championship-world-selection.webp** — Metal Championship world selection with a concert-stage illustration and five course previews, from Iron Chorus to Frostfire Run; the completed results are test data.
  Provenance: Native-rendered UI; synthetic completed standings; illustrated world card.
- **riff-racers-championship-race-results.webp** — In-game race-results test showing Mika Blaze first with 25 points, all twelve driver entries, and zero points for the disqualified and non-finishing drivers.
  Provenance: Native-rendered UI; synthetic race classification, times and DNF/DSQ cases.
- **riff-racers-championship-standings.webp** — Final standings from a completed five-race Warm-Up test: Valen Koa wins with 85 points, Nia Solara takes second with 68, and Mika Blaze finishes third with 63.
  Provenance: Real full-distance automated championship, settled standings after reload.
- **riff-racers-racing-career.webp** — My Racing Career overview using a 120-point Headliner test profile, with one world title, four race wins, five podium finishes and one earned difficulty trophy.
  Provenance: Native-rendered UI; synthetic 120-point Headliner profile.
- **riff-racers-racing-career-records.webp** — Reloaded Metal Championship career records showing Mika Blaze’s actual Warm-Up best of 63 points, third overall and zero difficulty trophies, with no completed records at the other difficulties.
  Provenance: Real saved and reloaded 63-point Warm-Up championship.
- **riff-racers-championship-victory.webp** — Native-rendered ceremony test with Mika Blaze raising a gold trophy on the centre podium, Kira Pulse second and Tex Rivers third, beneath cyan and pink stage lights and confetti.
  Provenance: Real native 3D characters and skeletal trophy animation; synthetic classification.
- **riff-racers-trophy-collection.webp** — 3D Metal Champion Trophy inspection for a Headliner test record of 120 points with Mika Blaze, showing one world title, four race wins and five podiums.
  Provenance: Real native 3D trophy inspection; synthetic 120-point Headliner profile.

No concept art is presented as gameplay. The world-card illustration is identified as interface artwork. Controlled native-rendered UI/ceremony profiles are explicitly labelled in captions and alt text; they are not claimed as completed racing runs. The settled standings and 63-point career records come from the separate full-distance engine test. A mid-transition standings capture was rejected during visual review. Only one driver-selection image and one ceremony image were selected.

## Verified game implementation

Read-only inspection of `/home/danielschmid/dev/github/riff-racers/` confirmed:

- `game/content/foundation/championships.json`: Metal’s five existing tracks, independent world championship and trophy identity. The currently displayed third-course name is **Cathedral Circuit**; the article links to **Into the Cathedral**, the earlier post title, rather than inventing a rename.
- `game/content/foundation/results.json` and `game/core/championship/rules.lua`: points 25/20/16/13/11/9/7/5/4/3/2/1, zero for DNF/DSQ, twelve-driver classifications and countback.
- `game/content/foundation/difficulties.json`: Warm-Up/Opening Act/Headliner/Encore/Legendary Set, 3/5/7/9/11 laps and twelve drivers throughout.
- `game/core/championship/manager.lua`, `game/core/championship/save.lua` and `game/core/progression/career.lua`: saved independent attempts, fixed choices, validated results, completed-run records, replay guards and best-completed-score aggregation per world/difficulty.
- `game/ui/championship/`, `game/ui/career/` and `game/ui/presentation/`: world/route selection, animated driver previews, race results, series standings, career filters, earned/locked trophy inspection, native 3D podium and trophy lift/hold.
- `game/ui/presentation/scene.script` and `game/ui/presentation/driver_preview.lua`: seven real presentation identities and champion hand-bone attachment/animation.

Supporting evidence already present in the game project was inspected, rather than regenerated or claimed as a new game playtest:

- `docs/world-championships.md`, `docs/world-championship-delivery.md`, `docs/championship-ui-overhaul.md` and `docs/career-presentation-redesign.md`.
- Downloads review `README.md`, native screenshots, logs and `native-championship/native-report.json`: five full Warm-Up races, twelve classifications each, restart after race two, player Mika third with 63 points, Valen champion with 85, two player podiums, no player world title, completion reload verified.
- `docs/world-championships/evidence/README.md` and archived reports document other completed runs, including a player championship win. Native higher-difficulty checks documented starts/formats; no fresh all-difficulty full-series playtest is claimed.

### Work in progress and future scope

- **Missing own models/rigs:** Luca Moretti, Leo Cruz, Sage Chen, Valen Koa and Imani Reed. Their championship identities/results work, but they cannot perform the complete character celebration. Missing podium slots remain explicitly marked. This includes the actual Valen-winning test.
- Seven available models have real trophy-lift/hold animation. The attractive Mika-win ceremony screenshot is a controlled native-rendered result fixture, not evidence that Mika won the separate full championship run.
- Presentation and character work still need polish. No physical-controller certification or target-platform performance claim is made.
- Only Metal is installed. Five worlds / 25 tracks for the full game and another five / 25 as future DLC are the owner’s intended scope, not delivered content. Grand Championship is only a future possibility.

## Video decision

Relevant local files were found: `after/championship-victory-h264.mp4` (8-second native-rendered trophy-animation test with synthetic standings) and `native-championship/resume-final-ceremony-h264.mp4` (actual race outcome, including the missing Valen model). Motion frames from the first video were reviewed. No relevant uploaded championship YouTube URL was found in the local review material.

The established site component is the consent-gated YouTube `VideoEmbed.astro`; there is no existing local-video article component. This article uses still images and introduces no video component, additional client JavaScript, third-party connection or unrelated trailer.

## Website validation

Used the required Node **24.21.0** and pnpm **12.14.0**. The isolated Node binary was downloaded to `/tmp` and verified against the official archive checksum; repository toolchain settings were not changed.

| Check                                                           | Result                                                                                                                                                                                            |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `pnpm check`                                                    | Passed: 0 errors, warnings or hints                                                                                                                                                               |
| `pnpm build`                                                    | Passed: 18 pages; draft route/listing/feed/sitemap excluded                                                                                                                                       |
| Isolated publication preview build                              | Passed: 19 pages, including the article                                                                                                                                                           |
| `pnpm test`                                                     | 26 passed                                                                                                                                                                                         |
| `pnpm test:e2e`                                                 | 106 Firefox tests passed                                                                                                                                                                          |
| `pnpm validate:render`                                          | Passed against the current official schema                                                                                                                                                        |
| Formatting, tracked files plus new article/assets               | Passed                                                                                                                                                                                            |
| `pnpm lint`                                                     | Reports only nine untracked `.playwright-cli` snapshots; eight predated this task, one was generated during review. No repository content formatting failures. Existing snapshots were preserved. |
| Preview metadata, navigation, internal links and asset variants | Passed: 86 local references checked                                                                                                                                                               |
| Preview image loading and aspect ratio                          | All 8 loaded; correct 16:9 geometry                                                                                                                                                               |
| Responsive reflow                                               | Passed at 320, 375, 430, 768, 1024, 1440 and 1920 CSS px                                                                                                                                          |
| Enlarged text                                                   | 200% passed at 320 and 1440 CSS px                                                                                                                                                                |
| axe WCAG 2.2 AA / best practices                                | Zero violations at 375 and 1440 CSS px                                                                                                                                                            |
| Keyboard                                                        | Skip link focuses main; next Tab reaches article back link                                                                                                                                        |
| Console, assets, privacy                                        | No runtime errors, failing responses or external requests before consent                                                                                                                          |
| `git diff --check`                                              | Passed                                                                                                                                                                                            |

The raw unscoped lint result is retained in `artifacts/championship-career-review/lint.log`. The formatting check covering all tracked and new files, excluding browser diagnostic snapshots, is retained in `scoped-lint.log`.

A review harness initially called `img.decode()` during responsive source replacement and hit a cancelled image request. It was corrected to wait for the current source to load; all eight images subsequently loaded successfully without a website change.

### Visual and accessibility review

Desktop and mobile screenshots were inspected for heading wrapping, hero quality, prose width, image spacing, captions and the ceremony section. The page follows the frozen V1 styling and showed no visible clipping or overflow. Useful facts in the screenshot tables are repeated in prose/alt text; captions identify test data.

No accessibility issue was found in the scoped checks. These checks are not a formal full-site WCAG audit or a screen-reader certification. Actual screen-reader reading and broader device testing remain outside this content review.

Review artifacts (ignored by Git):

- `artifacts/championship-career-review/article-desktop.png` and `article-mobile.png`: full-page previews.
- `article-desktop-{top,hero,career,victory}.png` and equivalent mobile files: closer visual checks.
- `verification.json`: metadata, link, draft-isolation, image, privacy and accessibility results.
- `check.log`, `build.log`, `preview-build.log`, `node-tests.log`, `browser-tests.log`, `render-schema.log`, `lint.log`, `scoped-lint.log`.
- `verify-preview.mjs`: reproducible one-off preview checks. Preview server: `python3 -m http.server 4322 --bind 127.0.0.1 --directory artifacts/championship-career-review/site/dist`.

## Remaining items

No unresolved article, asset or layout problem was found. Publication is approved for 5 November 2026. The game’s missing five presentation models and planned worlds are honestly described in the article. Untracked browser-snapshot formatting is the sole repository-wide check caveat in the local review checkout.
