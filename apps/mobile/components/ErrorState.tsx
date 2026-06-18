import { Pressable, StyleSheet, Text, View } from 'react-native';
import { OfflineState } from './OfflineState';
import { useNetwork } from '../context/NetworkContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { radius } from '../constants/theme';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Не вдалося завантажити дані. Перевірте інтернет і спробуйте ще раз.',
  onRetry,
}: Props) {
  const { isOffline } = useNetwork();
  const { styles, colors } = useThemedStyles(c => ({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 16,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textOnDark,
    },
    message: {
      fontSize: 14,
      color: c.textOnDarkMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
    retryButton: {
      minHeight: 48,
      paddingHorizontal: 24,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    retryText: {
      fontSize: 15,
      fontWeight: '700',
      color: c.textOnDark,
    },
    pressed: {
      opacity: 0.86,
    },
  }));

  if (isOffline) {
    return <OfflineState onRetry={onRetry} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Помилка</Text>
      <Text style={styles.message}>{message}</Text>
      {onRetry ? (
        <Pressable
          accessibilityRole="button"
          onPress={onRetry}
          style={({ pressed }) => [styles.retryButton, pressed && styles.pressed]}>
          <Text style={styles.retryText}>Спробувати знову</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
