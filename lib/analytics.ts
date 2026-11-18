import { Product } from '@/interface/product';
import { CartItem } from '@/context/CartContext';

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
export const GOOGLE_ADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID;
export const GOOGLE_ADS_ADD_TO_CART_CONVERSION =
  process.env.NEXT_PUBLIC_GOOGLE_ADS_ADD_TO_CART_CONVERSION;

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
    fbq?: (...args: unknown[]) => void;
    ttq?: { track: (event: string, data?: Record<string, unknown>) => void; page: () => void };
  }
}

/* ---------- Meta Pixel (Facebook / Instagram) та TikTok Pixel ----------
 * content_ids = _id товару — збігається з g:id у фіді /feed/products.xml,
 * тому працюють динамічна реклама та ретаргетинг на конкретні товари. */
function fbq(...args: unknown[]) {
  if (typeof window !== 'undefined' && typeof window.fbq === 'function') window.fbq(...args);
}
function ttq(event: string, data?: Record<string, unknown>) {
  if (typeof window !== 'undefined' && window.ttq?.track) window.ttq.track(event, data);
}
type PixelItem = { id: string; price: number; quantity: number; title?: string };
function pixelEvent(metaEvent: string, ttEvent: string | null, items: PixelItem[], extra: Record<string, unknown> = {}) {
  const value = items.reduce((s, i) => s + i.price * i.quantity, 0);
  fbq('track', metaEvent, {
    content_ids: items.map((i) => i.id),
    contents: items.map((i) => ({ id: i.id, quantity: i.quantity, item_price: i.price })),
    content_type: 'product',
    num_items: items.reduce((s, i) => s + i.quantity, 0),
    value,
    currency: 'UAH',
    ...extra,
  });
  if (ttEvent) {
    ttq(ttEvent, {
      contents: items.map((i) => ({ content_id: i.id, content_type: 'product', content_name: i.title, quantity: i.quantity, price: i.price })),
      value,
      currency: 'UAH',
      ...extra,
    });
  }
}
const toPixel = (p: { _id?: string; id?: string; handle?: string; price: number; title?: string }, quantity = 1): PixelItem => ({
  id: String(p._id || p.id || p.handle),
  price: p.price,
  quantity,
  title: p.title,
});

function isGtagAvailable() {
  return typeof window !== 'undefined' && typeof window.gtag === 'function';
}

function gtag(...args: unknown[]) {
  if (!isGtagAvailable()) return;
  window.gtag?.(...args);
}

function trackGoogleAdsAddToCartConversion(value: number) {
  if (!isGtagAvailable() || !GOOGLE_ADS_ADD_TO_CART_CONVERSION) return;

  gtag('event', 'conversion', {
    send_to: GOOGLE_ADS_ADD_TO_CART_CONVERSION,
    value,
    currency: CURRENCY,
  });
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
  fbq('track', 'PageView');
  if (typeof window !== 'undefined') window.ttq?.page();
}

export function trackViewItem(product: Product) {
  gtag('event', 'view_item', {
    currency: CURRENCY,
    value: product.price,
    items: [productToGaItem(product)],
  });
  pixelEvent('ViewContent', 'ViewContent', [toPixel(product)], { content_name: product.title });
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

  trackGoogleAdsAddToCartConversion(product.price * quantity);
  pixelEvent('AddToCart', 'AddToCart', [toPixel(product, quantity)], { content_name: product.title });
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
  pixelEvent('InitiateCheckout', 'InitiateCheckout', items.map((i) => toPixel(i, i.quantity)));
}

export function trackPurchase(order: {
  orderId?: string;
  createdAt?: string;
  phone?: string;
  total: number;
  paymentMethod?: string;
  items?: CartItem[];
}) {
  const transactionId =
    order.orderId ||
    (order.createdAt && order.phone
      ? `${order.createdAt}-${order.phone}`
      : order.createdAt || String(Date.now()));

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

  const items = (order.items || []).map((i) => toPixel(i, i.quantity));
  // eventID — для дедуплікації, якщо згодом підключите Conversions API
  pixelEvent('Purchase', 'CompletePayment', items, { value: order.total, eventID: transactionId });

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
  pixelEvent('AddToWishlist', 'AddToWishlist', [toPixel(product)]);
}

export function trackSearch(searchTerm: string) {
  const term = searchTerm.trim();
  if (term.length < 2) return;

  gtag('event', 'search', {
    search_term: term,
  });
  fbq('track', 'Search', { search_string: term });
  ttq('Search', { query: term });
}

export function trackSelectItem(product: Product, listName?: string) {
  gtag('event', 'select_item', {
    item_list_name: listName,
    items: [productToGaItem(product)],
  });
}
