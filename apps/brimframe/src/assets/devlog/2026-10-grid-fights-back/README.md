# The Grid Fights Back devlog images

Selected from `~/Downloads/Riff Racers/devlog-race-action/screenshots/final_selects/`
after reviewing all 20 final selects, the contact sheet, `notes/best-screenshots.md`
and `notes/rivalry-and-personality-moments.md`. All images are native
2560×1440 frames grabbed from the running game (Defold 1.14.0, 12-racer Headliner
races, every kart driven by the AI). None is edited, composited or generated.

The races were recorded at three laps instead of Headliner's seven, using a
capture-only override in a scratch build of the game. The AI, karts and tracks
were not changed. The weather system was off, so the rain on Thunderforge and the
snow on Frostfire Run are those tracks' own conditions.

Each website copy is the lossless PNG resized to 1920×1080 (Lanczos) and saved as
WebP at quality 88, with the same recipe as the weather devlog. The original PNGs
stay in Downloads.

| Website asset                                     | Source (final_selects, `.png`)                  | Use                                              | Source SHA-256                                                     |
| ------------------------------------------------- | ----------------------------------------------- | ------------------------------------------------ | ------------------------------------------------------------------ |
| `grid-fights-back-hero.webp`                      | `cover-recommended-iron-chorus-launch`          | Hero, listing cards and OG                       | `bded3ef327312b990139e7a2362f19d36d9887730d24caa6261a742f443f16b2` |
| `grid-fights-back-trailer-poster.webp`            | `hero-05-razorline-hud-position-gained`         | Video poster (the game's own HUD, no added text) | `de443b93ccbb1c5c4414eff746bb99088d67f2b600a27556c5c7150db1f9f4de` |
| `grid-fights-back-catwalk-cut.webp`               | `hero-03-razorline-catwalk-cut-jump`            | Shortcut jump, Rhythm Kaur                       | `e796631219e9029cde294457fa2648fb61bff44c34fa0d383b6c3034d1aaf5bc` |
| `grid-fights-back-cathedral-pack.webp`            | `hero-01-cathedral-three-abreast`               | Tight pack, Jax Monroe camera                    | `153a61006b365e0259acf7e088db40387e142a444594b6a61c3d74162a500827` |
| `grid-fights-back-frostfire-attack.webp`          | `hero-02-frostfire-mika-attacks-the-pack`       | Mika Blaze, seventh to fourth                    | `4e1278c5c88d4edbb305c242621f7a9b88e38f6c162066ed23ca454aadb817c4` |
| `grid-fights-back-iron-chorus-side-by-side.webp`  | `select-08-iron-chorus-imani-side-by-side`      | Imani Reed holding ninth                         | `0d33a5a3d5e4414c950b645e2a036add69567a421f53e830ec96e244cb880225` |
| `grid-fights-back-thunderforge-pass.webp`         | `select-13-thunderforge-hud-furnace-cut`        | The logged Mika Blaze and Luca Moretti arc       | `c22592ad130683df6a16dc834c69645d5959ee1972cf12b7e43b9382cbd5a293` |
| `grid-fights-back-thunderforge-photo-finish.webp` | `hero-04-thunderforge-photo-finish-three-karts` | Three karts within 0.28 s                        | `48b61bc9562b0e163d91201c3e5ec0a69f16456cbdac92257d6aeb150cab9982` |

Every caption states only what the race log of the same recording supports
(positions, nearest karts, logged events). The package notes record that replaying
a seeded race in the native engine is not always identical to the original, so no
caption takes facts from a different run. The Thunderforge pass frame and the
photo finish come from replays verified against the scouted race (identical
finishing order and times to 0.01 s).

Two honesty limits shape the copy. The package has no retaliation contact, so
the article shows the contact, the grudge and the clean pass that settles it, and
says so. Personality windows match the driver archetypes only loosely (the Tex
Rivers defending clip is the weakest), so no caption claims a personality trait.

Astro's existing `Picture` pipeline produces 480/800/1200-pixel AVIF and WebP
variants plus JPEG fallbacks, preserving 16:9. The shared article template
prioritizes the hero and generates its 1200×675 WebP social image. Body images
and the video poster load lazily. No local MP4 or raw footage is shipped.

`VideoEmbed.astro` creates the privacy-enhanced YouTube iframe only after a
deliberate Play action. The trailer is
`https://www.youtube.com/watch?v=GDF7JZwDZOI` (video ID `GDF7JZwDZOI`).
