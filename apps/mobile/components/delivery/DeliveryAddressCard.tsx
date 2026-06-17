import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { formatDeliveryAddressLine, type DeliveryAddress } from '../../types/deliveryAddress';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  address: DeliveryAddress;
  selected?: boolean;
  onSelect?: () => void;
  onDelete?: () => void;
};

export function DeliveryAddressCard({
  address,
  selected = false,
  onSelect,
  onDelete,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  card: {
    backgroundColor: c.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 12,
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
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
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
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
  defaultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: radius.pill,
    backgroundColor: 'rgba(45, 184, 75, 0.12)',
  },
  defaultBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.primaryDark,
  },
  line: {
    fontSize: 14,
    color: c.textMuted,
    lineHeight: 20,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
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
  footer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  deleteButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 4,
    paddingHorizontal: 2,
  },
  deleteText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.danger,
  },
}));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onSelect}
      style={({ pressed }) => [
        styles.card,
        selected && styles.cardSelected,
        pressed && styles.pressed,
      ]}>
      <View style={styles.row}>
        <View style={[styles.iconWrap, selected && styles.iconWrapSelected]}>
          <Ionicons
            name="location-outline"
            size={20}
            color={selected ? colors.primary : colors.textMuted}
          />
        </View>

        <View style={styles.content}>
          <View style={styles.titleRow}>
            <Text style={styles.label}>{address.label}</Text>
            {address.isDefault ? (
              <View style={styles.defaultBadge}>
                <Text style={styles.defaultBadgeText}>Основна</Text>
              </View>
            ) : null}
          </View>
          <Text style={styles.line}>{formatDeliveryAddressLine(address)}</Text>
        </View>

        <View style={[styles.radio, selected && styles.radioSelected]}>
          {selected ? <View style={styles.radioDot} /> : null}
        </View>
      </View>

      {onDelete ? (
        <View style={styles.footer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Видалити адресу"
            onPress={onDelete}
            style={({ pressed }) => [styles.deleteButton, pressed && styles.pressed]}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
            <Text style={styles.deleteText}>Видалити</Text>
          </Pressable>
        </View>
      ) : null}
    </Pressable>
  );
}

