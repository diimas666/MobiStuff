import { Product } from '@/interface/product';
import { CartItem } from '@/context/CartContext';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

const CURRENCY = 'UAH';

type GaItem = {
  item_id: string;
  item_name: string;
  price: number;
  quantity: number;
  item_brand?: string;
  item_category?: string;
};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
  }
}

function isEnabled() {
  return typeof window !== 'undefined' && Boolean(GA_MEASUREMENT_ID);
}

function gtag(...args: unknown[]) {
  if (!isEnabled()) return;
  window.gtag?.(...args);
}

export function productToGaItem(
  product: Pick<
    Product,
    '_id' | 'id' | 'handle' | 'title' | 'price' | 'brand' | 'category'
  >,
  quantity = 1
): GaItem {
  return {
    item_id: product._id || product.id || product.handle,
    item_name: product.title,
    price: product.price,
    quantity,
    ...(product.brand ? { item_brand: product.brand } : {}),
    ...(product.category ? { item_category: product.category } : {}),
  };
}

export function trackPageView(url: string) {
  gtag('event', 'page_view', {
    page_path: url,
  });
}

export function trackViewItem(product: Product) {
  gtag('event', 'view_item', {
    currency: CURRENCY,
    value: product.price,
    items: [productToGaItem(product)],
  });
}

export function trackViewItemList(
  products: Product[],
  listName: string,
  listId?: string
) {
  if (!products.length) return;

  gtag('event', 'view_item_list', {
    item_list_id: listId || listName,
    item_list_name: listName,
    items: products.slice(0, 20).map((product, index) => ({
      ...productToGaItem(product),
      index,
    })),
  });
}

export function trackAddToCart(
  product: Pick<
    Product,
    '_id' | 'id' | 'handle' | 'title' | 'price' | 'brand' | 'category'
  >,
  quantity = 1
) {
  gtag('event', 'add_to_cart', {
    currency: CURRENCY,
    value: product.price * quantity,
    items: [productToGaItem(product, quantity)],
  });
}

export function trackRemoveFromCart(
  product: Pick<
    Product,
    '_id' | 'id' | 'handle' | 'title' | 'price' | 'brand' | 'category'
  >,
  quantity = 1
) {
  gtag('event', 'remove_from_cart', {
    currency: CURRENCY,
    value: product.price * quantity,
    items: [productToGaItem(product, quantity)],
  });
}

export function trackViewCart(items: CartItem[]) {
  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  gtag('event', 'view_cart', {
    currency: CURRENCY,
    value,
    items: items.map((item) => productToGaItem(item, item.quantity)),
  });
}

export function trackBeginCheckout(items: CartItem[]) {
  const value = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  gtag('event', 'begin_checkout', {
    currency: CURRENCY,
    value,
    items: items.map((item) => productToGaItem(item, item.quantity)),
  });
}

export function trackPurchase(order: {
  createdAt?: string;
  phone?: string;
  total: number;
  paymentMethod?: string;
  items?: CartItem[];
}) {
  const transactionId =
    order.createdAt && order.phone
      ? `${order.createdAt}-${order.phone}`
      : order.createdAt || String(Date.now());

  const storageKey = `ga_purchase_${transactionId}`;
  if (typeof window !== 'undefined' && sessionStorage.getItem(storageKey)) {
    return;
  }

  gtag('event', 'purchase', {
    transaction_id: transactionId,
    currency: CURRENCY,
    value: order.total,
    payment_type: order.paymentMethod === 'card' ? 'card' : 'cash_on_delivery',
    items: (order.items || []).map((item) =>
      productToGaItem(item, item.quantity)
    ),
  });

  if (typeof window !== 'undefined') {
    sessionStorage.setItem(storageKey, '1');
  }
}

export function trackAddToWishlist(product: Product) {
  gtag('event', 'add_to_wishlist', {
    currency: CURRENCY,
    value: product.price,
    items: [productToGaItem(product)],
  });
}

export function trackSearch(searchTerm: string) {
  const term = searchTerm.trim();
  if (term.length < 2) return;

  gtag('event', 'search', {
    search_term: term,
  });
}

export function trackSelectItem(product: Product, listName?: string) {
  gtag('event', 'select_item', {
    item_list_name: listName,
    items: [productToGaItem(product)],
  });
}
