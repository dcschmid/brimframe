# BrimFrame

The first studio website for **BrimFrame**, an independent solo game studio by
**Daniel Schmid**, based in Germany. Built as a static Astro site with TypeScript,
semantic HTML and CSS. The public site is English only.
Riff Racers is the only current game. There is no press section, newsletter,
tracking, contact backend or standalone game application.

## Workspace

```text
apps/brimframe/
  public/               Unprocessed static files (favicon, robots.txt, og-image.png)
  src/assets/           Owned images and original game logos
  src/components/       Navigation, wordmark, hero, game feature, devlog, SEO
  src/config/           Typed site, legal, game and value configuration
  src/content/devlog/   Markdown/MDX entries; draft example included
  src/content.config.ts Build-time collection loader and validated schema
  src/layouts/          Shared document and editorial layouts
  src/pages/            Static routes plus rss.xml feed endpoint
  src/styles/           Shared tokens, responsive styles and typography
  src/utils/            Publication filtering and date formatting
scripts/                Render schema validation and og-image generator
tests/                  Unit, production-output, content-build and browser tests
render.yaml             Repository-root Render Static Site Blueprint
.github/workflows/      CI checks used by Render checksPass
```

There are no empty shared packages. Root commands select `@brimframe/studio`.

## Requirements and setup

- Node **24.21.0**, pinned in `.node-version` and bounded by root `engines`.
- pnpm **10.33.0**, pinned in `packageManager` and `engines`.
- Astro **7.3.8**, the stable registry release verified during implementation.

If you use nvm:

```sh
nvm install "$(cat .node-version)"
nvm use "$(cat .node-version)"
npm install --global pnpm@10.33.0
pnpm install --frozen-lockfile
pnpm dev
```

The local site runs at `http://127.0.0.1:4321`. A fresh `pnpm install` also works;
use `--frozen-lockfile` in CI and deployment. Keep `pnpm-lock.yaml` in source
control. Only the esbuild and sharp dependency build scripts are allowed.

```sh
pnpm check            # Astro diagnostics and strict TypeScript
pnpm build            # apps/brimframe/dist
pnpm preview          # Serve the production output locally
pnpm lint             # Prettier validation, including Astro and YAML
pnpm format           # Apply formatting
pnpm test             # Publication, logo integrity, built links, multi-post build
pnpm exec playwright install firefox
pnpm test:e2e         # Production Firefox navigation, keyboard, reflow, axe
pnpm validate:render  # Fetch and validate against Render's current official schema
pnpm validate         # All checks, in order, including build
```

`pnpm test` expects a production build first. The content integration test builds
a disposable copy with synthetic posts; these fixtures never enter the real
content collection or the deployed output. Browser tests start a production
preview server automatically. Stop a development server using port 4321 first so
the tests inspect the production build. Linux CI installs Firefox system
dependencies with `playwright install --with-deps firefox`.

Tests cover all routes, all requested viewport widths (320–1920px), text enlarged
to 200%, reader-defined line/letter/word spacing, active navigation indicators
in light and dark forced-colour modes, mobile menu
pointer and keyboard operation, Escape focus restoration, the first-Tab skip link
on every route (including isolated Devlog articles and 404s),
JavaScript-disabled navigation, no third-party requests, no client storage,
reduced motion, 404s, drafts, zero posts and multiple posts. Axe checks target
WCAG 2.2 AA; passing automation is not a complete accessibility audit.

## Site and game configuration

Edit `apps/brimframe/src/config/site.ts` for the canonical origin, copy, locale,
contact details, social URLs and legal data. Unconfigured social/contact methods
are omitted. An email takes precedence over a contact URL. No accounts or
business details are invented. Every public page uses English and `lang="en"`;
there is no language switcher.

`developerName` and `studioIntroduction` supply the solo-studio identity.
The V1 contact email is `dcschmid@murena.io`. The supplied owner name and postal
address are configured under `legal`; the full address renders only on
`/impressum/` and `/datenschutz/`. Keep personal address details out of the footer,
metadata and marketing content. `src/config/privacy.ts` holds provider source
links, the policy revision date and the correspondence retention policy. Changing
`site.contactEmail` updates all BrimFrame contact links; if the email provider
changes too, reassess the Privacy page and provider configuration.

