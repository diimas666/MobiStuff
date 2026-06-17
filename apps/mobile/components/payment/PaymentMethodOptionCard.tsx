import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { PAYMENT_METHOD_META, type PaymentMethodType } from '../../types/paymentMethods';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  method: PaymentMethodType;
  selected: boolean;
  onPress: () => void;
  hidden?: boolean;
};

export function PaymentMethodOptionCard({
  method,
  selected,
  onPress,
  hidden = false,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 16,
    borderRadius: radius.lg,
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: 'transparent',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardSelected: {
    borderColor: c.primary,
    backgroundColor: '#F0FDF4',
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: c.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapSelected: {
    backgroundColor: 'rgba(45, 184, 75, 0.12)',
  },
  content: {
    flex: 1,
    gap: 4,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  soonBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(245, 158, 11, 0.14)',
  },
  soonBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#D97706',
  },
  description: {
    fontSize: 13,
    color: c.textMuted,
    lineHeight: 18,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: c.primary,
  },
  radioDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: c.primary,
  },
}));

  if (hidden) {
    return null;
  }

  const meta = PAYMENT_METHOD_META[method];
  const iconName = meta.icon as IconName;

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
        <Ionicons
          name={iconName}
          size={22}
          color={selected ? colors.primary : colors.textMuted}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={styles.title}>{meta.title}</Text>
          {!meta.available ? (
            <View style={styles.soonBadge}>
              <Text style={styles.soonBadgeText}>Незабаром</Text>
            </View>
          ) : null}
        </View>
        <Text style={styles.description}>{meta.description}</Text>
      </View>

      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

