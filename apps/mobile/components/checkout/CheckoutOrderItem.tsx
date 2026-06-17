import { StyleSheet, Text, View } from 'react-native';
import { ProductImage } from '../ProductImage';
import { radius } from '../../constants/theme';
import type { CartItem } from '../../types/cart';
import { formatPrice } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const IMAGE_SIZE = 72;

type Props = {
  item: CartItem;
  isLast?: boolean;
};

export function CheckoutOrderItem({ item, isLast = false }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  row: {
    flexDirection: 'row',
    gap: 12,
    paddingBottom: 14,
  },
  rowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
    marginBottom: 14,
  },
  imageWrap: {
    backgroundColor: '#F3F4F6',
    borderRadius: radius.sm,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  content: {
    flex: 1,
    minWidth: 0,
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    lineHeight: 20,
  },
  variant: {
    fontSize: 13,
    color: c.textMuted,
    marginTop: 2,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  qty: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textMuted,
  },
  price: {
    fontSize: 16,
    fontWeight: '700',
    color: c.text,
  },
}));

  const lineTotal = item.price * item.quantity;

  return (
    <View style={[styles.row, !isLast && styles.rowBorder]}>
      <View style={styles.imageWrap}>
        <ProductImage
          uri={item.image}
          label={item.title}
          size={IMAGE_SIZE}
          rounded={radius.sm}
          resizeMode="cover"
        />
      </View>

      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        {item.variant ? <Text style={styles.variant}>{item.variant}</Text> : null}
        <View style={styles.footer}>
          <Text style={styles.qty}>×{item.quantity}</Text>
          <Text style={styles.price}>{formatPrice(lineTotal)}</Text>
        </View>
      </View>
    </View>
  );
}