Edit `src/config/games.ts` for genre, status, original assets and a game website
URL. `gameSiteUrl: null` displays “Dedicated game site in development.” as a
non-link status. Setting it to
`https://riffracers.brimframe.de` activates the external CTA automatically. Change
the status centrally, or set it to `null` to omit it. Do not add speculative
dates or fictitious games.

The written brand name is **BrimFrame**. The visual wordmark reads **BRIMFRAME**;
domain names, workspace names and filenames may remain lowercase.
`BrimFrameWordmark.astro` imports the scalable `src/assets/brand/wordmark.svg`.
Its nine geometric letter outlines preserve a clear F, with two restrained
orange frame accents and the HTML descriptor “Independent Games”. A real text
fallback supplies the brand name to assistive technology. Replace the SVG with
a final approved master asset without changing page layouts or accessible names.
The favicon uses a compact BF/frame motif.

## Writing public copy

Write in English, as Daniel would explain the work to someone interested in his
games. Use these rules when drafting or editing, including AI-assisted work:

- Use “I” for Daniel’s decisions and experience. BrimFrame is a solo studio;
  don’t invent a team voice. Keep legal and accessibility information neutral.
- Say what is being made or changed. Prefer “I’m tuning how the karts handle”
  to “crafting distinctive experiences”. Remove claims a reader cannot check.
- Keep useful detail: personal facts, specific problems, numbers and limitations.
  Don’t invent anecdotes, feelings, feedback or progress to sound more human.
- Use everyday words and contractions. Vary sentence length naturally; avoid
  repeated three-part slogans, forced contrasts and a punchline in every paragraph.
- State uncertainty where it matters. Distinguish a demo target from a release
  promise without repeating the same disclaimer throughout a post.
- Read the copy aloud. Cut repetition and sentences that could describe any
  studio. Don’t add slang, deliberate mistakes or quirks just to sound informal.
- Preserve the approved “Different Games. New Worlds. Same Passion.” and
  “Stay curious. Stay connected.” lines. Keep dates, features, publication state
  and metadata consistent when editing a Devlog post.

## Artwork and fonts

The owner-supplied transparent Riff Racers logo is included unchanged as
`src/assets/games/riff-racers/logo.png` and imported in `src/config/games.ts`.
The original PNG source remains byte-for-byte unchanged. Astro's required Sharp
image processor is installed explicitly and version-pinned in the app. It runs
only during the static build and adds no browser dependency. Astro's `Picture`
component generates responsive AVIF and WebP derivatives, with a lossless PNG
fallback row at 240–1350 px for browsers supporting neither. The PNG row sets no
numeric `quality`, avoiding Sharp palette quantisation, so transparency, aspect
ratio and the whole logo stay intact; there is no cropping, and retina sizes
remain available. Its alt is empty because the nearby heading already
names the game. The asset directory documents the source dimensions and SHA-256.

The three initial attachments are brand/concept boards. No parts of those boards
have been cropped, traced or embedded.

Owned game artwork can be assigned to `artwork` with `artworkAlt`. Astro's
`Picture` component generates responsive AVIF and WebP derivatives for artwork
and devlog images, with a PNG fallback row. Below-fold images are lazy-loaded
with intrinsic dimensions. The hero
uses the owner-supplied clean logo and teaser references as visual direction,
without embedding their raster files. `src/assets/brand/hero-frame.svg` contains
static BF architecture, recessed surfaces, perspective seams and orange edge
lighting. CSS adds restrained ambient gradients and framing. Desktop artwork
sits beside the HTML hero statement; mobile artwork occupies its own space
below the calls to action. No animation, WebGL, external asset request or extra
JavaScript is required. Its named `artwork` slot remains a replacement point for
final owned artwork. All hero copy stays in HTML; decorative SVGs are excluded
from the accessibility tree and keyboard navigation.

