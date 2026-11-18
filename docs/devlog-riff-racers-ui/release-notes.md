# Release notes: “The Interface Joins the Race”

Status on 2026-11-18: ready for review, not published. The branch builds and passes `pnpm lint`, `pnpm check`, `pnpm build`, `pnpm test` (31 of 31) and `pnpm test:e2e` (121 of 121). Merging into `main` publishes the article, because the article has `draft: false` and Render deploys `main` once the checks pass.

## Article

|            |                                                                                                                        |
| ---------- | ---------------------------------------------------------------------------------------------------------------------- |
| Title      | The Interface Joins the Race – Fixing the Riff Racers UI in One Week                                                   |
| Slug       | `riff-racers-the-interface-joins-the-race`                                                                             |
| URL        | `https://brimframe.de/devlog/riff-racers-the-interface-joins-the-race/` (HTTP 404 today, so free)                      |
| Byline     | Daniel Schmid                                                                                                          |
| Date       | 18 November 2026 (`publishDate`, see below)                                                                            |
| Tags       | riff-racers, development, game-ui, controller, accessibility                                                           |
| Length     | about 1,450 words of body text and 190 in captions, 11 sections, 11 figures, 1 video                                   |
| Neighbours | older: _Beyond the Finish Line_ (the article has no newer neighbour); on the home page it is the newest of three cards |

## Metadata

| Field                               | Value                                                                                                                                                                               |
| ----------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `<title>`                           | Riff Racers UI: One Week of Menu and HUD Fixes — BrimFrame (58 characters)                                                                                                          |
| h1                                  | the full title above                                                                                                                                                                |
| Meta description, `og:`, `twitter:` | What changed in the Riff Racers interface in one November week: driver select, grid tyres, the race HUD, results, controller focus and accessibility. (149 characters)              |
| Canonical and `og:url`              | `https://brimframe.de/devlog/riff-racers-the-interface-joins-the-race/`                                                                                                             |
| `og:image`                          | the hero, 1200×675 WebP, `og:image:alt` is the hero alt text; Twitter card `summary_large_image`                                                                                    |
| Structured data                     | `BlogPosting` and breadcrumbs from the existing layout; author Daniel Schmid, `datePublished` 2026-11-18                                                                            |
| Sitemap and feed                    | entry in `sitemap-0.xml` with `lastmod` 2026-11-18, item in `rss.xml`                                                                                                               |
| Card text (`excerpt`)               | An old build could lose a race result if you pressed Escape too early. That one bug set the tone for a week of fixing how the Riff Racers interface behaves in and around the race. |

No second SEO mechanism was added. Everything comes from the layout and the frontmatter.

## Media

Thirteen WebP files in `apps/brimframe/src/assets/devlog/2026-11-ui-sprint/` (2.7 MB in total). Astro generates the AVIF, WebP and JPEG variants at build time. Provenance of each file is in that folder’s `README.md`.

| File                                                 | Size      | Weight |
| ---------------------------------------------------- | --------- | ------ |
| `riff-racers-ui-grid-forecast-and-tyres.webp` (hero) | 1920×1080 | 318 kB |
| `riff-racers-ui-driver-select-before-720p.webp`      | 1280×720  | 141 kB |
| `riff-racers-ui-driver-select-after-720p.webp`       | 1280×720  | 143 kB |
| `riff-racers-ui-track-select-before.webp`            | 1920×1080 | 155 kB |
| `riff-racers-ui-track-select-after.webp`             | 1920×1080 | 185 kB |
| `riff-racers-ui-race-hud-before.webp`                | 1920×1080 | 332 kB |
| `riff-racers-ui-race-hud-after.webp`                 | 1920×1080 | 329 kB |
| `riff-racers-ui-championship-hub-series-card.webp`   | 1920×1080 | 285 kB |
| `riff-racers-ui-photo-finish-podium.webp`            | 1920×1080 | 210 kB |
| `riff-racers-ui-riff-rewind-offer.webp`              | 1920×1080 | 184 kB |
| `riff-racers-ui-handheld-track-select-1280x800.webp` | 1280×800  | 112 kB |
| `riff-racers-ui-accessibility-options.webp`          | 1920×1080 | 122 kB |
| `riff-racers-ui-showcase-poster.webp` (video poster) | 1920×1080 | 196 kB |

All images are screenshots from the running game, with no generated or composited material. The three “before” images come from earlier builds of the same game (`7c62d59` and `27ee798` from 14 November, `cabe390` from 13 November), not from the start of the sprint. Their captions say so. Race frames show the game’s own AI driving, and the captions and the video paragraph say that too.

No video file is in the repository. The video is the YouTube embed below.

## External links

| Link                                                 | Where                                                          |
| ---------------------------------------------------- | -------------------------------------------------------------- |
| `https://www.youtube.com/watch?v=tN3YGgsmaJQ`        | “Watch on YouTube” under the poster (works without JavaScript) |
| `https://www.youtube-nocookie.com/embed/tN3YGgsmaJQ` | the player, created only after play is activated               |

Internal links: `/games/`, `/devlog/riff-racers-beyond-the-finish-line-championship-career/`, `/devlog/riff-racers-when-the-weather-changes-the-race/`, `/devlog/`. All four resolve in the build.

## Needs a decision before the merge

1. Publication day. `publishDate` is 2026-11-18, the day the video went public. If the merge happens on another day, change that line. To merge without publishing, set `draft: true`.
2. Audio of the uploaded video. The article says “It has no music for now.” The video preview matches the rendered file visually (intro card, 1:28), but I could not check the audio track. Remove that sentence if the upload has music.
3. Visual effects sentence. The closing says “The next job on my list is visual effects.” The editorial draft marked it for confirmation, because the plan exists only in a download package. Keep or cut.
4. Grid wait paragraph. The article names the ten-second grid wait, because the fact sheet requires it next to the tyre-choice change. Keep, or change the wait first.
5. Ich-form tone sentences listed in the media project’s `article/editorial-fact-check.md`, section 2.
6. New tags `controller` and `accessibility` are not used by other articles. The site renders tags without a whitelist.
7. Image sign-off. None of the screenshots has been reviewed by the owner yet.

## Corrected in the final review

Four statements were corrected on 2026-11-18 (details in `implementation.md`): the mini-map line-audit sentence, the scope of the lock-hint claim, the weather sentence in the video paragraph and “save format”. Re-read these four before approving the text.

## After the merge

- Add the article URL to the YouTube video description. Today the description cannot link to a page that does not exist.
- Check `https://brimframe.de/devlog/riff-racers-the-interface-joins-the-race/`, `/devlog/`, `/rss.xml` and `/sitemap-0.xml` once Render has deployed.

## Roll back

Revert the merge commit, or set `draft: true` in the article and merge that change. Existing articles are not affected either way. The two edited tests assert the weather post on the archive page only, so they pass with or without the new article.
