import { useCallback, useMemo } from 'react';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { CompositeNavigationProp } from '@react-navigation/native';
import { ScrollView, StyleSheet } from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { ErrorState } from '../components/ErrorState';
import { OfflineState } from '../components/OfflineState';
import { Screen } from '../components/Screen';
import { BrandsSection } from '../components/home/BrandsSection';
import { CategoriesSection } from '../components/home/CategoriesSection';
import { HomeHeader } from '../components/home/HomeHeader';
import { HomeSearchBar } from '../components/home/HomeSearchBar';
import { PopularProductsSection } from '../components/home/PopularProductsSection';
import { RecentlyViewedSection } from '../components/home/RecentlyViewedSection';
import { TrendingSlider } from '../components/home/TrendingSlider';
import { PromoBannerCarousel } from '../components/home/PromoBannerCarousel';
import { spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useViewedProducts } from '../context/ViewedProductsContext';
import { showErrorToast } from '../context/ToastContext';
import { useBrands } from '../hooks/useBrands';
import { useHomeData } from '../hooks/useHomeData';
import { usePromotions } from '../hooks/usePromotions';
import { openPromoCategory } from '../navigation/categoriesTabListeners';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { BrandItem } from '../types/brand';
import type { HomeProduct } from '../types/catalog';
import type { PromoBanner } from '../types/promotion';
import { useSettings } from '../context/SettingsContext';
import { useNetwork } from '../context/NetworkContext';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { errorMessages } from '../utils/errors';

type HomeNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

export function HomeScreen() {
  const { settings } = useSettings();
  const { isOffline } = useNetwork();
  const navigation = useNavigation<HomeNavigationProp>();
  const { categories, trending, popular, isLoading, error, retry } = useHomeData();
  const { items: brands, isLoading: isBrandsLoading } = useBrands();
  const { promotions } = usePromotions(settings.promoNotifications);
  const { items: viewedProducts } = useViewedProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, items } = useCart();

  const openProduct = (product: HomeProduct) => {
    navigation.navigate('Product', { product });
  };

  const handlePromoPress = useCallback(
    (banner: PromoBanner) => {
      const matchedCategory = categories.find(
        category =>
          category.id === banner.categorySlug ||
          category.title === banner.categoryTitle,
      );

      openPromoCategory(navigation, {
        category: matchedCategory ?? {
          id: banner.categorySlug,
          title: banner.categoryTitle,
        },
        subcategorySlug: banner.subcategorySlug,
        subcategoryTitle: banner.subcategoryTitle,
        onSaleOnly: banner.linkType === 'on_sale',
      });
    },
    [navigation, categories],
  );

  const promoBanners = useMemo(
    () =>
      promotions.map(promotion => ({
        ...promotion,
        imageUrl:
          promotion.imageUrl ||
          categories.find(category => category.id === promotion.categorySlug)?.image,
      })),
    [promotions, categories],
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

  const openBrand = useCallback(
    (brand: BrandItem) => {
      navigation.navigate('Brand', { brand });
    },
    [navigation],
  );

  const openViewedProducts = useCallback(() => {
    navigation.navigate('Profile', { screen: 'ViewedProducts' });
  }, [navigation]);

  const isProductInCart = useCallback(
    (productId: string) => items.some(item => item.productId === productId),
    [items],
  );

  const hasData =
    categories.length > 0 || trending.length > 0 || popular.length > 0;

  return (
    <Screen variant="home">
      {isOffline && !hasData ? (
        <OfflineState onRetry={retry} />
      ) : isLoading && !hasData ? (
        <LoadingState />
      ) : error && !hasData ? (
        <ErrorState message={error} onRetry={retry} />
      ) : (
        <ScrollView
          testID="screen-home"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}
        >
          <HomeHeader onCartPress={() => navigation.navigate('Cart')} />
          <HomeSearchBar onProductPress={openProduct} />
          <TrendingSlider items={trending} onProductPress={openProduct} />
          <PromoBannerCarousel
            items={promoBanners}
            visible={settings.promoNotifications}
            onBannerPress={handlePromoPress}
          />
          <CategoriesSection
            items={categories}
            onSeeAll={() => navigation.navigate('Categories')}
            onCategoryPress={category =>
              navigation.navigate('Categories', {
                screen: 'Category',
                params: { category },
              })
            }
          />
          <PopularProductsSection
            items={popular}
            onProductPress={openProduct}
            onFavoritePress={product => void toggleFavorite(product)}
            onAddToCartPress={handleAddToCart}
            isFavorite={isFavorite}
            isInCart={isProductInCart}
          />
          <RecentlyViewedSection
            items={viewedProducts}
            onProductPress={openProduct}
            onSeeAll={openViewedProducts}
          />
          <BrandsSection
            items={brands}
            isLoading={isBrandsLoading && brands.length === 0}
            onBrandPress={openBrand}
          />
        </ScrollView>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
  },
});
