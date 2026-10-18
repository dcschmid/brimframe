# Riff Racers first-demo devlog screenshots

Three real screenshots supplied by the owner on 2026-10-11 (source:
`racing-game/docs/images/devlog/2026-10-first-demo/`), originally 2560 × 1440
RGBA PNG. On 2026-10-18 the sources were converted with the project's pinned
Sharp dependency to 1600 px wide WebP (quality 90, effort 6), matching the
convention of the later devlog posts; no cropping or other retakes. SHA-256:

```text
2ce768f7464725672f87e070d3c7227ed6f4a939692a20bba8ad1e04b810b19e  riff-racers-devlog-driver-kart-wip.webp
3582182b411d2dea8c53a81818feefb76c5f3b1e4c4a33efffbeecd4f7a1c54c  riff-racers-devlog-gameplay-wip.webp
13e846ad3195b316062cd0a9e00a82d8542daa8f9a595f660d65257ebb4866d9  riff-racers-devlog-track-wip.webp
```

The article `riff-racers-road-to-first-demo.mdx` imports these WebP sources and
renders each in Astro's `Picture` component, so browsers receive responsive
AVIF/WebP derivatives (480/800/1200/1600 px wide) with a JPG fallback. Layout
is at the natural 16:9 aspect ratio with no cropping.
