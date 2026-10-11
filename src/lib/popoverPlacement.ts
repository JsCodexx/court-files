const GAP = 4;
const VIEWPORT_PAD = 8;

let cachedSafeTop: number | null = null;
let cachedSafeBottom: number | null = null;

function readSafeInset(side: 'top' | 'bottom'): number {
  if (typeof document === 'undefined' || !document.body) return 0;
  const cache = side === 'top' ? cachedSafeTop : cachedSafeBottom;
  if (cache !== null) return cache;

  const probe = document.createElement('div');
  probe.style.position = 'fixed';
  probe.style.visibility = 'hidden';
  probe.style.pointerEvents = 'none';
  if (side === 'top') {
    probe.style.paddingTop = 'env(safe-area-inset-top)';
  } else {
    probe.style.paddingBottom = 'env(safe-area-inset-bottom)';
  }
  document.body.appendChild(probe);
  const style = getComputedStyle(probe);
  const px =
    side === 'top'
      ? parseFloat(style.paddingTop)
      : parseFloat(style.paddingBottom);
  const value = Number.isFinite(px) ? px : 0;
  probe.remove();
  if (side === 'top') cachedSafeTop = value;
  else cachedSafeBottom = value;
  return value;
}

function safeAreaTop(): number {
  return readSafeInset('top');
}

function safeAreaBottom(): number {
  return readSafeInset('bottom');
}

function tabBarClearance(): number {
  if (typeof document === 'undefined') return 0;
  const raw = getComputedStyle(document.documentElement)
    .getPropertyValue('--app-tab-bar-clearance')
    .trim();
  const n = parseFloat(raw);
  return Number.isFinite(n) ? n : 0;
}

export type PopoverPlacement = {
  top: number;
  left: number;
  width: number;
  maxHeight: number;
  openAbove: boolean;
};

export function computePopoverPlacement(
  trigger: DOMRect,
  opts: {
    width?: number;
    maxHeight?: number;
    preferAbove?: boolean;
    alignEnd?: boolean;
  } = {}
): PopoverPlacement {
  const width = opts.width ?? Math.max(trigger.width, 160);
  const maxHeightCap = opts.maxHeight ?? 224;
  const rtl = document.documentElement.getAttribute('dir') === 'rtl';
  const alignEnd = opts.alignEnd ?? false;

  let left = alignEnd
    ? rtl
      ? trigger.left
      : trigger.right - width
    : trigger.left;
  const maxLeft = window.innerWidth - width - VIEWPORT_PAD;
  left = Math.max(VIEWPORT_PAD, Math.min(left, maxLeft));

  const chromeBottom = tabBarClearance() + safeAreaBottom();
  const chromeTop = safeAreaTop();

  const spaceBelow =
    window.innerHeight - trigger.bottom - GAP - chromeBottom;
  const spaceAbove = trigger.top - GAP - chromeTop;

  let openAbove = Boolean(opts.preferAbove);
  if (!opts.preferAbove && spaceBelow < 120 && spaceAbove > spaceBelow) {
    openAbove = true;
  }

  const maxHeight = Math.max(
    96,
    Math.min(maxHeightCap, openAbove ? spaceAbove : spaceBelow)
  );

  const top = openAbove ? trigger.top - GAP : trigger.bottom + GAP;

  return { top, left, width, maxHeight, openAbove };
}
