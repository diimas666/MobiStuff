import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';

type Props = {
  onBrowseCatalog: () => void;
};

export function ViewedProductsEmptyState({ onBrowseCatalog }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <View style={styles.iconRingOuter} />
        <View style={styles.iconRingInner} />
        <View style={styles.iconBox}>
          <Ionicons name="eye-outline" size={36} color={colors.primary} />
        </View>
      </View>

      <Text style={styles.title}>Переглядів ще немає</Text>
      <Text style={styles.text}>
        Відкривайте товари в каталозі — і вони з&apos;являться тут, згруповані за
        датою перегляду.
      </Text>

      <Pressable
        accessibilityRole="button"
        onPress={onBrowseCatalog}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Ionicons name="grid-outline" size={18} color={colors.textOnDark} />
        <Text style={styles.primaryButtonText}>Перейти до каталогу</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: colors.homeSearch,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12,
  },
  iconWrap: {
    width: 112,
    height: 112,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconRingOuter: {
    position: 'absolute',
    width: 112,
    height: 112,
    borderRadius: 56,
    borderWidth: 1,
    borderColor: 'rgba(45, 184, 75, 0.18)',
  },
  iconRingInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(45, 184, 75, 0.08)',
  },
  iconBox: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: colors.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textOnDark,
    textAlign: 'center',
  },
  text: {
    fontSize: 14,
    color: colors.textOnDarkMuted,
    textAlign: 'center',
    lineHeight: 21,
    maxWidth: 300,
  },
  primaryButton: {
    width: '100%',
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
    marginTop: 8,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
