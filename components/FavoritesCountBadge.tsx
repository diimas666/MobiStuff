'use client';

import { useFavorites } from '@/context/FavoritesContext';

export default function FavoritesCountBadge() {
  const { favorites } = useFavorites();

  if (favorites.length === 0) return null;

  return (
    <span className="absolute -top-1.5 -right-1.5 bg-green-500 text-white text-[10px] font-bold min-w-[18px] h-[18px] flex items-center justify-center px-1 rounded-full z-10 ring-2 ring-gray-900">
      {favorites.length}
    </span>
  );
}
