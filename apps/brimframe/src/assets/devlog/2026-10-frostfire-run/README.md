# Frostfire Run devlog images

Selected after reviewing the supplied screenshot overview, individual captures and
`MEDIENINFO.md` in `~/Downloads/Riff Racers/Frostfire Run/`. The lossless source
files remain in `Captures/masters/`; the corresponding numbered JPEGs remain in
`Screenshots/`. No source files were modified.

| Original PNG master    | Website asset                         | Use           |
| ---------------------- | ------------------------------------- | ------------- |
| `Frostfire_Run_01.png` | `frostfire-run-hero.webp`             | Hero and OG   |
| `Frostfire_Run_03.png` | `frostfire-run-frozen-fang.webp`      | Frost         |
| `Frostfire_Run_07.png` | `frostfire-run-inferno-rift.webp`     | Fire          |
| `Frostfire_Run_04.png` | `frostfire-run-split-rune-pass.webp`  | High/Low Road |
| `Frostfire_Run_08.png` | `frostfire-run-hellfire-leap.webp`    | Airborne kart |
| `Frostfire_Run_10.png` | `frostfire-run-glacier-cut.webp`      | Narrow route  |
| `Frostfire_Run_06.png` | `frostfire-run-dragons-maw.webp`      | Transition    |
| `Frostfire_Run_02.png` | `frostfire-run-pitlane.webp`          | Pit lane      |
| `Frostfire_Run_11.png` | `frostfire-run-valhalla-descent.webp` | Wide finale   |
| `Frostfire_Run_12.png` | `frostfire-run-trailer-poster.webp`   | Local poster  |

Screenshot 12 is a finish-line perspective, not a pit-lane detail. Screenshot 02
shows the separated lane and service bays. Screenshots 05 and 09 repeat subjects
already covered by the selected images and are not included.

Prepared from native 2560×1440 PNGs using the project's pinned Sharp dependency:
uncropped 1920×1080 WebP, quality 90, effort 6, with metadata stripped by default.
Astro's existing `Picture` pipeline generates 480/800/1200-pixel AVIF/WebP variants
and JPEG fallbacks with explicit dimensions. The shared article template loads
the hero eagerly and generates its 1200×675 WebP social preview. Inline images
use lazy loading and the existing full-width `devlog-figure` layout.

The article reuses `VideoEmbed.astro` with video ID `tVvz5qD9b7Q`. Its local poster
and privacy notice appear before any YouTube resource loads. A deliberate Play
action creates the responsive `youtube-nocookie.com` iframe; the ordinary YouTube
link remains available without JavaScript or when the provider is blocked. The
component's existing `autoplay=1` parameter starts playback after that action.
The local MP4 and raw captures are not copied into the site.

Article facts were cross-checked against the media notes and the game's
`docs/worlds/frostfire-run.md` and `docs/frostfire-rescue-pass.md`, including the
route rebuild, broken bridge, collision work, background activity and unfinished
pit-stop gameplay. No new playtesting or engine verification is claimed here.
