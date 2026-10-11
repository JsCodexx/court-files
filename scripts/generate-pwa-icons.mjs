/**
 * Syncs PWA PNG paths from CourtDiary transparent app-icons (fallback: generate from SVG).
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const iconsDir = path.join(root, 'public', 'icons');
const appIcons = path.join(iconsDir, 'app-icons');

const TRANSPARENT = {
  128: 'courtdiary-icon-128x128-transparent.png',
  180: 'courtdiary-icon-180x180-transparent.png',
  192: 'courtdiary-icon-192x192-transparent.png',
  512: 'courtdiary-icon-512x512-transparent.png',
};

/** [source under app-icons/, dest under icons/ or app-icons/] */
const COPIES = [
  [TRANSPARENT[192], 'app-icons/icon-192.png'],
  [TRANSPARENT[512], 'app-icons/icon-512.png'],
  [TRANSPARENT[192], 'icon-192.png'],
  [TRANSPARENT[512], 'icon-512.png'],
  [TRANSPARENT[512], 'icon-maskable-512.png'],
  [TRANSPARENT[180], 'app-icons/apple-touch-icon.png'],
];

const svgFallback = path.join(iconsDir, 'svg', 'courtdiary-symbol.svg');

function copyIfPresent(relFrom, relTo) {
  const from = path.join(appIcons, relFrom);
  const to = path.join(iconsDir, relTo);
  if (!fs.existsSync(from)) return false;
  fs.mkdirSync(path.dirname(to), { recursive: true });
  fs.copyFileSync(from, to);
  console.log('Copied', path.relative(root, to));
  return true;
}

async function generateFromSvg() {
  let sharp;
  try {
    sharp = (await import('sharp')).default;
  } catch {
    console.warn(
      'sharp not installed — run npm install. Skipping PNG icon generation.'
    );
    return;
  }

  if (!fs.existsSync(svgFallback)) {
    console.error('Missing icon source:', svgFallback);
    process.exit(1);
  }

  const svg = fs.readFileSync(svgFallback);

  for (const size of [192, 512]) {
    const rel = TRANSPARENT[size];
    const outApp = path.join(appIcons, rel);
    const outRoot = path.join(iconsDir, `icon-${size}.png`);
    await sharp(svg).resize(size, size).png().toFile(outApp);
    fs.copyFileSync(outApp, path.join(appIcons, `icon-${size}.png`));
    fs.copyFileSync(outApp, outRoot);
    console.log('Wrote', path.relative(root, outApp));
  }

  const maskable = path.join(iconsDir, 'icon-maskable-512.png');
  await sharp(svg).resize(512, 512).png().toFile(maskable);
  console.log('Wrote', path.relative(root, maskable));
}

async function main() {
  fs.mkdirSync(appIcons, { recursive: true });
  let copied = 0;
  for (const [from, to] of COPIES) {
    if (copyIfPresent(from, to)) copied += 1;
  }
  if (copied < COPIES.length) {
    console.warn(
      'Some transparent app-icons missing — generating remaining PNGs from SVG.'
    );
    await generateFromSvg();
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
