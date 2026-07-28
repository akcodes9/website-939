# Codex Space

Marketing site for Codex Space, a 550 MW AI data-centre campus in Hyderabad,
Telangana. The page is built as an engineering drawing set: a general
arrangement, then ten layers, each with its own plate.

## Running it

There is no build step and no dependencies. Open `index.html` directly, or
serve the directory if you want the anchors and video to behave exactly as
they will in production:

```bash
python3 -m http.server 8787
```

## Structure

```
index.html                 all markup, one file
style.css                  all styles, one file
script.js                  nine modules, audited against a registry at boot
assets/fonts/              self-hosted, subset
assets/draw/*.webp         the layer plates, 1x and 2x
assets/draw/_preview-*.svg work in progress, not yet wired into the page
assets/video/              Layer 06 background loop, VP9 + H.264 + poster
```

## Constraints the code holds to

- **No external requests.** Fonts, video and images are all local. Nothing is
  fetched from a CDN, and there is no analytics.
- **No framework, no build.** Vanilla HTML, CSS and JavaScript. The WebGL in
  the hero is hand-rolled — buffers, shaders and 4×4 matrix maths — rather
  than pulled from a library.
- **Motion is opt-out-able.** `prefers-reduced-motion` is honoured throughout:
  the opening sequence, the hero point cloud, the headline beam and the Layer
  06 video each have a defined still state, not just a disabled animation.
- **Modules fail independently.** `boot()` starts each module in its own
  `try/catch`, so a fault in one cannot take the rest of the page down with it.
- **It prints.** There is an A4 landscape print stylesheet with a repeating
  title block.

## Known placeholders

These are deliberate and still need real values before launch:

- `assets/og.png` is referenced relatively; Open Graph needs an absolute URL.
- The contact address in the footer is a placeholder.
- Layer 08 metrics read "To be published".