The Games heading, studio sections and closing section use static, decorative
frame lines and low-opacity ambient gradients. The game feature keeps most of
its colour in the original logo. These details add no client JavaScript.

Inter and Orbitron are self-hosted through Fontsource variable packages. Only
Latin WOFF2 subsets load, using `font-display: swap`. Inter is preloaded on
every page. Orbitron is preloaded only on the pages that use it (the home and
About pages, via the `displayFont` layout prop); it is reserved for the hero
and the value numerals, and body text uses Inter. Package licenses remain in
the dependencies. No Google Fonts runtime requests are made.

## Type scale and spacing

Sizes are `rem` tokens in `src/styles/global.css`, so they follow the reader's
browser text-size setting: `--fs-body` 17px for running text, `--fs-ui` 16px for
navigation, buttons, links and the footer, `--fs-small` 15px for metadata, and
`--fs-label` 14px for uppercase section labels. Nothing visible is smaller than
that except the 12–13px “Independent Games” descriptor inside the wordmark
lockup. `--muted` and `--text-soft` keep the secondary copy above 9:1 contrast
on the dark surfaces. Vertical gaps use `--space-section`,
`--space-section-tight` and `--space-heading`; keep new sections on those tokens.
The wordmark width is the `--wordmark-width` token, and the navigation is
centred on the wordmark letters from the same value. The V1 visual design is
frozen: change it only for a usability or accessibility problem.

Navigation uses padded targets and a persistent current-page underline, including
in system high-contrast colours. Small-screen hero buttons span the available
width. Devlog cards adapt to the number of published posts: one update uses a
wide title/summary layout, while multiple updates form a responsive grid. Body
copy uses the brighter `--text-soft` token on editorial pages. Interactive borders
use `--control-border`; keep the quieter `--border` token for decorative dividers.

## Devlog authoring

Create a flat, kebab-case `.md` file in `src/content/devlog/`; use `.mdx` when
the article embeds figures (see below).

```yaml
---
title: 'Your real update title'
description: 'A concise factual description.'
publishDate: 2026-10-10
updatedDate: 2026-10-11 # optional, no earlier than publishDate
heroImage: './images/your-owned-image.png' # optional
heroImageAlt: 'A useful description of the image.' # required if image present
tags: ['development']
draft: true
game: 'riff-racers' # optional, must match a configured game
featured: false # optional editorial metadata, does not override date order
---
```

The build-time `glob` loader and Zod schema validate the data. Drafts default to
`true`; **only explicit `draft: false` entries are published**, in every mode.
Publishing is controlled by draft status, not scheduled by a date. Dates display
in UTC. Entries sort newest first, with a stable ID tie-break. The homepage shows
up to three; the devlog lists all published entries. Optional `slug` frontmatter
can override the filename and must use kebab-case.

Start article Markdown with prose or an `##` heading because the page supplies
the `h1`. Articles include publication/update dates, topics, image optimisation,
Article metadata with Daniel as the author, and adjacent-post navigation. Real posts automatically receive
static article URLs and appear in the sitemap.
Write real development notes in Daniel’s first-person voice. Do not turn them
into team announcements or invent a development history to fill the layout.

Articles with screenshots use `.mdx`: import `Picture` from `astro:assets` and
the images from `src/assets/devlog/<post>/` after the frontmatter, then place
each figure as `<figure class="devlog-figure">` with the `Picture`, a real
`<figcaption>`, meaningful `alt`, explicit `widths`/`sizes`, and lazy loading.
Originals stay byte-identical in `src/assets/` and are never served; the build
emits responsive AVIF/WebP/PNG derivatives for them.

## SEO, accessibility and privacy

