import type { AppColorPalette } from './themePalettes';
import { lightColors } from './themePalettes';

export type { AppColorPalette };

export const colors: Record<keyof AppColorPalette, string> = { ...lightColors };

export function applyThemePalette(palette: AppColorPalette): void {
  (Object.keys(palette) as Array<keyof AppColorPalette>).forEach(key => {
    colors[key] = palette[key];
  });
}

export const spacing = {
  screen: 16,
  section: 24,
  item: 12,
};

export const radius = {
  sm: 12,
  md: 16,
  lg: 20,
  pill: 999,
};
