import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';

type Props = {
  onBrowseCatalog: () => void;
  onGoHome: () => void;
};

const perks = [
  { icon: 'heart-outline' as const, label: 'Зберігайте улюблені товари' },
  { icon: 'notifications-outline' as const, label: 'Повертайтесь до них пізніше' },
  { icon: 'cart-outline' as const, label: 'Додавайте в кошик в один дотик' },
];

export function FavoritesEmptyState({ onBrowseCatalog, onGoHome }: Props) {
  return (
    <View style={styles.card}>
      <View style={styles.iconWrap}>
        <View style={styles.iconRingOuter} />
        <View style={styles.iconRingInner} />
        <View style={styles.iconBox}>
          <Ionicons name="heart-outline" size={36} color={colors.danger} />
        </View>
      </View>

      <Text style={styles.title}>Поки нічого в обраному</Text>
      <Text style={styles.text}>
        Натисніть на сердечко біля товару — і він з&apos;явиться тут, щоб ви могли
        швидко повернутися до покупки.
      </Text>

      <View style={styles.perks}>
        {perks.map(perk => (
          <View key={perk.label} style={styles.perk}>
            <Ionicons name={perk.icon} size={16} color={colors.primary} />
            <Text style={styles.perkLabel}>{perk.label}</Text>
          </View>
        ))}
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={onBrowseCatalog}
        style={({ pressed }) => [styles.primaryButton, pressed && styles.pressed]}>
        <Ionicons name="grid-outline" size={18} color={colors.textOnDark} />
        <Text style={styles.primaryButtonText}>Перейти до каталогу</Text>
      </Pressable>

      <Pressable
        accessibilityRole="button"
        onPress={onGoHome}
        style={({ pressed }) => [styles.secondaryButton, pressed && styles.pressed]}>
        <Ionicons name="home-outline" size={16} color={colors.textOnDarkMuted} />
        <Text style={styles.secondaryButtonText}>Переглянути популярне</Text>
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
    borderColor: 'rgba(239, 68, 68, 0.18)',
  },
  iconRingInner: {
    position: 'absolute',
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
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
  perks: {
    width: '100%',
    gap: 10,
    marginTop: 4,
    marginBottom: 8,
  },
  perk: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: colors.homeSurface,
  },
  perkLabel: {
    flex: 1,
    fontSize: 13,
    fontWeight: '500',
    color: colors.textOnDark,
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
    marginTop: 4,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
  },
  secondaryButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
});
