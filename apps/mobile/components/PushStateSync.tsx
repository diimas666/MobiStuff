import { useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useFavorites } from '../context/FavoritesContext';
import { syncPushToken } from '../services/push';

/** Передає серверу кошик і обране (з затримкою) — для автоматичних push «кошик чекає» і «ціна знизилась» */
export function PushStateSync() {
  const { items } = useCart();
  const { items: favorites, isHydrated } = useFavorites();
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const first = useRef(true);

  useEffect(() => {
    if (!isHydrated) return;
    if (first.current) {
      first.current = false;
      return; // при запуску токен і так синхронізується
    }
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      void syncPushToken({
        cart: { items: items.map(i => ({ handle: i.handle, title: i.title, quantity: i.quantity, price: i.price })) },
        favorites: favorites.map(f => ({ handle: f.handle, title: f.title, price: f.price })),
      });
    }, 5000);
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, [items, favorites, isHydrated]);

  return null;
}
