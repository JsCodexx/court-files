/**

 * Syncs root PWA PNG paths from the CourtDiary app-icons kit (fallback: generate from SVG).

 */

import fs from 'fs';

import path from 'path';

import { fileURLToPath } from 'url';



const __dirname = path.dirname(fileURLToPath(import.meta.url));

const root = path.join(__dirname, '..');

const iconsDir = path.join(root, 'public', 'icons');



const COPIES = [

  ['app-icons/icon-192.png', 'icon-192.png'],

  ['app-icons/icon-512.png', 'icon-512.png'],

  ['app-icons/courtdiary-icon-512x512-dark.png', 'icon-maskable-512.png'],

];



const svgFallback = path.join(

  iconsDir,

  'svg',

  'courtdiary-app-icon-light.svg'

);



function copyIfPresent(relFrom, relTo) {

  const from = path.join(iconsDir, relFrom);

  const to = path.join(iconsDir, relTo);

  if (!fs.existsSync(from)) return false;

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



  const svgPath = fs.existsSync(svgFallback)

    ? svgFallback

    : path.join(iconsDir, 'icon.svg');



  if (!fs.existsSync(svgPath)) {

    console.error('Missing icon source:', svgPath);

    process.exit(1);

  }



  const svg = fs.readFileSync(svgPath);

  const themeGreen = '#0F5132';



  for (const size of [192, 512]) {

    const out = path.join(iconsDir, `icon-${size}.png`);

    await sharp(svg).resize(size, size).png().toFile(out);

    console.log('Wrote', path.relative(root, out));

  }



  const maskable = path.join(iconsDir, 'icon-maskable-512.png');

  await sharp(svg)

    .resize(512, 512, { fit: 'contain', background: themeGreen })

    .extend({

      top: 64,

      bottom: 64,

      left: 64,

      right: 64,

      background: themeGreen,

    })

    .png()

    .toFile(maskable);

  console.log('Wrote', path.relative(root, maskable));

}



async function main() {

  fs.mkdirSync(iconsDir, { recursive: true });

  let copied = 0;

  for (const [from, to] of COPIES) {

    if (copyIfPresent(from, to)) copied += 1;

  }

  if (copied < COPIES.length) {

    console.warn(

      'Some app-icons files missing — generating remaining PNGs from SVG.'

    );

    await generateFromSvg();

  }

}



main().catch((err) => {

  console.error(err);

  process.exit(1);

});


