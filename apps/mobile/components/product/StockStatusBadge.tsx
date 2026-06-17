import { StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  inStock: boolean;
  lowStock?: boolean;
};

export function StockStatusBadge({ inStock, lowStock }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  badge: {
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
    flexShrink: 0,
  },
  inStock: {
    backgroundColor: c.homeSearch,
  },
  inStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.priceLight,
  },
  lowStock: {
    backgroundColor: '#FEF3C7',
  },
  lowStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#B45309',
  },
  outOfStock: {
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  outOfStockText: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textOnDarkMuted,
  },
}));

  if (!inStock) {
    return (
      <View style={[styles.badge, styles.outOfStock]}>
        <Text style={styles.outOfStockText}>Немає в наявності</Text>
      </View>
    );
  }

  if (lowStock) {
    return (
      <View style={[styles.badge, styles.lowStock]}>
        <Text style={styles.lowStockText}>Мало в наявності</Text>
      </View>
    );
  }

  return (
    <View style={[styles.badge, styles.inStock]}>
      <Text style={styles.inStockText}>В наявності</Text>
    </View>
  );
}

