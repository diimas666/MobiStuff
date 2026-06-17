import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  message?: string;
};

export function ErrorState({
  message = 'Не вдалося завантажити дані. Перевірте інтернет і спробуйте ще раз.',
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
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

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Помилка</Text>
      <Text style={styles.message}>{message}</Text>
    </View>
  );
}

