import { useEffect, useState } from 'react';
import { ScrollView, View } from 'react-native';
import { api, baseUrl } from '../../config/api';
import { mapProduct, type ApiProduct, type HomeProduct } from '../../types/catalog';
import { RelatedProductCard } from './RelatedProductCard';
import { SectionHeader } from '../ui/SectionHeader';

type Props = {
  handle: string;
  exclude?: string[];
  title?: string;
  subtitle?: string;
  onProductPress: (p: HomeProduct) => void;
  onAddToCartPress?: (p: HomeProduct) => void;
  isInCart?: (id: string) => boolean;
};

/** «Часто купують разом» — доповнення з сервера (з урахуванням моделі телефону) */
export function CrossSellSection({ handle, exclude = [], title = 'Часто купують разом', subtitle, onProductPress, onAddToCartPress, isInCart }: Props) {
  const [items, setItems] = useState<HomeProduct[]>([]);
  const excludeKey = exclude.join(',');

  useEffect(() => {
    if (!handle) return;
    let alive = true;
    api
      .crossSell(handle, excludeKey)
      .then(r => (r.ok ? r.json() : { items: [] }))
      .then((d: { items?: ApiProduct[] }) => {
        if (!alive) return;
        setItems(
          (d.items ?? []).map(p => {
            const m = mapProduct(p);
            return { ...m, image: m.image?.startsWith('/') ? `${baseUrl}${m.image}` : m.image };
          }),
        );
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [handle, excludeKey]);

  if (!items.length) return null;
  return (
    <View style={{ marginBottom: 28 }}>
      <SectionHeader title={title} subtitle={subtitle} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingRight: 4 }}>
        {items.map(p => (
          <RelatedProductCard
            key={p.id}
            width={150}
            product={p}
            onPress={() => onProductPress(p)}
            onAddToCartPress={onAddToCartPress}
            isInCart={isInCart?.(p.id)}
          />
        ))}
      </ScrollView>
    </View>
  );
}
