import { useLayoutEffect, type ReactNode } from 'react';
import { useSettings } from '../context/SettingsContext';
import { applyThemePalette } from '../constants/theme';

export function ThemeApplier({ children }: { children: ReactNode }) {
  const { colors, resolvedTheme } = useSettings();

  useLayoutEffect(() => {
    applyThemePalette(colors);
  }, [colors, resolvedTheme]);

  return children;
}
