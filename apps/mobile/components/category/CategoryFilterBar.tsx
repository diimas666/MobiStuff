import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import type { ProductSort } from '../../types/filters';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const CONTROL_SIZE = 44;
const CONTROL_BORDER = 'rgba(255, 255, 255, 0.2)';

type Props = {
  activeSort: ProductSort;
  activeFiltersCount: number;
  onSortChange: (sort: ProductSort) => void;
  onOpenFilters: () => void;
};

function isDateSort(sort: ProductSort) {
  return sort === 'newest' || sort === 'oldest';
}

function isPriceSort(sort: ProductSort) {
  return sort === 'price_asc' || sort === 'price_desc';
}

export function CategoryFilterBar({
  activeSort,
  activeFiltersCount,
  onSortChange,
  onOpenFilters,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
  },
  control: {
    minWidth: CONTROL_SIZE,
    height: CONTROL_SIZE,
    borderRadius: radius.md,
    backgroundColor: c.homeSurface,
    borderWidth: 1,
    borderColor: CONTROL_BORDER,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  controlActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  pressed: {
    opacity: 0.85,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textOnDark,
  },
  toggles: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 'auto',
  },
  controlText: {
    fontSize: 13,
    fontWeight: '500',
    color: c.textOnDarkMuted,
  },
  controlTextActive: {
    color: c.textOnDark,
    fontWeight: '600',
  },
}));

  const dateActive = isDateSort(activeSort);
  const priceActive = isPriceSort(activeSort);

  const dateLabel =
    activeSort === 'oldest' ? 'Спочатку старі' : 'Спочатку нові';

  const priceLabel = activeSort === 'price_desc' ? 'Ціна ↓' : 'Ціна ↑';

  const toggleDateSort = () => {
    onSortChange(activeSort === 'newest' ? 'oldest' : 'newest');
  };

  const togglePriceSort = () => {
    onSortChange(activeSort === 'price_desc' ? 'price_asc' : 'price_desc');
  };

  return (
    <View style={styles.bar}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Відкрити фільтри"
        testID="category-open-filters"
        onPress={onOpenFilters}
        style={({ pressed }) => [styles.control, pressed && styles.pressed]}>
        <Ionicons name="options-outline" size={20} color={colors.textOnDark} />
        {activeFiltersCount > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{activeFiltersCount}</Text>
          </View>
        ) : null}
      </Pressable>

      <View style={styles.toggles}>
        <Pressable
          onPress={toggleDateSort}
          style={[styles.control, dateActive && styles.controlActive]}>
          <Text
            style={[styles.controlText, dateActive && styles.controlTextActive]}
            numberOfLines={1}>
            {dateLabel}
          </Text>
        </Pressable>

        <Pressable
          onPress={togglePriceSort}
          style={[styles.control, priceActive && styles.controlActive]}>
          <Text
            style={[styles.controlText, priceActive && styles.controlTextActive]}
            numberOfLines={1}>
            {priceLabel}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

