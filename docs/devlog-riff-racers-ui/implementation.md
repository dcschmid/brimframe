# Devlog integration: “The Interface Joins the Race”

Branch `content/riff-racers-ui-devlog`, based on `main` at `22e43f4`. The branch adds one devlog article, its images, two test files and these notes. Nothing is pushed, merged or deployed.

## What the repository already does

I read these files before changing anything. The article uses them as they are.

| Area                       | How it works today                                                                                                                                                                                                                          | Where                                                       |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- |
| Toolchain                  | Astro 7.4.12, pnpm 12.14.0, Node 24.21.0 (`engine-strict`), `@astrojs/mdx` 8.1.6, `sharp` 0.35.5                                                                                                                                            | `package.json`, `.node-version`, `.npmrc`                   |
| Content                    | Collection `devlog`, glob loader for `*.md` and `*.mdx`, Zod schema. `publishDate` is required                                                                                                                                              | `apps/brimframe/src/content.config.ts`                      |
| Publication                | Only entries with `draft: false` are built. They sort by `publishDate` descending, then by id. The date does not schedule anything                                                                                                          | `src/utils/publication.ts`, README “Devlog authoring”       |
| Route                      | `/devlog/<file name>/`, trailing slash always                                                                                                                                                                                               | `src/pages/devlog/[slug].astro`, `astro.config.mjs`         |
| Article page               | h1 and intro from frontmatter, byline, date in UTC, tags, hero with `Picture`, “Older/Newer update” navigation, breadcrumbs, `BlogPosting` JSON-LD                                                                                          | `[slug].astro`                                              |
| Open Graph                 | `og:image` is the hero, converted to a 1200 px wide WebP without cropping (1200×675 for a 16:9 source). `og:image:alt` is `heroImageAlt`                                                                                                    | `[slug].astro`                                              |
| Cards                      | The devlog archive lists every published entry. The home page lists the newest three. A card shows the hero, date, title and `excerpt`                                                                                                      | `DevlogCard.astro`, `DevlogList.astro`, `pages/index.astro` |
| Feed and sitemap           | `rss.xml` lists published posts. The sitemap integration reads the frontmatter itself and sets `lastmod` from `updatedDate` or `publishDate`                                                                                                | `pages/rss.xml.ts`, `astro.config.mjs`                      |
| Images                     | `Picture` from `astro:assets`, AVIF and WebP at 480, 800 and 1200 px with a JPEG fallback, quality 90                                                                                                                                       | other articles, README                                      |
| Video                      | `VideoEmbed.astro` renders a local poster and a button. Without JavaScript only the poster and a “Watch on YouTube” link remain. A click replaces the poster with a `youtube-nocookie.com` iframe. Nothing is requested from YouTube before | `VideoEmbed.astro`                                          |
| Analytics consent          | Fathom loads only after “Accept analytics”. This choice is separate from the video gate                                                                                                                                                     | `AnalyticsConsent.astro`, `utils/analytics-consent.ts`      |
| CI and deployment          | CI runs `pnpm validate` on every push. Render rebuilds from `main` after the checks pass (`autoDeployTrigger: checksPass`)                                                                                                                  | `.github/workflows/ci.yml`, `render.yaml`                   |
| Existing per-article tests | Each recent article has a build test and a browser spec                                                                                                                                                                                     | `tests/*.test.mjs`, `tests/browser/*.spec.ts`               |

Consequence for this branch: **merging into `main` publishes the article**, because `draft: false` is what publishes it and Render deploys `main`.

## What changed

| File                                                                             | Change                                                                                                      |
| -------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------- |
| `apps/brimframe/src/content/devlog/riff-racers-the-interface-joins-the-race.mdx` | new article                                                                                                 |
| `apps/brimframe/src/assets/devlog/2026-11-ui-sprint/`                            | 12 screenshots, 1 video poster (all WebP) and a `README.md` with the source build of every image            |
| `tests/riff-racers-ui.test.mjs`                                                  | new: metadata, discovery, structure, images, video markup, links, claims                                    |
| `tests/browser/riff-racers-ui.spec.ts`                                           | new: four viewports, stacked pairs, axe, video gate (Enter, Space, pointer), no-JavaScript view, navigation |
| `tests/dynamic-weather.test.mjs`, `tests/browser/dynamic-weather.spec.ts`        | edited: see below                                                                                           |
| `docs/devlog-riff-racers-ui/`                                                    | these notes and a small set of screenshots                                                                  |

No change to the schema, components, styles, configuration, dependencies, other articles or the lockfile.

### Why two existing tests changed

Both tests expected the “Dynamic weather” card on the home page. The home page shows only the three newest posts, so a fourth article pushes the weather post off it. That is the documented behaviour, not a regression. Each test now checks the archive page (`/devlog/`), which always lists every post, and keeps its other assertions. The diff is five lines.

## Frontmatter

```yaml
title: 'The Interface Joins the Race – Fixing the Riff Racers UI in One Week'
seoTitle: 'Riff Racers UI: One Week of Menu and HUD Fixes'
seoDescription: 'What changed in the Riff Racers interface in one November week: …' # 149 characters
publishDate: 2026-11-18
author: 'Daniel Schmid'
heroImage: '../../assets/devlog/2026-11-ui-sprint/riff-racers-ui-grid-forecast-and-tyres.webp'
tags: ['riff-racers', 'development', 'game-ui', 'controller', 'accessibility']
draft: false
game: 'riff-racers'
featured: false
```

