'use client';

import { useEffect, useState } from 'react';
import CategoryList from '@/components/CategoryList';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/interface/product';
import { fetchProductsByIds } from '@/lib/fetchProductsByIds';
import { useFavorites } from '@/context/FavoritesContext';

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
  const { favorites, setFavorites, clearFavorites } = useFavorites();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(products.length / ITEMS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    fetchProductsByIds(favorites).then((fetched) => {
      setProducts(fetched);
      setLoading(false);

      // Удаляем несуществующие товары из избранного
      const existingIds = fetched.map((p) => p._id || p.id);
      const cleaned = favorites.filter((id) => existingIds.includes(id));
      if (cleaned.length !== favorites.length) {
        setFavorites(cleaned);
      }
    });
  }, [favorites, setFavorites]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      {/* Сайдбар */}
      <aside className="hidden md:block border px-4 py-4 shadow-sm rounded bg-white h-fit sticky z-30">
        <h3 className="text-lg font-semibold mb-4">Каталог</h3>
        <CategoryList />
      </aside>

      {/* Контент */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          {favorites.length > 0 && (
            <button
              onClick={clearFavorites}
              className="text-sm text-red-600 py-2 px-4 rounded-md bg-gray-400 cursor-pointer hover:text-gray-100 transition-all duration-300"
            >
              Очистити обране
            </button>
          )}
        </div>

        <div className="grid gap-4 grid-cols-[repeat(auto-fill,minmax(250px,1fr))]">
          {loading ? (
            <p className="col-span-full text-center">Завантаження...</p>
          ) : paginatedProducts.length > 0 ? (
            paginatedProducts.map((product) => (
              <div key={product._id || product.id} className="max-w-[250px]">
                <ProductCard product={product} />
              </div>
            ))
          ) : (
            <p className="col-span-full text-center text-gray-500">
              Ви ще не додали жодного товару в обране.
            </p>
          )}
        </div>

        {/* Пагинация */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-wrap justify-center items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => p - 1)}
              disabled={currentPage === 1}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              ← Попередня
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`px-3 py-1 border rounded hover:bg-gray-100 ${
                  p === currentPage ? 'bg-black text-white' : ''
                }`}
              >
                {p}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => p + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
            >
              Наступна →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
