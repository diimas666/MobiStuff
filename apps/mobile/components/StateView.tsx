import type { ComponentProps } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
  testID?: string;
};

/** Повноекранний стан (немає мережі, не знайдено, помилка) — у стилі сайту */
export function StateView({ icon, title, message, actionLabel, onAction, secondaryLabel, onSecondary, testID }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    container: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingBottom: 40 },
    iconWrap: { width: 104, height: 104, borderRadius: 52, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center', marginBottom: 22 },
    title: { fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: c.text, textAlign: 'center' },
    message: { marginTop: 8, fontSize: 16, lineHeight: 23, color: c.textOnDarkMuted, textAlign: 'center', maxWidth: 320 },
    button: { marginTop: 26, height: 52, minWidth: 220, paddingHorizontal: 28, borderRadius: 26, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    buttonText: { fontSize: 17, fontWeight: '600', color: c.onPrimary },
    secondary: { marginTop: 16, fontSize: 16, fontWeight: '500', color: c.primary },
  }));
  return (
    <View style={styles.container} testID={testID}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={46} color={colors.ink3} />
      </View>
      <Text style={styles.title} accessibilityRole="header">
        {title}
      </Text>
      <Text style={styles.message}>{message}</Text>
      {/* Якщо основної дії немає — додаткова стає головною кнопкою */}
      {!onAction && onSecondary && secondaryLabel ? (
        <Pressable accessibilityRole="button" onPress={onSecondary} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          <Text style={styles.buttonText}>{secondaryLabel}</Text>
        </Pressable>
      ) : null}
      {onAction && actionLabel ? (
        <Pressable accessibilityRole="button" onPress={onAction} style={({ pressed }) => [styles.button, pressed && { opacity: 0.85 }]}>
          <Text style={styles.buttonText}>{actionLabel}</Text>
        </Pressable>
      ) : null}
      {onAction && onSecondary && secondaryLabel ? (
        <Text accessibilityRole="button" onPress={onSecondary} style={styles.secondary}>
          {secondaryLabel}
        </Text>
      ) : null}
    </View>
  );
}
