'use client';

import { createContext, useContext, useEffect, useState } from 'react';

type FavoritesContextType = {
  favorites: string[];
  toggleFavorite: (id: string) => void;
  setFavorites: (ids: string[]) => void;
  clearFavorites: () => void;
};

const FavoritesContext = createContext<FavoritesContextType | null>(null);

export const FavoritesProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [favorites, setFavoritesState] = useState<string[]>([]);

  // Загрузка из localStorage при монтировании
  useEffect(() => {
    const stored = localStorage.getItem('favorites');
    if (stored) {
      setFavoritesState(JSON.parse(stored));
    }
  }, []);

  // Сохраняем изменения в localStorage
  useEffect(() => {
    localStorage.setItem('favorites', JSON.stringify(favorites));
  }, [favorites]);

  const toggleFavorite = (id: string) => {
    setFavoritesState((prev) =>
      prev.includes(id) ? prev.filter((f) => f !== id) : [...prev, id]
    );
  };

  const setFavorites = (ids: string[]) => {
    setFavoritesState(ids);
  };

  const clearFavorites = () => {
    setFavoritesState([]);
  };

  return (
    <FavoritesContext.Provider
      value={{ favorites, toggleFavorite, setFavorites, clearFavorites }}
    >
      {children}
    </FavoritesContext.Provider>
  );
};

export const useFavorites = () => {
  const context = useContext(FavoritesContext);
  if (!context) {
    throw new Error('useFavorites must be used within FavoritesProvider');
  }
  return context;
};
