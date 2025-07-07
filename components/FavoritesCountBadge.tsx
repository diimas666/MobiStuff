'use client';

import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritesCountBadge() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full z-10">
      {favorites.length}
    </span>
  );
}
