/** CourtDiary brand kit under `public/icons/` — see `public/icons/README.md`. */

const ICONS = '/icons';

export const BRAND_ASSETS = {
  faviconIco: `${ICONS}/favicon/favicon.ico`,
  faviconSvg: `${ICONS}/favicon/favicon.svg`,
  appleTouchIcon: `${ICONS}/app-icons/apple-touch-icon.png`,
  ogImage: `${ICONS}/social-assets/og-image-1200x630.png`,
  pwa192: `${ICONS}/app-icons/icon-192.png`,
  pwa512: `${ICONS}/app-icons/icon-512.png`,
  pwaMaskable512: `${ICONS}/app-icons/courtdiary-icon-512x512-dark.png`,
  pwaIconSvg: `${ICONS}/svg/courtdiary-app-icon-light.svg`,
  webLogoHeader: `${ICONS}/website-assets/web-logo-header.png`,
  webLogoFull: `${ICONS}/website-assets/web-logo-full.png`,
  webLogoWhite: `${ICONS}/website-assets/web-logo-white.png`,
  primaryHorizontalSvg: `${ICONS}/svg/courtdiary-primary-horizontal.svg`,
  stackedSvg: `${ICONS}/svg/courtdiary-stacked.svg`,
  symbolSvg: `${ICONS}/svg/courtdiary-symbol.svg`,
  symbolWhiteSvg: `${ICONS}/svg/courtdiary-monochrome-white.svg`,
  symbolDarkSvg: `${ICONS}/svg/courtdiary-monochrome-dark.svg`,
} as const;

export function brandAssetUrl(path: string): string {
  const base = process.env.PUBLIC_URL ?? '';
  return `${base}${path}`;
}
