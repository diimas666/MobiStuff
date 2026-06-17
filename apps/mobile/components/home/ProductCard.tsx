import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { radius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { formatPrice, type HomeProduct } from '../../types/catalog';

type Props = {
  product: HomeProduct;
  onFavoritePress?: (product: HomeProduct) => void;
};

export function ProductCard({ product, onFavoritePress }: Props) {
  const { colors } = useSettings();

  return (
    <View style={[styles.card, { backgroundColor: colors.card }]}>
      <ProductImage uri={product.image} label={product.title} size={72} />

      <View style={styles.info}>
        <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
          {product.title}
        </Text>
        <Text style={[styles.price, { color: colors.price }]}>{formatPrice(product.price)}</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Додати в обране"
        onPress={() => onFavoritePress?.(product)}
        style={styles.favoriteButton}>
        <Ionicons name="heart-outline" size={20} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: radius.lg,
    padding: 12,
    marginBottom: 12,
    gap: 12,
  },
  info: {
    flex: 1,
    paddingRight: 8,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
    lineHeight: 20,
  },
  price: {
    fontSize: 17,
    fontWeight: '700',
  },
  favoriteButton: {
    alignSelf: 'flex-start',
    padding: 4,
  },
});
