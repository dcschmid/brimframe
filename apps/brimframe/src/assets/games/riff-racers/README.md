# Riff Racers production assets

`logo.png` is the original transparent Riff Racers logo supplied by the owner as
“Neon Chrome Riff Racers Logo.png”. It is copied unchanged: 2172 × 724 pixels,
RGBA PNG. The SHA-256 of the original and repository copy is:

```text
52c6ccd6533a0a7a95a5a867dea58f39b9be643758617e9e8c57f7a73fc6bcde
```

`src/config/games.ts` imports the original metadata. Astro's `Picture`
component generates responsive derivatives at 240, 360, 540 and 900 pixels wide in
AVIF and WebP, with a lossless PNG fallback row for browsers that support
neither. The ladder covers the rendered widths (roughly 524 CSS px on mobile,
448 px on desktop) plus the 2x device-pixel density of the largest of them, so
no derivative upscales the source. The
AVIF and WebP rows keep the logo's alpha channel; the lossless PNG row is the
transparency guarantee for older browsers: it sets no numeric `quality`, which
avoids enabling Sharp's palette quantisation. The browser picks AVIF first,
then WebP, then PNG; the 1.5 MB source is never served. Its empty alt avoids
repeating the adjacent game heading.
Design boards are references only and are not used as production artwork.

Optional owned artwork can be imported into the `artwork` field with descriptive
`artworkAlt`. That image uses Astro's responsive optimisation pipeline.
