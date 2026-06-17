import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../constants/theme';
import { useNetwork } from '../context/NetworkContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  onRetry?: () => void;
};

export function OfflineState({ onRetry }: Props) {
  const { refresh } = useNetwork();
  const { styles, colors } = useThemedStyles(c => ({
    container: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: 32,
      gap: 12,
    },
    iconWrap: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.homeSurface,
      marginBottom: 8,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.textOnDark,
      textAlign: 'center',
    },
    message: {
      fontSize: 15,
      color: c.textOnDarkMuted,
      textAlign: 'center',
      lineHeight: 22,
      maxWidth: 300,
    },
    button: {
      marginTop: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
    },
    buttonPressed: {
      opacity: 0.88,
    },
    buttonText: {
      fontSize: 15,
      fontWeight: '600',
      color: c.textOnDark,
    },
  }));

  const handleRetry = () => {
    if (onRetry) {
      onRetry();
      return;
    }

    void refresh();
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconWrap}>
        <Ionicons name="cloud-offline-outline" size={42} color={colors.textOnDarkMuted} />
      </View>
      <Text style={styles.title}>Немає доступу до мережі</Text>
      <Text style={styles.message}>
        Перевірте Wi-Fi або мобільний інтернет. Без з&apos;єднання каталог і оформлення
        замовлення недоступні.
      </Text>
      <Pressable
        accessibilityRole="button"
        onPress={handleRetry}
        style={({ pressed }) => [styles.button, pressed && styles.buttonPressed]}>
        <Text style={styles.buttonText}>Спробувати знову</Text>
      </Pressable>
    </View>
  );
}
