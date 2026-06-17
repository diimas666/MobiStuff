import type {
  CompositeNavigationProp,
  RouteProp,
} from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import { LoadingState } from '../components/LoadingState';
import { Screen } from '../components/Screen';
import { FavoritesEmptyState } from '../components/favorites/FavoritesEmptyState';
import { BackButton } from '../components/navigation/BackButton';
import { RelatedProductCard } from '../components/product/RelatedProductCard';
import { spacing } from '../constants/theme';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { showErrorToast } from '../context/ToastContext';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import { formatPrice, type HomeProduct } from '../types/catalog';
import type { FavoriteItem } from '../types/favorites';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { errorMessages } from '../utils/errors';
import { useThemedStyles } from '../hooks/useThemedStyles';

type FavoritesNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Favorites'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type FavoritesRouteProp = RouteProp<TabParamList, 'Favorites'>;

const { width: screenWidth } = Dimensions.get('window');
const GRID_GAP = 12;
const NUM_COLUMNS = 2;
const GRID_CARD_WIDTH =
  (screenWidth - spacing.screen * 2 - GRID_GAP * (NUM_COLUMNS - 1)) /
  NUM_COLUMNS;

function toHomeProduct(item: FavoriteItem): HomeProduct {
  return {
    id: item.productId,
    handle: item.handle,
    title: item.title,
    price: item.price,
    image: item.image,
  };
}

export function FavoritesScreen() {
  const { styles, colors } = useThemedStyles(c => ({
    list: {
      paddingHorizontal: spacing.screen - GRID_GAP / 2,
      paddingBottom: 32,
    },
    loadingHeader: {
      paddingHorizontal: spacing.screen,
      paddingTop: 8,
      paddingBottom: 8,
    },
    header: {
      paddingHorizontal: GRID_GAP / 2,
      paddingTop: 8,
      paddingBottom: 16,
    },
    backRow: {
      marginBottom: 16,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.textOnDark,
      marginBottom: 6,
    },
    subtitle: {
      fontSize: 14,
      color: c.textOnDarkMuted,
      lineHeight: 20,
      marginBottom: 14,
    },
    summaryCard: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 16,
      paddingVertical: 14,
      borderRadius: 16,
      backgroundColor: c.homeSearch,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      marginBottom: 8,
    },
    summaryLabel: {
      fontSize: 14,
      color: c.textOnDarkMuted,
    },
    summaryValue: {
      fontSize: 18,
      fontWeight: '700',
      color: c.priceLight,
    },
    gridItem: {
      flex: 1,
      paddingHorizontal: GRID_GAP / 2,
      marginBottom: GRID_GAP,
    },
    emptyWrap: {
      paddingHorizontal: GRID_GAP / 2,
      paddingTop: 8,
    },
  }));

  const navigation = useNavigation<FavoritesNavigationProp>();
  const route = useRoute<FavoritesRouteProp>();
  const { items, isHydrated, isFavorite, toggleFavorite } = useFavorites();
  const { addToCart, items: cartItems } = useCart();
  const showBackButton = Boolean(route.params?.returnTo);

  const handleBack = useCallback(() => {
    const returnTo = route.params?.returnTo;

    if (returnTo?.tab === 'Profile') {
      navigation.setParams({ returnTo: undefined });
      navigation.navigate('Profile', {
        screen: returnTo.screen ?? 'ProfileMain',
      });
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
    }
  }, [navigation, route.params?.returnTo]);

  const totalValue = useMemo(
    () => items.reduce((sum, item) => sum + item.price, 0),
    [items],
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

  const openHome = useCallback(() => {
    navigation.navigate('Home');
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

  const renderItem = useCallback(
    ({ item }: { item: FavoriteItem }) => {
      const product = toHomeProduct(item);

      return (
        <View style={styles.gridItem}>
          <RelatedProductCard
            product={product}
            width={GRID_CARD_WIDTH}
            onPress={() => openProduct(product)}
            onFavoritePress={() => void toggleFavorite(product)}
            onAddToCartPress={() => void handleAddToCart(product)}
            isFavorite={isFavorite(product.id)}
            isInCart={isProductInCart(product.id)}
          />
        </View>
      );
    },
    [handleAddToCart, isFavorite, isProductInCart, openProduct, toggleFavorite],
  );

  const listHeader = useCallback(
    () => (
      <View style={styles.header}>
        {showBackButton ? (
          <View style={styles.backRow}>
            <BackButton onPress={handleBack} />
          </View>
        ) : null}
        <Text style={styles.title}>Обране</Text>
        {items.length > 0 ? (
          <>
            <Text style={styles.subtitle}>
              {items.length}{' '}
              {items.length === 1
                ? 'товар збережено'
                : items.length < 5
                ? 'товари збережено'
                : 'товарів збережено'}
            </Text>
            <View style={styles.summaryCard}>
              <Text style={styles.summaryLabel}>На суму</Text>
              <Text style={styles.summaryValue}>{formatPrice(totalValue)}</Text>
            </View>
          </>
        ) : (
          <Text style={styles.subtitle}>
            Збережені товари для швидкого доступу
          </Text>
        )}
      </View>
    ),
    [handleBack, items.length, showBackButton, totalValue],
  );

  const listEmpty = useCallback(
    () => (
      <View style={styles.emptyWrap}>
        <FavoritesEmptyState
          onBrowseCatalog={openCatalog}
          onGoHome={openHome}
        />
      </View>
    ),
    [openCatalog, openHome],
  );

  if (!isHydrated) {
    return (
      <Screen variant="home">
        <StatusBar barStyle="light-content" />
        {showBackButton ? (
          <View style={styles.loadingHeader}>
            <BackButton onPress={handleBack} />
          </View>
        ) : null}
        <LoadingState label="Завантаження обраного..." />
      </Screen>
    );
  }

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />
      <FlashList
        data={items}
        numColumns={NUM_COLUMNS}
        keyExtractor={item => item.productId}
        renderItem={renderItem}
        ListHeaderComponent={listHeader}
        ListEmptyComponent={listEmpty}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
      />
    </Screen>
  );
}
