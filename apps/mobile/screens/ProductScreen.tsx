import { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ErrorState } from '../components/ErrorState';
import { LoadingState } from '../components/LoadingState';
import { OfflineState } from '../components/OfflineState';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ProductPerks } from '../components/product/ProductPerks';
import { QuickOrderSheet } from '../components/product/QuickOrderSheet';
import { baseUrl } from '../config/api';
import { AddToCartButton } from '../components/product/AddToCartButton';
import { ProductCategoryLabel } from '../components/product/ProductCategoryLabel';
import { ProductDescription } from '../components/product/ProductDescription';
import { ProductImageCard } from '../components/product/ProductImageCard';
import { ProductPriceBlock } from '../components/product/ProductPriceBlock';
import { ProductScreenHeader } from '../components/product/ProductScreenHeader';
import { RelatedProductsSection } from '../components/product/RelatedProductsSection';
import { VariantPicker } from '../components/product/VariantPicker';
import { Screen } from '../components/Screen';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { useViewedProducts } from '../context/ViewedProductsContext';
import { showErrorToast, showToast } from '../context/ToastContext';
import { spacing } from '../constants/theme';
import { useProductScreen } from '../hooks/useProductScreen';
import { useNetwork } from '../context/NetworkContext';
import type { RootStackParamList } from '../navigation/types';
import type { HomeProduct } from '../types/catalog';
import { errorMessages } from '../utils/errors';
import { previewToProductDetail } from '../utils/productPreview';
import { addHomeProductToCart } from '../utils/addProductToCart';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = NativeStackScreenProps<RootStackParamList, 'Product'>;

