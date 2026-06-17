import { ScrollView, StyleSheet, Text, View } from 'react-native';
import type { HomeProduct } from '../../types/catalog';
import { RelatedProductCard } from './RelatedProductCard';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  items: HomeProduct[];
  onProductPress?: (product: HomeProduct) => void;
  onFavoritePress?: (product: HomeProduct) => void;
  onAddToCartPress?: (product: HomeProduct) => void;
  isFavorite?: (productId: string) => boolean;
  isInCart?: (productId: string) => boolean;
};

export function RelatedProductsSection({
  items,
  onProductPress,
  onFavoritePress,
  onAddToCartPress,
  isFavorite,
  isInCart,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  section: {
    marginTop: 8,
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: c.textOnDark,
    marginBottom: 16,
  },
  list: {
    gap: 12,
    paddingRight: 4,
  },
}));

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <Text style={styles.title}>Рекомендовані товари</Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {items.map(product => (
          <RelatedProductCard
            key={product.id}
            product={product}
            onPress={() => onProductPress?.(product)}
            onFavoritePress={onFavoritePress}
            onAddToCartPress={onAddToCartPress}
            isFavorite={isFavorite?.(product.id)}
            isInCart={isInCart?.(product.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}

