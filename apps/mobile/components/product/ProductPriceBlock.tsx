import { StyleSheet, Text, View } from 'react-native';
import { formatPrice } from '../../types/catalog';
import { StockStatusBadge } from './StockStatusBadge';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useSettings } from '../../context/SettingsContext';

type Props = {
  price: number;
  oldPrice?: number;
  discountPercent?: number;
  inStock: boolean;
  lowStock?: boolean;
};

export function ProductPriceBlock({
  price,
  oldPrice,
  discountPercent,
  inStock,
  lowStock,
}: Props) {
  const { settings } = useSettings();
  const showDiscount = settings.showDiscountPrices;

  const { styles, colors } = useThemedStyles(c => ({
  block: {
    marginBottom: 20,
  },
  discountBadge: {
    backgroundColor: c.sale,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  discountBadgeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  prices: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 10,
    flex: 1,
  },
  price: {
    fontSize: 30,
    fontWeight: '700',
    letterSpacing: -0.6,
    color: c.text,
  },
  priceSale: {
    color: c.sale,
  },
  oldPrice: {
    fontSize: 17,
    color: c.ink3,
    textDecorationLine: 'line-through',
  },
}));

  const hasDiscount = showDiscount && oldPrice != null && oldPrice > price;
  const percent =
    showDiscount && discountPercent != null
      ? discountPercent
      : showDiscount && hasDiscount && oldPrice != null
        ? Math.round((1 - price / oldPrice) * 100)
        : undefined;

  return (
    <View style={styles.block}>
      {showDiscount && percent && percent > 0 ? (
        <View style={styles.discountBadge}>
          <Text style={styles.discountBadgeText}>-{percent}%</Text>
        </View>
      ) : null}

      <View style={styles.row}>
        <View style={styles.prices}>
          {hasDiscount ? (
            <Text style={styles.oldPrice}>{formatPrice(oldPrice)}</Text>
          ) : null}
          <Text style={styles.price}>{formatPrice(price)}</Text>
        </View>

        <StockStatusBadge inStock={inStock} lowStock={lowStock} />
      </View>
    </View>
  );
}

