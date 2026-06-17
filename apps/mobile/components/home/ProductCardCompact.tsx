import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { radius } from '../../constants/theme';
import { formatPrice, type HomeProduct } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const CARD_WIDTH = 156;

type Props = {
  product: HomeProduct;
  onFavoritePress?: (product: HomeProduct) => void;
  onPress?: () => void;
};

export function ProductCardCompact({ product, onFavoritePress, onPress }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  card: {
    width: CARD_WIDTH,
    backgroundColor: c.card,
    borderRadius: radius.lg,
    padding: 10,
  },
  pressed: {
    opacity: 0.92,
    transform: [{ scale: 0.98 }],
  },
  imageWrap: {
    position: 'relative',
    marginBottom: 10,
  },
  favoriteButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    padding: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '600',
    color: c.text,
    lineHeight: 18,
    minHeight: 36,
    marginBottom: 6,
  },
  price: {
    fontSize: 15,
    fontWeight: '700',
    color: c.price,
  },
}));

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={styles.imageWrap}>
        <ProductImage uri={product.image} label={product.title} size={132} rounded={radius.md} />
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Додати в обране"
          onPress={() => onFavoritePress?.(product)}
          style={styles.favoriteButton}>
          <Ionicons name="heart-outline" size={18} color={colors.textMuted} />
        </Pressable>
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>
      <Text style={styles.price}>{formatPrice(product.price)}</Text>
    </Pressable>
  );
}

export const productCardCompactWidth = CARD_WIDTH;