All pages have unique titles/descriptions, Open Graph and social card metadata,
with a centrally configurable social image (1200×630 `public/og-image.png`,
regenerated with `node scripts/make-og-image.mjs`; `og:image` carries width,
height and alt). Indexable pages also include canonical URLs. The SEO component
emits only known Organization/Article facts; devlog articles add a
BreadcrumbList graph. The official `@astrojs/sitemap` integration,
`public/robots.txt` (points crawlers at the sitemap) and the `@astrojs/rss`
devlog feed (`/rss.xml`, published posts only, linked from every page head)
use `https://brimframe.de`. The custom
404 is noindex. Legal pages awaiting launch review are noindex and excluded from the
sitemap until `legal.ready` is true.

The first keyboard focus target is “Skip to main content”. It stays off-screen
until focused, then appears above the header with a strong outline. Enter focuses
the single `main#main-content`; the next Tab continues after navigation.

The site includes semantic landmarks, logical headings, visible
focus, 44px-or-larger navigation targets, responsive reflow and reduced-motion
styles. The mobile menu enhances an always-available HTML navigation list;
without JavaScript the links remain visible. Escape closes the enhanced menu
and returns focus to its button. There is no focus trap, autoplay or flashing.

The application adds no trackers, external embeds, cookies or local storage.
This does not certify GDPR compliance. The V1 Privacy page explains Render
static hosting and technical request processing, Murena email contact, legal
bases, international transfers, retention and data subject rights. Provider
information is linked to official sources rather than copied into a fixed
subprocessor list. No provider-specific retention period is invented.

The operator has adopted a policy to normally delete general enquiries no later
than **12 months after the matter is concluded**, unless an ongoing business
relationship, legal obligations or legal claims require continued retention.
This is BrimFrame’s internal correspondence policy, not Murena’s retention rule.
Put a periodic mailbox review in place to implement it. It is documentation and
an operational policy; the static website cannot delete email automatically.

## Render deployment

1. Push the complete repository, including the lockfile and workflow, to GitHub.
2. Enable GitHub Actions and let the **Website checks / quality** job pass.
3. Create a Blueprint in Render using the root `render.yaml`.
4. Review the Static Site named **brimframe** and leave the root directory unset.
5. Verify the initial output through its Render URL, then configure custom DNS.

The Blueprint uses `type: web`, `runtime: static`, a pinned pnpm bootstrap and
`install --frozen-lockfile`. It builds from the repository root with a workspace
filter, publishing `apps/brimframe/dist`. Build filters include the app, root
dependency/workspace files, Node configuration, deployment files and CI tests.
When real shared packages are added, add their paths to this build filter.

`autoDeployTrigger: checksPass` is backed by the included workflow, which runs on
every push and pull request without path filters. Ensure GitHub Actions is
enabled and Render can observe those checks. If the repository uses a provider
without CI check integration, explicitly change to `commit` or configure
supported CI first; do not leave a deployment waiting for unavailable checks.

The schema validator downloads the current JSON schema from
`https://render.com/schema/render.yaml.json`; it requires internet access and
fails clearly on schema/network errors. It validates structure, not ownership,
DNS, service creation or account-specific availability.

### Custom domain

The Blueprint configures `brimframe.de`. Render automatically adds `www` and
redirects it to the root domain. DNS verification is a separate Dashboard step;
an unverified domain does not prevent the initial Render URL deployment.

Use the exact DNS targets shown by Render for your service, remove conflicting
records (including AAAA records as directed by Render), then click **Verify**.
Wait for DNS and the TLS certificate to become active. Test both root and www.
Keep `renderSubdomainPolicy: enabled` until the custom domain works reliably.
Only then consider changing it to `disabled`. Canonical URLs already point to
the custom domain.

Responses configure `nosniff`, a referrer policy, a permissions policy and
`X-Frame-Options: DENY`. Hashed Astro assets have immutable caching. No untested
CSP or SPA catch-all is used. Render serves the top-level `404.html` for unknown
paths; confirm the HTTP status after deployment.

## Before public launch

The supplied owner name, postal address and email are implemented. The V1 privacy
notice now describes the known services; it has not been professionally audited.
Keep `legal.ready: false` until the actual account arrangements and obligations
have been reviewed. This leaves both legal pages readable and linked in the
footer while excluding them from indexing and the sitemap. Change the flag to
`true` and rebuild after the launch review.

