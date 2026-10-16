# Thunderforge devlog images

Selected from `~/Downloads/Riff Racers/THUNDERFORGE/screenshots/selected/` after
reviewing the selection overview and hero. The original PNGs remain in Downloads.
The article uses eight inline screenshots, one hero and one local trailer poster.

| Original file                            | Website asset                          |
| ---------------------------------------- | -------------------------------------- |
| `thunderforge_devlog_hero.png`           | `thunderforge-hero.webp`               |
| `thunderforge_thumbnail_source.png`      | `thunderforge-trailer-poster.webp`     |
| `03_thunderforge_lightning_climb.png`    | `thunderforge-lightning-climb.webp`    |
| `04_thunderforge_broken_bridge.png`      | `thunderforge-broken-bridge.webp`      |
| `07_thunderforge_forge_interior.png`     | `thunderforge-forge-interior.webp`     |
| `08_thunderforge_furnace_cut.png`        | `thunderforge-furnace-cut.webp`        |
| `10_thunderforge_the_hammer.png`         | `thunderforge-the-hammer.webp`         |
| `11_thunderforge_maintenance_tunnel.png` | `thunderforge-maintenance-tunnel.webp` |
| `02_thunderforge_start_finish.png`       | `thunderforge-start-finish.webp`       |
| `12_thunderforge_thunder_run.png`        | `thunderforge-thunder-run.webp`        |

Prepared with the project's pinned Sharp dependency as uncropped 1920×1080 WebP,
quality 90, effort 6. Astro's existing `Picture`/`getImage` pipeline generates
responsive AVIF/WebP variants, fallbacks and the social preview during the build.
Inline images use quality 90 and lazy loading; the shared article template loads
the hero eagerly. No new image, gallery or video dependency is needed.

The trailer reuses `VideoEmbed.astro`: the local poster is replaced by a
`youtube-nocookie.com` iframe only after Play. The direct YouTube link remains
available without JavaScript or if the provider is blocked.
