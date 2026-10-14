import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  ThemeMode,
  ThemePalette,
  ThemePreference,
  applyThemePreference,
  readStoredThemePreference,
  themePreferenceId,
} from './themes';

export type { ThemeMode, ThemePalette, ThemePreference };

interface ThemeContextValue {
  palette: ThemePalette;
  mode: ThemeMode;
  preference: ThemePreference;
  setPreference: (preference: ThemePreference) => void;
  setPalette: (palette: ThemePalette) => void;
  setMode: (mode: ThemeMode) => void;
  activeThemeId: string;
}

const ThemeContext = createContext<ThemeContextValue | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [preference, setPreferenceState] = useState<ThemePreference>(
    readStoredThemePreference
  );

  useEffect(() => {
    applyThemePreference(preference);
  }, [preference]);

  const setPreference = useCallback(
    (next: ThemePreference) => setPreferenceState(next),
    []
  );

  const setPalette = useCallback(
    (palette: ThemePalette) =>
      setPreferenceState((prev) => ({ ...prev, palette })),
    []
  );

  const setMode = useCallback(
    (mode: ThemeMode) => setPreferenceState((prev) => ({ ...prev, mode })),
    []
  );

  const value = useMemo(
    () => ({
      palette: preference.palette,
      mode: preference.mode,
      preference,
      setPreference,
      setPalette,
      setMode,
      activeThemeId: themePreferenceId(preference),
    }),
    [preference, setPreference, setPalette, setMode]
  );

  return (
    <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider');
  return ctx;
}
