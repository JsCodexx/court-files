# CourtDiary Brand Kit

Tagline: **Your Cases. Organized.**

## Palette
- Forest green `#0F5132` — primary brand color
- Fresh green `#34A853` — accent / “Diary” wordmark
- White `#FFFFFF` — reverse logo and negative space

## Typography
The SVG wordmarks use a modern sans-serif stack (`Inter`, then `Arial`, then sans-serif). If your design tool does not have Inter, install Inter for closest rendering. Wordmark text remains editable SVG text. The emblem is made from native SVG vector geometry and strokes, not a raster image.

## Folders and key files
- `svg/` — scalable logo variations and icon sources (transparent unless explicitly a dark app icon).
- `png/` — large transparent PNG logo exports.
- `favicon/` — `favicon.ico` with standard embedded sizes and `favicon.svg`.
- `app-icons/` — square icon PNGs at 16, 32, 48, 64, 128, 180, 192, 256, 512, and 1024 px, transparent and dark-background variants; includes Apple touch and PWA icons.
- `website-assets/` — horizontal logo exports for website headers and hero placements.
- `social-assets/` — Open Graph social image at 1200×630 in SVG and PNG.
- `brand-board/` — visual brand-board preview.

## SVG variation inventory
- `courtdiary-primary-horizontal.svg` — primary green horizontal logo with tagline; transparent background.
- `courtdiary-stacked.svg` — centered/stacked logo; transparent background.
- `courtdiary-symbol.svg` — standalone emblem; transparent background.
- `courtdiary-white.svg` — white wordmark for dark backgrounds; transparent background.
- `courtdiary-monochrome-dark.svg` — single-color dark logo; transparent background.
- `courtdiary-monochrome-white.svg` — single-color white logo; transparent background.
- `courtdiary-favicon.svg` — compact emblem source; transparent background.
- `courtdiary-app-icon-dark.svg` / `courtdiary-app-icon-light.svg` — square icon sources.

## Integration examples
```html
<link rel="icon" href="/favicon/favicon.ico" sizes="any">
<link rel="icon" href="/favicon/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/app-icons/apple-touch-icon.png">
```

For a PWA manifest, use `/app-icons/icon-192.png` and `/app-icons/icon-512.png`.

## Production note
This is a first-pass production asset kit. PNGs and ICO are exported from the included SVG sources. Always review the mark at 16×16 and on both light and dark surfaces before release; the favicon uses the same core book-and-scales motif with simplified rendering.
