import type { ReactNode } from 'react';
import { StyleSheet, type StyleProp, type ViewStyle } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSettings } from '../context/SettingsContext';

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
  const resolvedBackground =
    backgroundColor ?? (variant === 'home' ? colors.homeBackground : colors.screen);

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.screen, { backgroundColor: resolvedBackground }, style]}>
      {children}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
  },
});
