# Cathedral Circuit devlog images

Selected from `~/Downloads/Riff Racers/Cathedral-Circuit-Devlog/screenshots/selected/`.
The originals remain in Downloads. Only these eight images are used by the article.

| Original file                | Website asset                              |
| ---------------------------- | ------------------------------------------ |
| `hero-candidate.png`         | `cathedral-circuit-hero.webp`              |
| `02-grand-apse-c.png`        | `cathedral-circuit-grand-apse.webp`        |
| `04-cloister-shortcut-a.png` | `cathedral-circuit-cloister-shortcut.webp` |
| `05-gallery-gap-b.png`       | `cathedral-circuit-gallery-gap.webp`       |
| `06-bell-tower-a.png`        | `cathedral-circuit-bell-tower.webp`        |
| `07-pitlane-b.png`           | `cathedral-circuit-pitlane.webp`           |
| `09-close-racing-b.png`      | `cathedral-circuit-close-racing.webp`      |
| `10-final-approach-a.png`    | `cathedral-circuit-final-approach.webp`    |

Prepared with the project's pinned Sharp dependency as 1920×1080 WebP, quality 90,
effort 6 (1.13 MiB total). Astro's existing `Picture`/`getImage` workflow generates
responsive AVIF/WebP images and the social preview during the build. The hero also
serves as the local poster for the existing click-to-load YouTube component.
