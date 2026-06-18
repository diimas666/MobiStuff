import { memo, useCallback, useMemo, useState } from 'react';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import {
  ActivityIndicator,
  Dimensions,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { ErrorState } from '../components/ErrorState';
import { OfflineState } from '../components/OfflineState';
import { LoadingState } from '../components/LoadingState';
import { Screen } from '../components/Screen';
import { CategoryBanner } from '../components/category/CategoryBanner';
import { CategoryFilterBar } from '../components/category/CategoryFilterBar';
import { CategoryFilterSheet } from '../components/category/CategoryFilterSheet';
import { SubcategoryChipBar } from '../components/category/SubcategoryChipBar';
import { RelatedProductCard } from '../components/product/RelatedProductCard';
import { spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { showErrorToast } from '../context/ToastContext';
import { useCategoryProducts } from '../hooks/useCategoryProducts';
import { useNetwork } from '../context/NetworkContext';
import type {
  CategoriesStackParamList,
  RootStackParamList,
} from '../navigation/types';
import {
  mapProduct,
  type ApiProduct,
  type HomeProduct,
} from '../types/catalog';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { countActiveFilters } from '../utils/categoryFilters';
import { getCatalogSubcategories } from '../utils/catalogTree';
import { errorMessages } from '../utils/errors';
import { useThemedStyles } from '../hooks/useThemedStyles';

type CategoryNavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<CategoriesStackParamList, 'Category'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type Props = NativeStackScreenProps<CategoriesStackParamList, 'Category'> & {
  navigation: CategoryNavigationProp;
};

const { width: screenWidth } = Dimensions.get('window');
const GRID_GAP = 12;
const NUM_COLUMNS = 2;
const GRID_CARD_WIDTH =
  (screenWidth - spacing.screen * 2 - GRID_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

const CategoryProductCard = memo(function CategoryProductCard({
  product,
  onPress,
  onFavoritePress,
  onAddToCartPress,
  isFavorite,
  isInCart,
}: {
  product: ApiProduct;
  onPress: (product: HomeProduct) => void;
  onFavoritePress: (product: HomeProduct) => void;
  onAddToCartPress: (product: HomeProduct) => void;
  isFavorite: boolean;
  isInCart: boolean;
}) {
  const homeProduct = mapProduct(product);

  return (
    <RelatedProductCard
      product={homeProduct}
      width={GRID_CARD_WIDTH}
      onPress={() => onPress(homeProduct)}
      onFavoritePress={onFavoritePress}
      onAddToCartPress={onAddToCartPress}
      isFavorite={isFavorite}
      isInCart={isInCart}
    />
  );
});

export function CategoryScreen({ route, navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    list: {
      paddingHorizontal: spacing.screen - GRID_GAP / 2,
      paddingBottom: 32,
    },
    headerBody: {
      paddingHorizontal: GRID_GAP / 2,
    },
    gridItem: {
      flex: 1,
      paddingHorizontal: GRID_GAP / 2,
      marginBottom: GRID_GAP,
    },
    count: {
      fontSize: 14,
      fontWeight: '500',
      color: c.textOnDarkMuted,
      marginBottom: 12,
    },
    listFooter: {
      paddingVertical: 20,
      alignItems: 'center',
    },
    empty: {
      alignItems: 'center',
      paddingVertical: 40,
      paddingHorizontal: 24,
      gap: 8,
    },
    emptyTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.textOnDark,
    },
    emptyText: {
      fontSize: 14,
      color: c.textOnDarkMuted,
      textAlign: 'center',
      lineHeight: 20,
    },
  }));

  const { category, subcategorySlug, subcategoryTitle, onSaleOnly } =
    route.params;
  const catalogSubcategories = useMemo(
    () => getCatalogSubcategories(category.id),
    [category.id],
  );
  const [sheetVisible, setSheetVisible] = useState(false);
  const { isOffline } = useNetwork();
  const { isFavorite, toggleFavorite, items: favoriteItems } = useFavorites();
  const { addToCart, items } = useCart();
  const {
    products,
    displayedProducts,
    totalCount,
    brands,
    subcategoryOptions,
    variantOptions,
    priceBounds,
    filters,
    setFilters,
    isLoading,
    isLoadingMore,
    loadMore,
    error,
    retry,
  } = useCategoryProducts(
    category.id,
    category.title,
    subcategorySlug,
    onSaleOnly,
  );

  const selectedSubcategorySlug = filters.subcategories[0] ?? null;
  const bannerSubtitle = onSaleOnly
    ? subcategoryTitle
      ? `${subcategoryTitle} · Зі знижкою`
      : 'Зі знижкою'
    : subcategoryTitle;
  const categoryWithImage = useMemo(
    () => ({
      ...category,
      image:
        category.image || products[0]?.image || products[0]?.images?.[0],
    }),
    [category, products],
  );

  const handleSubcategorySelect = useCallback(
    (slug: string | null) => {
      setFilters(current => ({
        ...current,
        subcategories: slug ? [slug] : [],
      }));
    },
    [setFilters],
  );

  const openProduct = useCallback(
    (product: HomeProduct) => {
      navigation.navigate('Product', { product });
    },
    [navigation],
  );

  const handleAddToCart = useCallback(
    async (product: HomeProduct) => {
      try {
        await addHomeProductToCart(addToCart, product);
      } catch (addError) {
        showErrorToast(addError, errorMessages.addToCartFailed);
      }
    },
    [addToCart],
  );

  const isProductInCart = useCallback(
    (productId: string) => items.some(item => item.productId === productId),
    [items],
  );

  const renderItem = useCallback(
    ({ item }: { item: ApiProduct }) => (
      <View style={styles.gridItem}>
        <CategoryProductCard
          product={item}
          onPress={openProduct}
          onFavoritePress={product => void toggleFavorite(product)}
          onAddToCartPress={handleAddToCart}
          isFavorite={isFavorite(item._id)}
          isInCart={isProductInCart(item._id)}
        />
      </View>
    ),
    [handleAddToCart, isFavorite, isProductInCart, openProduct, toggleFavorite],
  );

  const listHeader = useCallback(
    () => (
      <>
        <CategoryBanner
          category={categoryWithImage}
          subtitle={bannerSubtitle}
          onBack={() => navigation.goBack()}
        />
        <View style={styles.headerBody}>
          {catalogSubcategories.length > 0 ? (
            <SubcategoryChipBar
              subcategories={catalogSubcategories}
              selectedSlug={selectedSubcategorySlug}
              onSelect={handleSubcategorySelect}
            />
          ) : null}
          <CategoryFilterBar
            activeSort={filters.sort}
            activeFiltersCount={countActiveFilters(filters)}
            onSortChange={sort => setFilters(current => ({ ...current, sort }))}
            onOpenFilters={() => setSheetVisible(true)}
          />
          <Text style={styles.count}>
            {totalCount} {totalCount === 1 ? 'товар' : 'товарів'}
          </Text>
        </View>
      </>
    ),
    [
      catalogSubcategories,
      categoryWithImage,
      filters,
      handleSubcategorySelect,
      navigation,
      selectedSubcategorySlug,
      setFilters,
      subcategoryTitle,
      onSaleOnly,
      bannerSubtitle,
      totalCount,
    ],
  );

  const listFooter = useCallback(() => {
    if (!isLoadingMore) {
      return <View style={styles.listFooter} />;
    }

    return (
      <View style={styles.listFooter}>
        <ActivityIndicator color={colors.priceLight} />
      </View>
    );
  }, [isLoadingMore]);

  const listEmpty = useCallback(
    () => (
      <View style={styles.empty}>
        <Text style={styles.emptyTitle}>Товарів не знайдено</Text>
        <Text style={styles.emptyText}>
          Спробуйте змінити фільтри або обрати іншу категорію
        </Text>
      </View>
    ),
    [],
  );

  const extraData = useMemo(
    () => ({
      filters,
      favoriteCount: favoriteItems.length,
      cartSize: items.length,
    }),
    [favoriteItems.length, filters, items.length],
  );

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />
      {isOffline && displayedProducts.length === 0 ? (
        <OfflineState onRetry={retry} />
      ) : isLoading && displayedProducts.length === 0 ? (
        <LoadingState label="Завантаження товарів..." />
      ) : error && products.length === 0 ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <>
          <FlashList
            testID="screen-category"
            data={displayedProducts}
            numColumns={NUM_COLUMNS}
            keyExtractor={item => item._id}
            renderItem={renderItem}
            extraData={extraData}
            ListHeaderComponent={listHeader}
            ListFooterComponent={listFooter}
            ListEmptyComponent={listEmpty}
            contentContainerStyle={styles.list}
            showsVerticalScrollIndicator={false}
            onEndReached={loadMore}
            onEndReachedThreshold={0.4}
          />

          <CategoryFilterSheet
            visible={sheetVisible}
            filters={filters}
            brands={brands}
            subcategoryOptions={subcategoryOptions}
            variantOptions={variantOptions}
            priceBounds={priceBounds}
            onClose={() => setSheetVisible(false)}
            onApply={setFilters}
          />
        </>
      )}
    </Screen>
  );
}
