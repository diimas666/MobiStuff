import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../ui/SectionHeader';
import { RelatedProductCard } from '../product/RelatedProductCard';
import type { HomeProduct } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  items: HomeProduct[];
  onProductPress?: (product: HomeProduct) => void;
  onFavoritePress?: (product: HomeProduct) => void;
  onAddToCartPress?: (product: HomeProduct) => void;
  isFavorite?: (productId: string) => boolean;
  isInCart?: (productId: string) => boolean;
};

export function PopularProductsSection({
  items,
  onProductPress,
  onFavoritePress,
  onAddToCartPress,
  isFavorite,
  isInCart,
}: Props) {
  const { styles } = useThemedStyles(() => ({
  section: {
    marginBottom: 32,
  },
  list: {
    gap: 10,
    paddingRight: 4,
  },
}));

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <SectionHeader title="Популярне" subtitle="Найчастіше купують цього тижня." />
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