`description`, `intro`, `excerpt` and `heroImageAlt` are exactly as prepared in the editorial draft. They satisfy the schema limits (`title` ≤ 120, `seoTitle` ≤ 70, `seoDescription` ≤ 160, the others ≤ 300).

Two values need a decision before the merge:

- `publishDate: 2026-11-18` is the day the YouTube video went public and the day of this integration. The schema requires a date and the site does not schedule by date. If the article goes live on another day, change this line. I did not set `updatedDate`.
- `draft: false` is needed to build and preview the article at all. To merge the branch without publishing, set `draft: true`.

The slug is the file name. `https://brimframe.de/devlog/riff-racers-the-interface-joins-the-race/` returned HTTP 404 on 2026-11-18, so it is free, and no existing article uses the file name.

## How the article was produced

The editorial source is `article/draft-en.md` in the media project, not a hand-edited MDX file. `article/tools/draft_to_mdx.py` converts it:

- removes HTML comments (MDX does not allow them) and sets `publishDate` and `draft` from its arguments,
- turns each image and its italic caption into the site’s `<figure class="devlog-figure">` with `Picture`, `widths={[480, 800, 1200]}`, `sizes="(max-width: 768px) 100vw, 800px"`, `quality={90}` and lazy loading,
- turns the video section into the existing `VideoEmbed` with the real video id,
- replaces straight quotes and apostrophes with typographic ones, as the other articles use.

`article/tools/prepare_site_assets.sh` copies the images and writes the asset `README.md`. Both scripts are in the media project because they read its files. Prettier then formats the MDX, so the committed file is the formatted result.

Before and after pairs are two consecutive figures, “Before” first. There is no side-by-side component and no composite image, so the pairs stay full width on a phone.

### Video

`videoId="tN3YGgsmaJQ"`. I checked it before use: oEmbed returns the title “Riff Racers – Sprint 2 UI/UX Showcase | The Interface Joins the Race” for channel BrimFrame, and the watch page reports 88 seconds, public, embeddable, uploaded 2026-11-18. Live playback in the embed starts with the intro card and shows 1:28. The article uses the existing component unchanged: the poster is a local still frame, so the page makes no request to YouTube until someone presses play.

### Text edits compared with the editorial draft

I ran a pass with the `human-writing` skill (mode B, one pass) on the prose. Facts, numbers, links, headings and figures are untouched. Five spans changed:

| Where                     | Removed or merged                                                                             | Reason                                           |
| ------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------ |
| Opening paragraph         | “and it told me what kind of job I had”                                                       | vague, said nothing a reader could check         |
| Second paragraph          | “This post follows the order in which a race meets the interface, and ends with …”            | narrates the structure the headings already show |
| “Audit first”             | “It is deliberate.” merged into the previous sentence (“…exactly as it did, on purpose.”)     | three short sentences in a row                   |
| “A kart that did not fit” | “Two limits belong next to it.”                                                               | signposting                                      |
| Closing                   | “That was a week of making the interface behave, and I would rather show you the open list …” | repeated the article instead of ending on a fact |

The same edits are in `article/draft-en.md`, so the editorial source and the site agree. The linter reports no findings beyond the build labels that repeat on purpose in the figure captions (“main at 4de82a8”, “driven by the game’s AI”).

## Corrections after the final review (DL-06)

The final review checked the claims against the Sprint 2 reports again and changed four statements. Nothing else in the article moved.

| Where                                          | Before                                                                  | After                                                                                                                                                   | Why                                                                                                                              |
| ---------------------------------------------- | ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------- |
| “The race still matters most”                  | “…at 1280×800, on a straight, from 7.6 per cent of frames to 2.0.”      | “…five AI-driven runs of 130 seconds at 1280×800, the line ran under the old mini-map in 7.6 per cent of the frames and runs under the new one in 2.0.” | The report’s table counts all frames (9,337) in the first column. “On a straight” was a misreading of the second column (curves) |
| “Tracks and sets”                              | the lock hint “used to be cut off”                                      | “At 1280×800 … ‘unlocks Raz...’”, plus a note that the 1920×1080 captures show it complete in both builds                                               | The truncation was measured at 1280×800. Both 1080p screenshots in the article show the full sentence                            |
| Video paragraph                                | “I set the weather in the rain and snow shots with developer switches.” | “I forced the weather with developer switches: dry on four tracks, snow on Frostfire Run, rain on the grid and in the rain race.”                       | The four dry tracks were also forced dry for the capture                                                                         |
| “The race still matters most” (cost paragraph) | “…or the save format.”                                                  | “…or the championship and career save formats.”                                                                                                         | HUD Detail added one optional key to the preferences schema (default FULL). The championship and career code is unchanged        |

## Reproduce

```sh
export PATH=~/.nvm/versions/node/v24.21.0/bin:$PATH   # the repository requires Node 24.21.0
git worktree add -b content/riff-racers-ui-devlog ../brimframe-riff-racers-ui main
cd ../brimframe-riff-racers-ui
pnpm install --frozen-lockfile
pnpm lint && pnpm check && pnpm build && pnpm test && pnpm test:e2e
```

`pnpm validate:render` was not run: it needs network access to Render’s schema service and this branch does not touch `render.yaml`.
