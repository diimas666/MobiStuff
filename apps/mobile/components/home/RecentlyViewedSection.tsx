import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
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
  const { styles } = useThemedStyles(c => ({
    section: {
      marginBottom: 28,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 16,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: c.textOnDark,
    },
    link: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textOnDarkMuted,
    },
    list: {
      gap: 12,
      paddingRight: 4,
    },
  }));

  if (items.length === 0) {
    return null;
  }

  const preview = items.slice(0, 6);

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Нещодавно переглянуті</Text>
        {onSeeAll ? (
          <Pressable onPress={onSeeAll}>
            <Text style={styles.link}>Дивитись всі</Text>
          </Pressable>
        ) : null}
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {preview.map(product => (
          <RelatedProductCard
            key={product.productId}
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
