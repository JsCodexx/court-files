export type ThemePalette = 'forest' | 'ocean';
export type ThemeMode = 'light' | 'dark';

export type ThemePreference = {
  palette: ThemePalette;
  mode: ThemeMode;
};

export const THEME_STORAGE_KEY = 'cf_theme_v2';
const LEGACY_THEME_KEY = 'cf_theme';

export const THEME_PALETTES: ThemePalette[] = ['forest', 'ocean'];
export const THEME_MODES: ThemeMode[] = ['light', 'dark'];

/** Mini UI swatch colors — keep aligned with `styles/theme.css`. */
export type ThemePreviewColors = {
  canvas: string;
  sidebar: string;
  card: string;
  header: string;
  accent: string;
  border: string;
};

const hsl = (h: number, s: number, l: number) => `hsl(${h} ${s}% ${l}%)`;

export const THEME_PREVIEW_COLORS: Record<string, ThemePreviewColors> = {
  'forest-light': {
    canvas: hsl(45, 29, 98),
    sidebar: hsl(152, 52, 11),
    card: hsl(0, 0, 100),
    header: hsl(152, 69, 19),
    accent: hsl(135, 53, 43),
    border: hsl(45, 12, 88),
  },
  'forest-dark': {
    canvas: hsl(155, 28, 7),
    sidebar: hsl(160, 36, 5),
    card: hsl(155, 24, 10),
    header: hsl(152, 58, 52),
    accent: hsl(135, 53, 48),
    border: hsl(152, 16, 20),
  },
  'ocean-light': {
    canvas: hsl(210, 55, 98),
    sidebar: hsl(214, 58, 18),
    card: hsl(0, 0, 100),
    header: hsl(211, 78, 36),
    accent: hsl(199, 89, 48),
    border: hsl(210, 32, 88),
  },
  'ocean-dark': {
    canvas: hsl(214, 42, 8),
    sidebar: hsl(214, 48, 6),
    card: hsl(214, 38, 11),
    header: hsl(205, 85, 55),
    accent: hsl(199, 89, 52),
    border: hsl(214, 26, 22),
  },
};

export function themePreferenceId(p: ThemePreference): string {
  return `${p.palette}-${p.mode}`;
}

export function parseThemePreferenceId(id: string): ThemePreference | null {
  const [palette, mode] = id.split('-') as [ThemePalette?, ThemeMode?];
  if (
    (palette === 'forest' || palette === 'ocean') &&
    (mode === 'light' || mode === 'dark')
  ) {
    return { palette, mode };
  }
  return null;
}

export function readStoredThemePreference(): ThemePreference {
  const stored = localStorage.getItem(THEME_STORAGE_KEY);
  if (stored) {
    const parsed = parseThemePreferenceId(stored);
    if (parsed) return parsed;
  }

  const legacy = localStorage.getItem(LEGACY_THEME_KEY);
  if (legacy === 'dark') return { palette: 'forest', mode: 'dark' };
  if (legacy === 'ocean') return { palette: 'ocean', mode: 'light' };
  if (legacy === 'light') return { palette: 'forest', mode: 'light' };

  if (window.matchMedia?.('(prefers-color-scheme: dark)').matches) {
    return { palette: 'forest', mode: 'dark' };
  }
  return { palette: 'forest', mode: 'light' };
}

const META_COLORS: Record<string, string> = {
  'forest-light': '#0F5132',
  'forest-dark': '#0B1411',
  'ocean-light': '#1E6BB8',
  'ocean-dark': '#0A1628',
};

export function applyThemePreference(preference: ThemePreference) {
  const root = document.documentElement;
  root.classList.toggle('theme-ocean', preference.palette === 'ocean');
  root.classList.toggle('dark', preference.mode === 'dark');
  root.style.colorScheme = preference.mode === 'dark' ? 'dark' : 'light';
  localStorage.setItem(THEME_STORAGE_KEY, themePreferenceId(preference));

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute(
      'content',
      META_COLORS[themePreferenceId(preference)] ?? META_COLORS['forest-light']
    );
  }
}

/** Inline bootstrap in public/index.html — keep in sync. */
export function bootstrapThemeClassesFromStorage() {
  applyThemePreference(readStoredThemePreference());
}
