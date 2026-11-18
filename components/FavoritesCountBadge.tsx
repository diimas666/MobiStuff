'use client';

import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritesCountBadge() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <span className="hdr-badge bg-sale">
      {favorites.length}
    </span>
  );
}
