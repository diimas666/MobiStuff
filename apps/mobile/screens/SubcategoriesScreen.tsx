import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback } from 'react';
import { Pressable, StatusBar, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { radius, spacing } from '../constants/theme';
import type { CategoriesStackParamList } from '../navigation/types';
import { useThemedStyles } from '../hooks/useThemedStyles';
import {
  getCatalogSubcategories,
  type CatalogSubcategory,
} from '../utils/catalogTree';

type Props = NativeStackScreenProps<CategoriesStackParamList, 'Subcategories'>;

export function SubcategoriesScreen({ route, navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
  },
  headerText: {
    flex: 1,
    paddingTop: 2,
  },
  eyebrow: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textOnDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: c.textOnDark,
    lineHeight: 30,
  },
  allRow: {
    marginHorizontal: spacing.screen,
    marginBottom: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: radius.md,
    backgroundColor: c.homeSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  allTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: c.textOnDark,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textOnDarkMuted,
    marginBottom: 8,
    paddingHorizontal: spacing.screen,
  },
  list: {
    paddingBottom: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingVertical: 14,
    paddingHorizontal: spacing.screen,
  },
  rowTitle: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: c.textOnDark,
    lineHeight: 22,
  },
  separator: {
    height: 1,
    backgroundColor: c.homeSurface,
    marginLeft: spacing.screen,
    marginRight: spacing.screen,
  },
  pressed: {
    opacity: 0.88,
  },
}));

  const { category } = route.params;
  const subcategories = getCatalogSubcategories(category.id);

  const openSubcategory = useCallback(
    (subcategory: CatalogSubcategory) => {
      navigation.navigate('Category', {
        category,
        subcategorySlug: subcategory.slug,
        subcategoryTitle: subcategory.title,
      });
    },
    [category, navigation],
  );

  const openAllProducts = useCallback(() => {
    navigation.navigate('Category', { category });
  }, [category, navigation]);

  const renderItem = useCallback(
    ({ item }: { item: CatalogSubcategory }) => (
      <Pressable
        accessibilityRole="button"
        onPress={() => openSubcategory(item)}
        style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
        <Text style={styles.rowTitle}>{item.title}</Text>
        <Ionicons name="chevron-forward" size={18} color={colors.textOnDarkMuted} />
      </Pressable>
    ),
    [openSubcategory],
  );

  const itemSeparator = useCallback(() => <View style={styles.separator} />, []);

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <View style={styles.headerText}>
          <Text style={styles.eyebrow}>Категорія</Text>
          <Text style={styles.title} numberOfLines={2}>
            {category.title}
          </Text>
        </View>
      </View>

      <Pressable
        accessibilityRole="button"
        onPress={openAllProducts}
        style={({ pressed }) => [styles.allRow, pressed && styles.pressed]}>
        <Text style={styles.allTitle}>Усі товари категорії</Text>
        <Ionicons name="grid-outline" size={18} color={colors.priceLight} />
      </Pressable>

      <FlashList
        data={subcategories}
        keyExtractor={item => item.slug}
        renderItem={renderItem}
        ItemSeparatorComponent={itemSeparator}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <Text style={styles.sectionTitle}>Підкатегорії</Text>
        }
      />
    </Screen>
  );
}

