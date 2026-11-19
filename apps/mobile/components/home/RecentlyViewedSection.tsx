import { ScrollView, View } from 'react-native';
import { SectionHeader } from '../ui/SectionHeader';
import { RelatedProductCard } from '../product/RelatedProductCard';
import type { HomeProduct } from '../../types/catalog';
import type { ViewedProductItem } from '../../types/viewedProducts';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  items: ViewedProductItem[];
  onProductPress?: (product: HomeProduct) => void;
  onSeeAll?: () => void;
};

export function RecentlyViewedSection({ items, onProductPress, onSeeAll }: Props) {
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

  const preview = items.slice(0, 6);

  return (
    <View style={styles.section}>
      <SectionHeader title="Ви переглядали" onAction={onSeeAll} />

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {preview.map(product => (
          <RelatedProductCard
            key={product.productId}
            width={140}
            product={{
              id: product.productId,
              handle: product.handle,
              title: product.title,
              price: product.price,
              image: product.image,
            }}
            onPress={() =>
              onProductPress?.({
                id: product.productId,
                handle: product.handle,
                title: product.title,
                price: product.price,
                image: product.image,
              })
            }
          />
        ))}
      </ScrollView>
    </View>
  );
}
