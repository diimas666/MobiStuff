import type { CompositeNavigationProp, RouteProp } from '@react-navigation/native';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { FlashList } from '@shopify/flash-list';
import { useCallback, useMemo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { CartDiscountBanner } from '../components/cart/CartDiscountBanner';
import { CartEmptyState } from '../components/cart/CartEmptyState';
import { CartListItem } from '../components/cart/CartListItem';
import { FreeDeliveryProgress } from '../components/cart/FreeDeliveryProgress';
import { CrossSellSection } from '../components/product/CrossSellSection';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { useStoreSettings } from '../hooks/useStoreSettings';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { useCart } from '../context/CartContext';
import { radius, spacing } from '../constants/theme';
import type { RootStackParamList, TabParamList } from '../navigation/types';
import type { CartItem } from '../types/cart';
import { formatPrice } from '../types/catalog';
import { getCartTotals } from '../utils/cartTotals';
import { useThemedStyles } from '../hooks/useThemedStyles';

type CartNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<TabParamList, 'Cart'>,
  NativeStackNavigationProp<RootStackParamList>
>;

type CartRouteProp = RouteProp<TabParamList, 'Cart'>;

export function CartScreen() {
  const { styles, colors } = useThemedStyles(c => ({
  layout: {
    flex: 1,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 24,
  },
  header: {
    marginBottom: 16,
  },
  title: {
    fontSize: 34,
    fontWeight: '700',
    letterSpacing: -0.8,
    color: c.text,
    marginTop: 8,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: c.textOnDarkMuted,
    marginBottom: 20,
    lineHeight: 20,
  },
  subtitleBold: {
    fontSize: 15,
    color: c.textOnDarkMuted,
    marginBottom: 18,
    lineHeight: 20,
  },
  subtitlePrice: {
    fontWeight: '600',
    color: c.text,
  },
  footer: {
    paddingHorizontal: spacing.screen,
    paddingTop: 12,
    paddingBottom: 14,
    borderTopWidth: 0.5,
    borderTopColor: c.line,
    backgroundColor: c.card,
    gap: 12,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  totalLabel: {
    fontSize: 17,
    fontWeight: '600',
    color: c.text,
  },
  totalValue: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: -0.5,
    color: c.text,
  },
  checkoutButton: {
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 20,
  },
  checkoutButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: c.onPrimary,
  },
  pressed: {
    opacity: 0.88,
    transform: [{ scale: 0.98 }],
  },
}));

  const navigation = useNavigation<CartNavigationProp>();
  const route = useRoute<CartRouteProp>();
  const { items, totalQuantity, increment, decrement, removeFromCart, addToCart } = useCart();
  const cartTotals = useMemo(() => getCartTotals(items), [items]);
  const mainItem = useMemo(() => [...items].sort((a, b) => b.price - a.price)[0], [items]);
  const rootNav = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
  const { freeDeliveryFrom } = useStoreSettings();
  const { total } = cartTotals;

  const handleBack = useCallback(() => {
    const rootNavigation = navigation.getParent<NativeStackNavigationProp<RootStackParamList>>();
    const returnTo = route.params?.returnTo;

    if (returnTo && rootNavigation) {
      navigation.setParams({ returnTo: undefined });
      rootNavigation.navigate(returnTo.name, returnTo.params);
      return;
    }

    if (navigation.canGoBack()) {
      navigation.goBack();
      return;
    }

    if (rootNavigation?.canGoBack()) {
      rootNavigation.goBack();
      return;
    }

    navigation.navigate('Home');
  }, [navigation, route.params?.returnTo]);

  const openCheckout = useCallback(() => {
    navigation.navigate('Checkout');
  }, [navigation]);

  const openCatalog = useCallback(() => {
    navigation.navigate('Categories');
  }, [navigation]);

  const openHome = useCallback(() => {
    navigation.navigate('Home');
  }, [navigation]);

  const showBackButton = items.length > 0 || Boolean(route.params?.returnTo);

  const renderItem = useCallback(
    ({ item }: { item: CartItem }) => (
      <CartListItem
        item={item}
        onIncrement={() => increment(item.productId, item.variant)}
        onDecrement={() => decrement(item.productId, item.variant)}
        onRemove={() => removeFromCart(item.productId, item.variant)}
      />
    ),
    [decrement, increment, removeFromCart],
  );

  const listHeader = useCallback(
    () => (
      <>
        {showBackButton ? (
          <View style={styles.header}>
            <BackButton onPress={handleBack} />
          </View>
        ) : null}

        <Text style={styles.title}>Кошик</Text>
        {items.length > 0 ? (
          <Text style={styles.subtitleBold}>
            {totalQuantity}{' '}
            {totalQuantity === 1
              ? 'товар'
              : totalQuantity < 5
                ? 'товари'
                : 'товарів'}{' '}
            на суму <Text style={styles.subtitlePrice}>{formatPrice(total)}</Text>
          </Text>
        ) : (
          <Text style={styles.subtitle}>
            Додайте аксесуари з каталогу — оформлення займе лише хвилину
          </Text>
        )}

        {items.length === 0 ? (
          <CartEmptyState onBrowseCatalog={openCatalog} onGoHome={openHome} />
        ) : (
          <FreeDeliveryProgress total={total} threshold={freeDeliveryFrom} />
        )}
      </>
    ),
    [
      handleBack,
      items.length,
      openCatalog,
      openHome,
      showBackButton,
      total,
      totalQuantity,
      freeDeliveryFrom,
    ],
  );

  return (
    <Screen variant="home">
      <View style={styles.layout} testID="screen-cart">
        <FlashList
          testID="screen-cart-list"
          data={items}
          keyExtractor={item => `${item.productId}-${item.variant ?? 'default'}`}
          renderItem={renderItem}
          extraData={items}
          ListHeaderComponent={listHeader}
          ListFooterComponent={
            mainItem ? (
              <View style={{ marginTop: 18 }}>
                <CrossSellSection
                  handle={mainItem.handle}
                  exclude={items.map(i => i.handle)}
                  title="Додайте до замовлення"
                  subtitle="Часто купують разом"
                  onProductPress={product => rootNav?.navigate('Product', { product })}
                  onAddToCartPress={product => void addHomeProductToCart(addToCart, product).catch(() => {})}
                  isInCart={id => items.some(i => i.productId === id)}
                />
              </View>
            ) : null
          }
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
        />

        {items.length > 0 ? (
          <View style={styles.footer}>
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>Разом</Text>
              <Text style={styles.totalValue}>{formatPrice(total)}</Text>
            </View>

            <CartDiscountBanner totals={cartTotals} />

            <Pressable
              accessibilityRole="button"
              onPress={openCheckout}
              style={({ pressed }) => [styles.checkoutButton, pressed && styles.pressed]}>
              <Text style={styles.checkoutButtonText}>Оформити замовлення</Text>
              <Ionicons name="arrow-forward" size={18} color={colors.onPrimary} />
            </Pressable>
          </View>
        ) : null}
      </View>
    </Screen>
  );
}