export function ProductScreen({ route, navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    layout: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.screen,
      paddingTop: 16,
      paddingBottom: 28,
    },
    pressed: {
      opacity: 0.85,
      transform: [{ scale: 0.96 }],
    },
    title: {
      fontSize: 26,
      fontWeight: '700',
      letterSpacing: -0.5,
      color: c.text,
      lineHeight: 31,
      marginBottom: 12,
    },
    buyBar: {
      flexDirection: 'row',
      gap: 10,
      paddingHorizontal: spacing.screen,
      paddingTop: 10,
      backgroundColor: c.card,
      borderTopWidth: 0.5,
      borderTopColor: c.line,
    },
    favoriteButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: c.fill,
      alignItems: 'center',
      justifyContent: 'center',
    },
  }));

  const insets = useSafeAreaInsets();
  const params = route.params;
  const preview: HomeProduct = params.product ?? { id: params.handle ?? '', handle: params.handle ?? '', title: '', price: 0 };
  const { isOffline } = useNetwork();
  const { product, related, isLoading, error, retry } = useProductScreen(
    preview.handle,
  );
  const displayProduct = product ?? previewToProductDetail(preview);
  const showBlockingLoader = isLoading && !product;
  const { isFavorite, toggleFavorite } = useFavorites();
  const { addViewedProduct } = useViewedProducts();
  const { totalQuantity, addToCart, removeFromCart, isInCart, items } =
    useCart();
  const [selectedVariant, setSelectedVariant] = useState<string | null>(null);

  useEffect(() => {
    if (!preview.title) return;
    void addViewedProduct({
      id: preview.id,
      handle: preview.handle,
      title: preview.title,
      price: preview.price,
      image: preview.image,
    });
  }, [addViewedProduct, preview.id]);

  useEffect(() => {
    if (product?.variants.length) {
      setSelectedVariant(product.variants[0]);
    } else {
      setSelectedVariant(null);
    }
  }, [product?.handle, product?.variants]);

  const openRelatedProduct = (item: HomeProduct) => {
    navigation.push('Product', { product: item });
  };

  const handleAddRelatedToCart = async (item: HomeProduct) => {
    try {
      await addHomeProductToCart(addToCart, item);
    } catch (addError) {
      showErrorToast(addError, errorMessages.addToCartFailed);
    }
  };

  const isRelatedInCart = (productId: string) =>
    items.some(item => item.productId === productId);

  const openCart = () => {
    navigation.navigate('MainTabs', {
      screen: 'Cart',
      params: {
        returnTo: { name: 'Product', params: { product: preview } },
      },
    });
  };

  const handleAddToCart = async () => {
    if (!displayProduct) {
      return;
    }

    if (displayProduct.variants.length > 0 && !selectedVariant) {
      showToast(errorMessages.selectVariant, 'info');
      throw new Error('variant_required');
    }

    if (!displayProduct.inStock) {
      showErrorToast(new Error('out_of_stock'), errorMessages.addToCartFailed);
      throw new Error('out_of_stock');
    }

    try {
      await addToCart({
        productId: displayProduct.id,
        handle: displayProduct.handle,
        title: displayProduct.title,
        description: displayProduct.description,
        price: displayProduct.price,
        oldPrice: displayProduct.oldPrice,
        discountPercent: displayProduct.discountPercent,
        image: displayProduct.image,
        variant: selectedVariant ?? undefined,
      });
    } catch (addError) {
      showErrorToast(addError, errorMessages.addToCartFailed);
      throw addError;
    }
  };

  const handleRemoveFromCart = async () => {
    if (!displayProduct) {
      return;
    }

    await removeFromCart(displayProduct.id, selectedVariant ?? undefined);
  };

  const variantKey = selectedVariant ?? undefined;
  const productInCart = isInCart(displayProduct.id, variantKey);

  return (
    <Screen variant="home">
      <ProductScreenHeader
        onBack={() => navigation.goBack()}
        onCartPress={openCart}
        cartCount={totalQuantity}
        shareUrl={displayProduct.handle ? `${baseUrl}/product/${displayProduct.handle}` : undefined}
        shareTitle={displayProduct.title}
      />

      {showBlockingLoader && isOffline && !product ? (
        <OfflineState onRetry={retry} />
      ) : showBlockingLoader ? (
        <LoadingState />
      ) : error && !product ? (
        <ErrorState message={error ?? 'Товар не знайдено'} onRetry={retry} />
      ) : (
        <View style={styles.layout} testID="screen-product">
          <ScrollView
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.content}
          >
            <ProductImageCard
              title={displayProduct.title}
              images={displayProduct.images}
              isNew={displayProduct.isNew}
              isTrending={displayProduct.isTrending}
              isFeatured={displayProduct.isFeatured}
            />

            <ProductCategoryLabel category={displayProduct.category} />
            <Text style={styles.title}>{displayProduct.title}</Text>
            <ProductPriceBlock
              price={displayProduct.price}
              oldPrice={displayProduct.oldPrice}
              discountPercent={displayProduct.discountPercent}
              inStock={displayProduct.inStock}
              lowStock={displayProduct.lowStock}
            />

            {displayProduct.inStock && displayProduct.id ? (
              <QuickOrderSheet productId={displayProduct.id} title={displayProduct.title} price={displayProduct.price} variant={selectedVariant} />
            ) : null}

            <ProductPerks />

            <VariantPicker
              variants={displayProduct.variants}
              selected={selectedVariant}
              onSelect={setSelectedVariant}
            />

            {displayProduct.description ? (
              <ProductDescription text={displayProduct.description} />
            ) : null}

            <RelatedProductsSection
              items={related}
              onProductPress={openRelatedProduct}
              onFavoritePress={item => void toggleFavorite(item)}
              onAddToCartPress={handleAddRelatedToCart}
              isFavorite={isFavorite}
              isInCart={isRelatedInCart}
            />
          </ScrollView>

          <View style={[styles.buyBar, { paddingBottom: Math.max(insets.bottom, 12) }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel={isFavorite(displayProduct.id) ? 'Прибрати з обраного' : 'Додати в обране'}
              onPress={() => void toggleFavorite(displayProduct)}
              style={({ pressed }) => [styles.favoriteButton, pressed && styles.pressed]}>
              <Ionicons
                name={isFavorite(displayProduct.id) ? 'heart' : 'heart-outline'}
                size={24}
                color={isFavorite(displayProduct.id) ? colors.sale : colors.text}
              />
            </Pressable>
            <AddToCartButton
              inStock={displayProduct.inStock}
              inCart={productInCart}
              onAdd={handleAddToCart}
              onRemove={handleRemoveFromCart}
              onGoToCart={openCart}
            />
          </View>
        </View>
      )}
    </Screen>
  );
}
