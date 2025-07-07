'use client';

import { useEffect, useState } from 'react';
import CategoryList from '@/components/CategoryList';
import ProductCard from '@/components/ProductCard';
import { Product } from '@/interface/product';
import { fetchProductsByIds } from '@/lib/fetchProductsByIds';

const ITEMS_PER_PAGE = 12;

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);

  const totalPages = Math.ceil(favorites.length / ITEMS_PER_PAGE);
  const paginatedProducts = favorites.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  ); // Обновление query строки

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    if (stored.length === 0) {
      setFavorites([]);
      setLoading(false);
      return;
    }

    fetchProductsByIds(stored).then((products) => {
      setFavorites(products);
      setLoading(false);
    });
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
      {/* Сайдбар */}
      <aside className="hidden md:block border px-4 py-4 shadow-sm rounded bg-white h-fit sticky z-30">
        <h3 className="text-lg font-semibold mb-4">Каталог</h3>
        <CategoryList />
      </aside>

      {/* Контент */}
      <div className="grid gap-1 grid-cols-[repeat(auto-fit,minmax(250px,1fr))] ">
        {loading ? (
          <p className="col-span-full text-center">Завантаження...</p>
        ) : paginatedProducts.length > 0 ? (
          paginatedProducts.map((product) => (
            <div key={product._id} className="max-w-[250px]">
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
  );
}
