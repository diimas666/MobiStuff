import { fetchProductByHandle } from './catalog';
import { appendNotification, loadNotifications } from './notificationsStorage';
import { formatPrice } from '../types/catalog';
import type { FavoriteItem } from '../types/favorites';

type FavoritePriceUpdate = {
  productId: string;
  price: number;
};

async function favoriteDiscountAlreadyNotified(
  productId: string,
  currentPrice: number,
): Promise<boolean> {
  const items = await loadNotifications();
  const priceLabel = formatPrice(currentPrice);

  return items.some(
    item =>
      item.type === 'favorite_discount' &&
      item.productId === productId &&
      item.body.includes(priceLabel),
  );
}

function shouldNotifyFavoriteDiscount(
  baselinePrice: number,
  currentPrice: number,
  oldPrice?: number,
): boolean {
  if (currentPrice < baselinePrice) {
    return true;
  }

  return Boolean(oldPrice && oldPrice > currentPrice && currentPrice <= baselinePrice);
}

export async function checkFavoritePriceDrops(
  favorites: FavoriteItem[],
): Promise<FavoritePriceUpdate[]> {
  if (!favorites.length) {
    return [];
  }

  const updates: FavoritePriceUpdate[] = [];

  for (const favorite of favorites) {
    try {
      const product = await fetchProductByHandle(favorite.handle);
      const baselinePrice = favorite.price;
      const currentPrice = product.price;

      if (!shouldNotifyFavoriteDiscount(baselinePrice, currentPrice, product.oldPrice)) {
        continue;
      }

      if (await favoriteDiscountAlreadyNotified(favorite.productId, currentPrice)) {
        continue;
      }

      const discountPercent =
        product.discountPercent ??
        (product.oldPrice && product.oldPrice > currentPrice
          ? Math.round((1 - currentPrice / product.oldPrice) * 100)
          : Math.round((1 - currentPrice / baselinePrice) * 100));

      await appendNotification({
        type: 'favorite_discount',
        title: 'Знижка в обраному',
        body: `«${favorite.title}» зараз ${formatPrice(currentPrice)}${
          discountPercent > 0 ? ` (-${discountPercent}%)` : ''
        }`,
        productId: favorite.productId,
        productHandle: favorite.handle,
      });

      updates.push({
        productId: favorite.productId,
        price: currentPrice,
      });
    } catch {
      // Пропускаємо товар, якщо API тимчасово недоступний
    }
  }

  return updates;
}
