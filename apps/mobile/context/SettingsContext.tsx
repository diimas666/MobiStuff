import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { applyThemePalette } from '../constants/theme';
import type { AppColorPalette } from '../constants/themePalettes';
import { getPaletteForTheme } from '../constants/themePalettes';
import { loadSettings, saveSettings } from '../services/settingsStorage';
import type { AppSettings } from '../types/settings';
import { DEFAULT_APP_SETTINGS } from '../types/settings';

type SettingsContextValue = {
  settings: AppSettings;
  isHydrated: boolean;
  resolvedTheme: 'light' | 'dark';
  colors: AppColorPalette;
  updateSettings: (patch: Partial<AppSettings>) => Promise<void>;
  resetSettings: () => Promise<void>;
};

const SettingsContext = createContext<SettingsContextValue | null>(null);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_APP_SETTINGS);
  const [isHydrated, setIsHydrated] = useState(false);

  const resolvedTheme = settings.theme;
  const colors = useMemo(() => getPaletteForTheme(resolvedTheme), [resolvedTheme]);

  useLayoutEffect(() => {
    applyThemePalette(colors);
  }, [colors, resolvedTheme]);

  useEffect(() => {
    let isMounted = true;

    loadSettings()
      .then(loaded => {
        if (isMounted) {
          setSettings(loaded);
        }
      })
      .catch(() => {
        if (isMounted) {
          setSettings(DEFAULT_APP_SETTINGS);
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsHydrated(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const updateSettings = useCallback(async (patch: Partial<AppSettings>) => {
    setSettings(current => {
      const next = { ...current, ...patch };
      void saveSettings(next);
      return next;
    });
  }, []);

  const resetSettings = useCallback(async () => {
    setSettings(DEFAULT_APP_SETTINGS);
    await saveSettings(DEFAULT_APP_SETTINGS);
  }, []);

  const value = useMemo(
    () => ({
      settings,
      isHydrated,
      resolvedTheme,
      colors,
      updateSettings,
      resetSettings,
    }),
    [settings, isHydrated, resolvedTheme, colors, updateSettings, resetSettings],
  );

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = useContext(SettingsContext);

  if (!context) {
    throw new Error('useSettings must be used within SettingsProvider');
  }

  return context;
}
