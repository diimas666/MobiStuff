import { useMemo } from 'react';
import {
  StyleSheet,
  type ImageStyle,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import type { AppColorPalette } from '../constants/themePalettes';
import { useSettings } from '../context/SettingsContext';

type NamedStyles<T> = { [P in keyof T]: ViewStyle | TextStyle | ImageStyle };

export function useThemedStyles<T extends NamedStyles<T>>(
  factory: (colors: AppColorPalette) => T,
): { styles: T; colors: AppColorPalette } {
  const { colors } = useSettings();
  const styles = useMemo(() => StyleSheet.create(factory(colors)), [colors]);
  return { styles, colors };
}
