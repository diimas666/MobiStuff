import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Linking,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  View,
} from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BrandCategoryFilterSheet } from '../components/brand/BrandCategoryFilterSheet';
import { AppTabBar } from '../components/navigation/AppTabBar';
import { BackButton } from '../components/navigation/BackButton';
import { RelatedProductCard } from '../components/product/RelatedProductCard';
import { Screen } from '../components/Screen';
import { baseUrl } from '../config/api';
import { radius, spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { showErrorToast } from '../context/ToastContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { RootStackParamList } from '../navigation/types';
import { fetchApiProductsByBrand } from '../services/catalog';
import { mapProduct, type ApiProduct, type HomeProduct } from '../types/catalog';
import { addHomeProductToCart } from '../utils/addProductToCart';
import {
  filterBrandProductsByCategory,
  getBrandCategories,
} from '../utils/brandCategories';
import { errorMessages } from '../utils/errors';

type Props = NativeStackScreenProps<RootStackParamList, 'Brand'>;

export function BrandScreen({ route, navigation }: Props) {
  const { brand } = route.params;
  const { styles, colors } = useThemedStyles(c => ({
    layout: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.screen,
      paddingBottom: 16,
    },
    headerRow: {
      marginBottom: 16,
    },
    heroCard: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
      marginBottom: 16,
    },
    heroImage: {
      width: '100%',
      height: 180,
      backgroundColor: '#FFFFFF',
    },
    heroBody: {
      padding: 16,
      gap: 12,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.textOnDark,
      marginBottom: 4,
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    paragraph: {
      fontSize: 14,
      lineHeight: 22,
      color: c.textMuted,
    },
    bullet: {
      fontSize: 14,
      lineHeight: 22,
      color: c.textMuted,
      paddingLeft: 8,
    },
    actions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: 10,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
      backgroundColor: c.homeSurface,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      borderRadius: radius.pill,
      paddingHorizontal: 14,
      paddingVertical: 10,
    },
    actionText: {
      fontSize: 14,
      fontWeight: '600',
      color: c.textOnDark,
    },
    productsSection: {
      marginTop: 24,
      gap: 14,
    },
    productsHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: 12,
    },
    productsTitle: {
      flex: 1,
      fontSize: 20,
      fontWeight: '700',
      color: c.textOnDark,
    },
    filterButton: {
      width: 44,
      height: 44,
      borderRadius: radius.md,
      backgroundColor: c.homeSurface,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.2)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    filterButtonActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    filterBadge: {
      position: 'absolute',
      top: -4,
      right: -4,
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: c.danger,
      borderWidth: 1.5,
      borderColor: c.homeBackgroundBottom,
    },
    selectedCategory: {
      fontSize: 13,
      color: c.textOnDarkMuted,
    },
    productsRow: {
      gap: 12,
      paddingRight: 4,
    },
    loader: {
      paddingVertical: 24,
      alignItems: 'center',
    },
    emptyText: {
      fontSize: 14,
      color: c.textOnDarkMuted,
    },
    pressed: {
      opacity: 0.86,
    },
  }));

  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, items } = useCart();
  const [products, setProducts] = useState<ApiProduct[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(true);
  const [selectedCategorySlug, setSelectedCategorySlug] = useState<string | null>(null);
  const [isFilterVisible, setIsFilterVisible] = useState(false);

  useEffect(() => {
    let cancelled = false;

    setIsLoadingProducts(true);

    fetchApiProductsByBrand(brand.title)
      .then(nextProducts => {
        if (!cancelled) {
          setProducts(nextProducts);
        }
      })
      .catch(() => {
        if (!cancelled) {
          setProducts([]);
        }
      })
      .finally(() => {
        if (!cancelled) {
          setIsLoadingProducts(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [brand.title]);

  const categories = useMemo(() => getBrandCategories(products), [products]);
  const filteredProducts = useMemo(
    () => filterBrandProductsByCategory(products, selectedCategorySlug),
    [products, selectedCategorySlug],
  );
  const visibleProducts = useMemo(
    () => filteredProducts.map(mapProduct),
    [filteredProducts],
  );
  const selectedCategoryTitle = useMemo(
    () => categories.find(category => category.slug === selectedCategorySlug)?.title,
    [categories, selectedCategorySlug],
  );

  const openWebsite = useCallback(() => {
    void Linking.openURL(`${baseUrl}/brand/${brand.handle}`);
  }, [brand.handle]);

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
      } catch (error) {
        showErrorToast(error, errorMessages.addToCartFailed);
      }
    },
    [addToCart],
  );

  const isProductInCart = useCallback(
    (productId: string) => items.some(item => item.productId === productId),
    [items],
  );

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <View style={styles.layout}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          <Text style={styles.title}>{brand.title}</Text>

          <View style={styles.heroCard}>
            <Image
              source={{ uri: brand.imageFull || brand.image }}
              style={styles.heroImage}
              resizeMode="contain"
            />
            <View style={styles.heroBody}>
              <Text style={styles.cardTitle}>Про бренд {brand.title}</Text>

              {brand.description.map((paragraph, index) => (
                <Text key={`${index}-${paragraph.slice(0, 12)}`} style={styles.paragraph}>
                  {paragraph}
                </Text>
              ))}

              {brand.products.length > 0 ? (
                <View style={{ gap: 6 }}>
                  {brand.products.map((item, index) => (
                    <Text key={`${index}-${item.slice(0, 12)}`} style={styles.bullet}>
                      • {item}
                    </Text>
                  ))}
                </View>
              ) : null}

              <View style={styles.actions}>
                <Pressable
                  accessibilityRole="button"
                  onPress={openWebsite}
                  style={({ pressed }) => [styles.actionButton, pressed && styles.pressed]}>
                  <Ionicons name="globe-outline" size={16} color={colors.textOnDark} />
                  <Text style={styles.actionText}>Читати на сайті</Text>
                </Pressable>
              </View>
            </View>
          </View>

          <View style={styles.productsSection}>
            <View style={styles.productsHeader}>
              <Text style={styles.productsTitle}>Товари бренду</Text>

              {categories.length > 0 ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel="Фільтр за категорією"
                  onPress={() => setIsFilterVisible(true)}
                  style={({ pressed }) => [
                    styles.filterButton,
                    selectedCategorySlug && styles.filterButtonActive,
                    pressed && styles.pressed,
                  ]}>
                  <Ionicons
                    name="options-outline"
                    size={20}
                    color={selectedCategorySlug ? colors.textOnDark : colors.textOnDark}
                  />
                  {selectedCategorySlug ? <View style={styles.filterBadge} /> : null}
                </Pressable>
              ) : null}
            </View>

            {selectedCategoryTitle ? (
              <Text style={styles.selectedCategory}>{selectedCategoryTitle}</Text>
            ) : null}

            {isLoadingProducts ? (
              <View style={styles.loader}>
                <ActivityIndicator color={colors.textOnDark} />
              </View>
            ) : visibleProducts.length > 0 ? (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.productsRow}>
                {visibleProducts.map(product => (
                  <RelatedProductCard
                    key={product.id}
                    product={product}
                    onPress={() => openProduct(product)}
                    onFavoritePress={() => void toggleFavorite(product)}
                    onAddToCartPress={() => void handleAddToCart(product)}
                    isFavorite={isFavorite(product.id)}
                    isInCart={isProductInCart(product.id)}
                  />
                ))}
              </ScrollView>
            ) : (
              <Text style={styles.emptyText}>
                {selectedCategorySlug
                  ? 'У цій категорії поки немає товарів цього бренду.'
                  : 'Товари цього бренду зараз недоступні в додатку. Перегляньте каталог на сайті.'}
              </Text>
            )}
          </View>
        </ScrollView>

        <AppTabBar />
      </View>

      <BrandCategoryFilterSheet
        visible={isFilterVisible}
        categories={categories}
        selectedSlug={selectedCategorySlug}
        onClose={() => setIsFilterVisible(false)}
        onSelect={setSelectedCategorySlug}
      />
    </Screen>
  );
}
