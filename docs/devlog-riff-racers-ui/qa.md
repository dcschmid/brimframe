# QA: “The Interface Joins the Race”

Checked on 2026-11-18 in the worktree `brimframe-riff-racers-ui`, branch `content/riff-racers-ui-devlog`. Environment: Fedora 44, Node 24.21.0, pnpm 12.14.0, Playwright 1.64.1 with Firefox for the test suite and Chromium for the lab timings. Every number below comes from a run on this machine. The “before” column is `main` at `22e43f4` in the same worktree, measured before I added any file.

## Repository scripts

| Script                                              | Before                                  | After                                                                             |
| --------------------------------------------------- | --------------------------------------- | --------------------------------------------------------------------------------- |
| `pnpm lint` (Prettier)                              | pass                                    | pass, includes the new MDX, tests and these notes                                 |
| `pnpm check` (Astro and TypeScript)                 | 0 errors, 0 warnings, 36 files          | 0 errors, 0 warnings, 36 files                                                    |
| `pnpm build`                                        | 19 pages, 2 min 10 s (cold image cache) | 20 pages, 19.5 s (warm cache)                                                     |
| `pnpm test` (Node test runner)                      | 28 of 28                                | 31 of 31 (3 new)                                                                  |
| `pnpm test:e2e` (Firefox, includes axe WCAG 2.2 AA) | 112 of 112 in 1.7 min                   | 121 of 121 in 2.5 min (9 new)                                                     |
| `pnpm validate:render`                              | not run                                 | not run: needs network access to Render’s schema service, `render.yaml` untouched |

The first full browser run on the branch had five failures. Four were a bug in my new spec (it compared viewport coordinates instead of document coordinates). One was the existing weather test expecting its card on the home page, which now lists three newer posts. I fixed both and re-ran the complete suite; the table shows that run.

## New automated checks

| Check                                                                                                                                                                                                                                          | Result |
| ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------ |
| Title, description, Open Graph, Twitter card, canonical, `og:image` 1200×675, `BlogPosting` author and date                                                                                                                                    | pass   |
| Card first on `/` and `/devlog/`, entry in `rss.xml` and `sitemap-0.xml`                                                                                                                                                                       | pass   |
| “Older update” is _Beyond the Finish Line_, and that article links back as “Newer update”                                                                                                                                                      | pass   |
| 11 section headings in order, 11 figures, 13 images (hero, 11 figures, poster)                                                                                                                                                                 | pass   |
| Each “Before” figure is followed by its “After” figure, not a composite                                                                                                                                                                        | pass   |
| One `VideoEmbed` with the real id, no `<iframe>`, `<video>` or preconnect in the HTML                                                                                                                                                          | pass   |
| Every image has alt text, `width`, `height`, `sizes`, AVIF and WebP at 480 and 800 px, under 300 kB                                                                                                                                            | pass   |
| Internal links resolve: `/games/`, two articles, `/devlog/`                                                                                                                                                                                    | pass   |
| No promotional phrases, no “fully accessible”, “WCAG”, release or platform claims; the AI, virtual gamepad and developer-switch disclosures are present                                                                                        | pass   |
| 360, 768, 1280 and 1920 px: no horizontal overflow, no external requests, no console errors, no failed responses, axe with `wcag2a`, `wcag2aa`, `wcag21aa`, `wcag22aa` and best-practice rules reports no violations, text at 200 % still fits | pass   |
| Figures are stacked: each starts below the previous one at all four widths                                                                                                                                                                     | pass   |
| Video gate: nothing is requested from YouTube until Enter, Space or a click; then exactly one `youtube-nocookie.com` embed request                                                                                                             | pass   |
| Without JavaScript: poster and “Watch on YouTube” link, no button, no external request                                                                                                                                                         | pass   |
| Both listings lead to the article, and the neighbours link back and forth                                                                                                                                                                      | pass   |

## Checked by hand

