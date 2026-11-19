import { Pressable, Text, View, type StyleProp, type ViewStyle } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { formatPrice, type HomeProduct } from '../../types/catalog';

const DEFAULT_CARD_WIDTH = 164;

type Props = {
  product: HomeProduct;
  width?: number;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  onFavoritePress?: (product: HomeProduct) => void;
  onAddToCartPress?: (product: HomeProduct) => void;
  isFavorite?: boolean;
  isInCart?: boolean;
};

/** Картка товару як на сайті: біле фото, назва, ціна і кнопка «+» */
export function RelatedProductCard({
  product,
  width = DEFAULT_CARD_WIDTH,
  style,
  onPress,
  onFavoritePress,
  onAddToCartPress,
  isFavorite = false,
  isInCart = false,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    card: { borderRadius: 22, backgroundColor: c.card, padding: 10, paddingBottom: 12 },
    imageWrap: { borderRadius: 16, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    favorite: {
      position: 'absolute',
      top: 6,
      right: 6,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: 'rgba(255,255,255,0.92)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    sale: {
      position: 'absolute',
      top: 8,
      left: 8,
      paddingHorizontal: 7,
      paddingVertical: 3,
      borderRadius: 8,
      backgroundColor: c.sale,
    },
    saleText: { fontSize: 11, fontWeight: '700', color: '#fff' },
    title: { marginTop: 10, paddingHorizontal: 2, fontSize: 14, lineHeight: 19, minHeight: 38, color: c.text },
    footer: { marginTop: 8, paddingHorizontal: 2, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
    price: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, color: c.price },
    oldPrice: { fontSize: 12, color: c.ink3, textDecorationLine: 'line-through' },
    add: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center' },
  }));
  const imageSize = width - 20;
  const oldPrice = product.oldPrice && product.oldPrice > product.price ? product.oldPrice : undefined;
  const discount = oldPrice ? Math.round((1 - product.price / oldPrice) * 100) : 0;

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`${product.title}, ${formatPrice(product.price)}`}
      onPress={onPress}
      style={({ pressed }) => [styles.card, { width }, pressed && { transform: [{ scale: 0.98 }] }, style]}>
      <View style={[styles.imageWrap, { height: imageSize }]}>
        <ProductImage uri={product.image} label={product.title} size={imageSize - 16} resizeMode="contain" backgroundColor="#FFFFFF" />
        {discount > 0 ? (
          <View style={styles.sale}>
            <Text style={styles.saleText}>−{discount}%</Text>
          </View>
        ) : null}
        {onFavoritePress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isFavorite ? 'Видалити з обраного' : 'Додати в обране'}
            onPress={() => onFavoritePress(product)}
            hitSlop={8}
            style={({ pressed }) => [styles.favorite, pressed && { transform: [{ scale: 0.9 }] }]}>
            <Ionicons name={isFavorite ? 'heart' : 'heart-outline'} size={18} color={isFavorite ? colors.sale : '#1D1D1F'} />
          </Pressable>
        ) : null}
      </View>

      <Text style={styles.title} numberOfLines={2}>
        {product.title}
      </Text>

      <View style={styles.footer}>
        <View style={{ flex: 1 }}>
          {oldPrice ? <Text style={styles.oldPrice}>{formatPrice(oldPrice)}</Text> : null}
          <Text style={[styles.price, oldPrice ? { color: colors.sale } : null]}>{formatPrice(product.price)}</Text>
        </View>
        {onAddToCartPress ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={isInCart ? 'Товар у кошику' : 'Додати в кошик'}
            onPress={() => onAddToCartPress(product)}
            hitSlop={8}
            style={({ pressed }) => [
              styles.add,
              { backgroundColor: isInCart ? colors.accentSoft : colors.primary },
              pressed && { transform: [{ scale: 0.92 }] },
            ]}>
            <Ionicons name={isInCart ? 'checkmark' : 'add'} size={22} color={isInCart ? colors.primary : colors.onPrimary} />
          </Pressable>
        ) : null}
      </View>
    </Pressable>
  );
}

export const relatedProductCardWidth = DEFAULT_CARD_WIDTH;