Confirm whether any registration or VAT information applies. No registration
number, VAT ID, telephone number, legal entity type or additional representative
has been supplied, so those fields remain omitted. Verify that the published
contact methods satisfy the applicable requirements for the site.

Enable CI, connect Render, and verify domain DNS/TLS and production response
headers. The repository includes a Blueprint; no deployment or account agreement
has been created or verified by this task. Approved final BrimFrame SVG assets
and social artwork can be supplied later.

### PRODUCTION PRIVACY CHECKLIST

- [ ] Confirm final Render account/service configuration
- [ ] Download/archive current Render DPA
- [ ] Review Render subprocessors
- [ ] Verify Murena Art. 28 DPA availability
- [ ] Confirm final public business email
- [ ] Confirm no analytics/tracking were added
- [ ] Confirm no third-party embeds were added
- [ ] Review Privacy page against production deployment
- [ ] Review Legal Notice factual information
- [ ] Perform final accessibility test

These are launch checks against the actual public deployment, not claims that
provider contracts or production settings have already been verified. Local
browser tests check third-party requests, cookies, local/session storage,
keyboard navigation, reflow and axe; repeat the relevant checks on the live site.

**TODO BEFORE PRODUCTION LAUNCH — Murena processing agreement:** Verify whether
the specific Murena account used for BrimFrame provides or supports a Data
Processing Agreement / Auftragsverarbeitungsvertrag under Art. 28 GDPR for
business use. This account-specific status remains **unverified**. If the account
does not provide an appropriate agreement, consider moving the public BrimFrame
business email to a provider that explicitly provides an Art. 28 GDPR DPA.
Murena’s public EU/Finland infrastructure description does not establish that
such an agreement is available or completed for this account.

Archive the applicable provider documents and record account-specific decisions
outside the public website. Review the policy whenever the hosting or email
provider changes or a new service is added. The technical and content checks do
not establish legal certification; final legal responsibility remains with the
site operator.

## Adding the future Riff Racers site

When there is actual work for the game website, add `apps/riff-racers/` as a
second Astro app with a distinct workspace name and its own origin/configuration.
It will be picked up by the existing `apps/*` workspace glob. Add a second
Render Static Site with its own filter and publish directory, keeping root
build access to the workspace. Add CI commands for the new app.

Extract shared packages only when real code is shared. Then add the relevant
package paths to each consuming site's Render filters and CI checks. Activate
the game URL in BrimFrame config only when the actual site is live.

## Documentation consulted

Verified against official documentation during implementation:

- [Astro setup](https://docs.astro.build/en/install-and-setup/)
- [Content Collections](https://docs.astro.build/en/guides/content-collections/)
- [Astro images](https://docs.astro.build/en/guides/images/)
- [Astro sitemap](https://docs.astro.build/en/guides/integrations-guide/sitemap/)
- [pnpm workspaces](https://pnpm.io/workspaces)
- [Render Static Sites](https://render.com/docs/static-sites)
- [Render Blueprint specification](https://render.com/docs/blueprint-spec)
- [Render monorepos and build filters](https://render.com/docs/monorepo-support)
- [Render custom domains](https://render.com/docs/custom-domains)
- [Render Node versions](https://render.com/docs/node-version)
- [Render static headers](https://render.com/docs/static-site-headers)
- [Render logging (Static Site limitations)](https://render.com/docs/logging)
- [German DDG § 5 (provider information)](https://www.gesetze-im-internet.de/ddg/__5.html)
- [Render Privacy Policy](https://render.com/privacy)
- [Render Data Processing Addendum](https://render.com/dpa)
- [Render security and current subprocessors](https://render.com/security)
- [Murena Workspace infrastructure](https://murena.com/workspace/)
- [BayLDA contact and complaint options](https://www.lda.bayern.de/de/kontakt.html)
- [GDPR official text](https://eur-lex.europa.eu/eli/reg/2016/679)