**Layout.** I looked at full-page screenshots at 360, 768, 1280 and 1920 px (article) and at 360 and 1280 px (devlog archive and home page). Before and after pairs are stacked and full width; at 360 px the figure text is small, as in any screenshot, and the paragraph above each figure carries the information. The new card is the first card of the archive with its excerpt complete at 360 and 1280 px. No overflow at any width. The home page now shows this article, _Beyond the Finish Line_ and _The Grid Fights Back_.

**Keyboard.** From the top of the page, 15 Tab presses reach the play button. The focus ring is a solid 3 px outline in `rgb(96, 165, 250)` and is visible on the poster (`screenshots/video-button-keyboard-focus-1280.webp`). Enter and Space both start the player.

**Video and consent.** On a fresh browser profile at 1280×900:

- Before any interaction the page made 5 requests, all to `127.0.0.1`. None went to YouTube or Google.
- After pressing Enter the iframe `https://www.youtube-nocookie.com/embed/tN3YGgsmaJQ?autoplay=1` loaded with `loading="lazy"` and `referrerpolicy="strict-origin-when-cross-origin"`. Its player then contacted `youtube-nocookie.com`, `www.google.com`, `fonts.gstatic.com`, `googlevideo.com` and `i.ytimg.com`, which is what the notice under the poster says (“data may be transferred to Google/YouTube”).
- The video played: intro card, duration 1:28 (`screenshots/video-after-activation-1280.webp`).
- Without consent the page made 0 requests to Fathom and showed the analytics banner with “Reject analytics” and “Accept analytics”. The video gate does not touch the analytics choice.

**Content.** I compared the rendered text with the editorial draft and the fact sheet it was checked against. The disclosures sit next to the material they qualify: the figure captions for the AI-driven race frames, the virtual gamepad in the controller section, and the developer switch in the rain paragraph and the video paragraph.

## Lab timings (not field data)

Chromium, local `astro preview`, no throttling, cold context, three runs per width, scrolling through the whole article so every lazy image loads:

| Width   | Largest Contentful Paint | Cumulative Layout Shift  |
| ------- | ------------------------ | ------------------------ |
| 360 px  | 56, 60, 100 ms           | 0.0000 in all three runs |
| 1280 px | 36, 40, 44 ms            | 0.0000 in all three runs |

These show that the reserved image sizes prevent layout shifts. The paint times are for localhost and say nothing about production. I did not run Lighthouse and have no field data.

Page weight from `dist`: article HTML 45,900 bytes; 13 JPEG fallbacks of 101 to 223 kB each (2.2 MB together, the largest one is the hero). Browsers that support AVIF or WebP receive the smaller variants.

## Screenshots

In this directory (WebP, quality 78):

| File                                    | Shows                                            |
| --------------------------------------- | ------------------------------------------------ |
| `devlog-index-before-1280.webp`         | devlog archive on `main`, 1280 px                |
| `devlog-index-after-1280.webp`          | devlog archive with the new card on top, 1280 px |
| `article-1280.webp`, `article-360.webp` | the article, full page                           |
| `video-button-keyboard-focus-1280.webp` | play button with keyboard focus                  |
| `video-after-activation-1280.webp`      | the embedded player after Enter                  |

The full PNG set (article at four widths, archive before and after at four widths, home page at two) is in the media project under `handoff/DL-05/screenshots/`. The scripts that took them are in `handoff/DL-05/tools/`.

## Not checked

- The production site. Nothing is deployed, and GitHub CI has not run because nothing is pushed.
- Browsers other than Firefox in the suite (the repository’s Playwright config defines only Firefox) and real phones or tablets. Chromium was used only for the lab timings.
- A screen reader session. axe and the keyboard checks cover structure and focus, not how the page reads aloud.
- Lighthouse, field Web Vitals and Google’s structured-data validator.
- The audio of the uploaded video. The article says it has no music. The preview showed the intro card and the 1:28 duration, which match the rendered file, but I could not verify the audio track from outside YouTube. Confirm before the merge.
- That the YouTube description links back to the devlog. It cannot link to the article before it exists.
