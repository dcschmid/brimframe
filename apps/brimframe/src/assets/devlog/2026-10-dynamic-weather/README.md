# Dynamic weather devlog images

Selected from `~/Downloads/Riff Racers/Dynamic Weather Devlog/` after reviewing
all 36 screenshots, the local trailer thumbnail and `production-notes.md`.
All images show actual gameplay. The notes' statement that no YouTube upload
exists is superseded by the user's final link: `https://www.youtube.com/watch?v=iSuBuV3RGTs`.

The eleven screenshots below are unchanged copies of the prepared 1920×1080
WebP files (quality 88) under `web-optimized/screenshots/`. Their original PNGs
and the capture manifest remain in Downloads.

| Prepared screenshot (without `-1920.webp`)          | Website asset                             | Use                              |
| --------------------------------------------------- | ----------------------------------------- | -------------------------------- |
| `rain/rain-03-heavy-rain-low-camera`                | `dynamic-weather-hero.webp`               | Hero, listing cards and OG       |
| `sunny/sunny-01-iron-chorus-start-pack`             | `dynamic-weather-sunny-race.webp`         | Dry racing                       |
| `cloudy/cloudy-01-iron-chorus-overcast`             | `dynamic-weather-overcast.webp`           | Clouds above a dry road          |
| `rain/rain-05-guitar-bridge-wet-road`               | `dynamic-weather-wet-road.webp`           | Rain, reflections and spray      |
| `thunderstorm/thunderstorm-02-bolt-and-spray-wake`  | `dynamic-weather-rain-and-lightning.webp` | Actual lightning on Thunderforge |
| `transitions/transition-02-wet-road-after-the-rain` | `dynamic-weather-after-the-rain.webp`     | Natural clearing-rain sequence   |
| `snow/snow-03-high-road-tracks`                     | `dynamic-weather-snow-tracks.webp`        | High Road tire tracks            |
| `snow/snow-04-low-camera-snow-spray`                | `dynamic-weather-snow-spray.webp`         | Multiple karts and powder        |
| `snow/snow-07-packed-snow-tracks`                   | `dynamic-weather-packed-snow.webp`        | Packed snow and lighting         |
| `rain/rain-04-wet-drift-spray`                      | `dynamic-weather-wet-drift.webp`          | Wet corner                       |
| `sunny/sunny-04-iron-chorus-pack-in-the-turn`       | `dynamic-weather-clear-skies.webp`        | Closing dry race                 |

`dynamic-weather-trailer-poster.webp` comes from the supplied
`trailer/trailer-thumbnail.png`, converted to WebP at its original 1280×720
dimensions, quality 90, with no crop. It shows Frostfire Run gameplay with
the supplied title treatment.

Astro's existing `Picture` pipeline produces 480/800/1200-pixel AVIF and WebP
variants plus JPEG fallbacks, preserving 16:9 and providing explicit dimensions.
The shared article template prioritizes the hero and generates its 1200×675
WebP social image. Body images and the video poster load lazily.

The existing `VideoEmbed.astro` creates the privacy-enhanced YouTube iframe
only after a deliberate Play action, with a local poster, privacy information
and a direct YouTube fallback. It appears once, in “A closer look”.
Analytics consent remains separate from video activation.

The lightning capture is described as heavy rain and lightning, matching the
notes: it does not establish a complete thunderstorm with thunder audio.
The after-rain screenshot comes from the natural `clearing_rain` timeline;
the sunny/cloudy images are separate captures, not a continuous before/after pair.
No local MP4, raw footage, capture tools or production build patches are shipped.
