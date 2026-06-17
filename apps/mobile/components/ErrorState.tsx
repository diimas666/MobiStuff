import { StyleSheet, Text, View } from 'react-native';
import { OfflineState } from './OfflineState';
import { useNetwork } from '../context/NetworkContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  message?: string;
  onRetry?: () => void;
};

export function ErrorState({
  message = 'Не вдалося завантажити дані. Перевірте інтернет і спробуйте ще раз.',
  onRetry,
}: Props) {
  const { isOffline } = useNetwork();
  const { styles } = useThemedStyles(c => ({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 24,
      gap: 8,
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
  }));

  if (isOffline) {
    return <OfflineState onRetry={onRetry} />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Помилка</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}
