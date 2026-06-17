import { useCallback, useEffect } from 'react';
import { AppState } from 'react-native';
import { useFavorites } from '../../context/FavoritesContext';
import { useNotifications } from '../../context/NotificationsContext';
import { useSettings } from '../../context/SettingsContext';
import { checkFavoritePriceDrops } from '../../services/favoritePriceNotifications';

export function FavoriteDiscountWatcher() {
  const { items: favorites, isHydrated, updateFavoritePrices } = useFavorites();
  const { refreshNotifications } = useNotifications();
  const { settings } = useSettings();

  const runCheck = useCallback(async () => {
    if (!isHydrated || favorites.length === 0 || !settings.favoriteDiscountNotifications) {
      return;
    }

    const updates = await checkFavoritePriceDrops(favorites);

    if (updates.length > 0) {
      await updateFavoritePrices(updates);
    }

    await refreshNotifications();
  }, [favorites, isHydrated, refreshNotifications, settings.favoriteDiscountNotifications, updateFavoritePrices]);

  useEffect(() => {
    void runCheck();
  }, [runCheck]);

  useEffect(() => {
    const subscription = AppState.addEventListener('change', state => {
      if (state === 'active') {
        void runCheck();
      }
    });

    return () => subscription.remove();
  }, [runCheck]);

  return null;
}
