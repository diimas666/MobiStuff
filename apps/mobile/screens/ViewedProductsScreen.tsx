import type { CompositeNavigationProp } from '@react-navigation/native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useCallback, useMemo } from 'react';
import { ScrollView, StatusBar, StyleSheet, Text, useWindowDimensions, View } from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { BackButton } from '../components/navigation/BackButton';
import { RelatedProductCard } from '../components/product/RelatedProductCard';
import { Screen } from '../components/Screen';
import { ViewedProductsEmptyState } from '../components/viewed/ViewedProductsEmptyState';
import { spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { showErrorToast } from '../context/ToastContext';
import { useViewedProducts } from '../context/ViewedProductsContext';
import type { ProfileStackParamList, RootStackParamList, TabParamList } from '../navigation/types';
import { formatPrice, type HomeProduct } from '../types/catalog';
import type { ViewedProductItem } from '../types/viewedProducts';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { errorMessages } from '../utils/errors';
import { groupViewedProductsByDate } from '../utils/groupViewedProductsByDate';
import { useThemedStyles } from '../hooks/useThemedStyles';

type NavigationProp = CompositeNavigationProp<
  NativeStackNavigationProp<ProfileStackParamList, 'ViewedProducts'>,
  CompositeNavigationProp<
    BottomTabNavigationProp<TabParamList>,
    NativeStackNavigationProp<RootStackParamList>
  >
>;

const GRID_GAP = 12;
const NUM_COLUMNS = 2;
const GROUP_PADDING = 14;

function toHomeProduct(item: ViewedProductItem): HomeProduct {
  return {
    id: item.productId,
    handle: item.handle,
    title: item.title,
    price: item.price,
    image: item.image,
  };
}

function chunkItems<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];

  for (let index = 0; index < items.length; index += size) {
    rows.push(items.slice(index, index + size));
  }

  return rows;
}

export function ViewedProductsScreen() {
  const { styles, colors } = useThemedStyles(c => ({
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 32,
  },
  loadingHeader: {
    paddingHorizontal: spacing.screen,
    paddingTop: 8,
    paddingBottom: 8,
  },
  headerRow: {
    marginBottom: 16,
  },
  titleBlock: {
    marginBottom: 20,
    gap: 6,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: c.textOnDark,
  },
  subtitle: {
    fontSize: 14,
    color: c.textOnDarkMuted,
    lineHeight: 20,
  },
  groups: {
    gap: 20,
  },
  group: {
    gap: 12,
    padding: GROUP_PADDING,
    borderRadius: 20,
    backgroundColor: c.homeSearch,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  groupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  groupTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: c.textOnDark,
  },
  groupCount: {
    fontSize: 13,
    color: c.textOnDarkMuted,
  },
  grid: {
    gap: GRID_GAP,
  },
  gridRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  gridRowSingle: {
    justifyContent: 'flex-start',
  },
  gridItem: {
    gap: 6,
  },
  viewedTime: {
    fontSize: 12,
    color: c.textOnDarkMuted,
    paddingLeft: 4,
    marginTop: 6,
  },
  groupSummary: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.08)',
  },
  groupSummaryLabel: {
    fontSize: 13,
    color: c.textOnDarkMuted,
  },
  groupSummaryValue: {
    fontSize: 16,
    fontWeight: '700',
    color: c.priceLight,
  },
}));

  const navigation = useNavigation<NavigationProp>();
  const { width: windowWidth } = useWindowDimensions();
  const { items, isHydrated } = useViewedProducts();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, items: cartItems } = useCart();

  const groupedItems = useMemo(() => groupViewedProductsByDate(items), [items]);
  const cardWidth = useMemo(
    () =>
      Math.floor(
        (windowWidth -
          spacing.screen * 2 -
          GROUP_PADDING * 2 -
          GRID_GAP * (NUM_COLUMNS - 1)) /
          NUM_COLUMNS,
      ),
    [windowWidth],
  );

  const openProduct = useCallback(
    (product: HomeProduct) => {
      navigation.navigate('Product', { product });
    },
    [navigation],
  );

  const openCatalog = useCallback(() => {
    navigation.navigate('Categories');
  }, [navigation]);

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
    (productId: string) => cartItems.some(item => item.productId === productId),
    [cartItems],
  );

  if (!isHydrated) {
    return (
      <Screen variant="home">
        <StatusBar barStyle="light-content" />
        <View style={styles.loadingHeader}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>
        <LoadingState label="Завантаження історії..." />
      </Screen>
    );
  }

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <View style={styles.headerRow}>
          <BackButton onPress={() => navigation.goBack()} />
        </View>

        <View style={styles.titleBlock}>
          <Text style={styles.title}>Переглянуті товари</Text>
          <Text style={styles.subtitle}>
            {items.length > 0
              ? `${items.length} ${
                  items.length === 1
                    ? 'перегляд'
                    : items.length < 5
                      ? 'перегляди'
                      : 'переглядів'
                }`
              : 'Історія переглянутих товарів'}
          </Text>
        </View>

        {items.length === 0 ? (
          <ViewedProductsEmptyState onBrowseCatalog={openCatalog} />
        ) : (
          <View style={styles.groups}>
            {groupedItems.map(group => (
              <View key={group.dateKey} style={styles.group}>
                <View style={styles.groupHeader}>
                  <Text style={styles.groupTitle}>{group.label}</Text>
                  <Text style={styles.groupCount}>
                    {group.items.length}{' '}
                    {group.items.length === 1
                      ? 'товар'
                      : group.items.length < 5
                        ? 'товари'
                        : 'товарів'}
                  </Text>
                </View>

                <View style={styles.grid}>
                  {chunkItems(group.items, NUM_COLUMNS).map((row, rowIndex) => (
                    <View
                      key={`${group.dateKey}-row-${rowIndex}`}
                      style={[styles.gridRow, row.length === 1 && styles.gridRowSingle]}>
                      {row.map(item => {
                        const product = toHomeProduct(item);

                        return (
                          <View
                            key={`${group.dateKey}-${item.productId}`}
                            style={[styles.gridItem, { width: cardWidth }]}>
                            <RelatedProductCard
                              product={product}
                              width={cardWidth}
                              onPress={() => openProduct(product)}
                              onFavoritePress={() => void toggleFavorite(product)}
                              onAddToCartPress={() => void handleAddToCart(product)}
                              isFavorite={isFavorite(product.id)}
                              isInCart={isProductInCart(product.id)}
                            />
                            <Text style={styles.viewedTime}>
                              {new Date(item.viewedAt).toLocaleTimeString('uk-UA', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })}
                            </Text>
                          </View>
                        );
                      })}
                    </View>
                  ))}
                </View>

                <View style={styles.groupSummary}>
                  <Text style={styles.groupSummaryLabel}>На суму в цій групі</Text>
                  <Text style={styles.groupSummaryValue}>
                    {formatPrice(group.items.reduce((sum, item) => sum + item.price, 0))}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </Screen>
  );
}

