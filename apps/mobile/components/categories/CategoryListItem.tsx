import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import type { HomeCategory } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { pluralGoods } from '../../utils/plural';

type Props = {
  category: HomeCategory;
  onPress?: (category: HomeCategory) => void;
  isFirst?: boolean;
  isLast?: boolean;
};

/** Рядок категорії: фото товару, назва, кількість — у спільній білій групі */
export const CategoryListItem = memo(function CategoryListItem({ category, onPress, isFirst, isLast }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    row: { marginHorizontal: 16, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingLeft: 10, paddingRight: 14, gap: 14 },
    first: { borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingTop: 12 },
    last: { borderBottomLeftRadius: 24, borderBottomRightRadius: 24, paddingBottom: 12 },
    thumb: { width: 58, height: 58, borderRadius: 15, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    textBlock: { flex: 1 },
    title: { fontSize: 17, fontWeight: '500', letterSpacing: -0.2, color: c.text },
    count: { marginTop: 1, fontSize: 13, color: c.ink3 },
    divider: { position: 'absolute', left: 82, right: 0, bottom: 0, height: 0.5, backgroundColor: c.line },
  }));
  return (
    <Pressable
      onPress={() => onPress?.(category)}
      accessibilityRole="button"
      accessibilityLabel={category.title}
      style={({ pressed }) => [styles.row, isFirst && styles.first, isLast && styles.last, pressed && { backgroundColor: colors.fill }]}>
      <View style={styles.thumb}>
        <ProductImage uri={category.image} label={category.title} size={52} resizeMode="contain" backgroundColor="#FFFFFF" />
      </View>
      <View style={styles.textBlock}>
        <Text style={styles.title} numberOfLines={1}>
          {category.title}
        </Text>
        {category.count ? <Text style={styles.count}>{pluralGoods(category.count)}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color={colors.ink3} />
      {!isLast ? <View style={styles.divider} /> : null}
    </Pressable>
  );
});
