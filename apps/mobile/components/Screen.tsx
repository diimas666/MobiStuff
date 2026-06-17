import type { ReactNode } from 'react';
import { useMemo } from 'react';
import { StyleSheet, useWindowDimensions, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';
import { ScreenBackground } from './ScreenBackground';

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  backgroundColor?: string;
  variant?: 'home' | 'default';
};

/** Базовая оболочка экрана: safe area сверху + фон. Паддинги — внутри экрана (ScrollView). */
export function Screen({
  children,
  style,
  backgroundColor,
  variant = 'default',
}: Props) {
  const { colors } = useSettings();
  const { width, height } = useWindowDimensions();
  const usePatternBackground = variant === 'home' && !backgroundColor;
  const resolvedBackground =
    backgroundColor ?? (variant === 'home' ? 'transparent' : colors.screen);

  const background = useMemo(() => {
    if (!usePatternBackground) {
      return null;
    }

    return <ScreenBackground colors={colors} width={width} height={height} />;
  }, [colors, height, usePatternBackground, width]);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: resolvedBackground }, style]}>
      {background}
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
