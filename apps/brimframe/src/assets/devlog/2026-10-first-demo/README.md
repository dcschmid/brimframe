# Riff Racers first-demo devlog screenshots

Three real screenshots supplied by the owner on 2026-10-11 (source:
`racing-game/docs/images/devlog/2026-10-first-demo/`), copied byte-identical:
no cropping, compositing, colour work, retakes, or synthetic captures. Each is
2560 × 1440 RGBA PNG. SHA-256:

```text
bc5be2f0b8480d17c8499e06b5ecac6ec660cd522a11830aaf3431a648ca865e  riff-racers-devlog-driver-kart-wip.png
ca64a226c70798a7655bb5d22b9d2ad3f4ba17d9d29fcad42730d12c790a3cf7  riff-racers-devlog-gameplay-wip.png
4d04a97eda433512dd64c27deee4e2c494475a71088ba8f2685af3a76e64fc3a  riff-racers-devlog-track-wip.png
```

The article `riff-racers-road-to-first-demo.mdx` imports these originals and
renders each in Astro's `Picture` component, so browsers receive responsive
AVIF/WebP derivatives (480/800/1200/1600 px wide) with a PNG fallback row; the
~3.4 MB sources are never served. Layout is at the natural 16:9 aspect ratio
with no cropping.
