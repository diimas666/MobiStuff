import { Pressable, ScrollView, Text, View } from 'react-native';
import { ProductImage } from '../ProductImage';
import type { HomeCategory } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { SectionHeader } from '../ui/SectionHeader';

type Props = {
  items: HomeCategory[];
  onSeeAll?: () => void;
  onCategoryPress?: (category: HomeCategory) => void;
};

/** Категорії — фото товару на білій плитці, як у меню сайту */
export function CategoriesSection({ items, onSeeAll, onCategoryPress }: Props) {
  const { styles } = useThemedStyles(c => ({
    section: { marginBottom: 32 },
    list: { gap: 10, paddingRight: 4 },
    card: { width: 96 },
    imageBox: { width: 96, height: 96, borderRadius: 22, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    label: { marginTop: 8, fontSize: 13, lineHeight: 17, fontWeight: '500', color: c.text, textAlign: 'center' },
  }));

  if (items.length === 0) return null;

  return (
    <View style={styles.section}>
      <SectionHeader title="Категорії" onAction={onSeeAll} />
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.list}>
        {items.map(category => (
          <Pressable
            key={category.id}
            accessibilityRole="button"
            accessibilityLabel={category.title}
            style={({ pressed }) => [styles.card, pressed && { opacity: 0.75 }]}
            onPress={() => onCategoryPress?.(category)}>
            <View style={styles.imageBox}>
              <ProductImage uri={category.image} label={category.title} size={80} resizeMode="contain" backgroundColor="#FFFFFF" />
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {category.title}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
