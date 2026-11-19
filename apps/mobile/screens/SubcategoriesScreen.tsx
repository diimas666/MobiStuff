import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { Dimensions, FlatList, Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/navigation/BackButton';
import { ProductImage } from '../components/ProductImage';
import { Screen } from '../components/Screen';
import { spacing } from '../constants/theme';
import type { CategoriesStackParamList } from '../navigation/types';
import type { HomeSubcategory } from '../types/catalog';
import { useThemedStyles } from '../hooks/useThemedStyles';
import { getCatalogSubcategories } from '../utils/catalogTree';
import { pluralGoods } from '../utils/plural';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'Subcategories'>;

const GAP = 10;
const tileWidth = (Dimensions.get('window').width - spacing.screen * 2 - GAP) / 2;

/** Підкатегорії плитками з фото товару — як у меню сайту */
export function SubcategoriesScreen({ route, navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    header: { paddingHorizontal: spacing.screen, paddingBottom: 6 },
    title: { marginTop: 14, fontSize: 32, lineHeight: 37, fontWeight: '700', letterSpacing: -0.8, color: c.text },
    metaRow: { marginTop: 4, marginBottom: 16, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    meta: { fontSize: 15, color: c.ink3 },
    all: { flexDirection: 'row', alignItems: 'center' },
    allText: { fontSize: 16, color: c.primary, fontWeight: '500' },
    list: { paddingHorizontal: spacing.screen, paddingBottom: 32 },
    tile: { width: tileWidth, backgroundColor: c.card, borderRadius: 24, padding: 10, paddingBottom: 14 },
    image: { width: tileWidth - 20, height: tileWidth - 20, borderRadius: 18, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    tileTitle: { marginTop: 10, paddingHorizontal: 4, fontSize: 15, lineHeight: 19, fontWeight: '600', color: c.text },
    tileCount: { marginTop: 2, paddingHorizontal: 4, fontSize: 13, color: c.ink3 },
  }));

  const { category } = route.params;
  // З сервера — з фото і кількістю (порожні вже прибрані); інакше — довідник каталогу
  const subcategories: HomeSubcategory[] = useMemo(
    () => (category.subcategories?.length ? category.subcategories : getCatalogSubcategories(category.id)),
    [category],
  );

  const openSubcategory = useCallback(
    (sub: HomeSubcategory) => navigation.navigate('Category', { category, subcategorySlug: sub.slug, subcategoryTitle: sub.title }),
    [category, navigation],
  );

  return (
    <Screen variant="home" testID="screen-subcategories">
      <FlatList
        data={subcategories}
        keyExtractor={item => item.slug}
        numColumns={2}
        columnWrapperStyle={{ gap: GAP }}
        ItemSeparatorComponent={() => <View style={{ height: GAP }} />}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={{ marginHorizontal: -spacing.screen }}>
            <View style={styles.header}>
              <BackButton onPress={() => navigation.goBack()} />
              <Text style={styles.title}>{category.title}</Text>
              <View style={styles.metaRow}>
                <Text style={styles.meta}>{category.count ? pluralGoods(category.count) : ''}</Text>
                <Pressable testID="subcategories-all-products" onPress={() => navigation.navigate('Category', { category })} hitSlop={8} style={styles.all}>
                  <Text style={styles.allText}>Усі товари</Text>
                  <Ionicons name="chevron-forward" size={17} color={colors.primary} />
                </Pressable>
              </View>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => openSubcategory(item)}
            style={({ pressed }) => [styles.tile, pressed && { transform: [{ scale: 0.98 }] }]}>
            <View style={styles.image}>
              <ProductImage uri={item.image} label={item.title} size={tileWidth - 36} resizeMode="contain" backgroundColor="#FFFFFF" />
            </View>
            <Text style={styles.tileTitle} numberOfLines={2}>
              {item.title}
            </Text>
            {item.count ? <Text style={styles.tileCount}>{pluralGoods(item.count)}</Text> : null}
          </Pressable>
        )}
      />
    </Screen>
  );
}
