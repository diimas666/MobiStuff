'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Heart, Trash2 } from 'lucide-react';
import CategoryList from '@/components/CategoryList';
import ProductList from '@/components/ProductList';
import HomeSectionTitle from '@/components/HomeSectionTitle';
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
    setCurrentPage(1);
  }, [favorites.length]);

  useEffect(() => {
    if (favorites.length === 0) {
      setProducts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    fetchProductsByIds(favorites).then((fetched) => {
      setProducts(fetched);
      setLoading(false);

      const existingIds = fetched.map((p) => p._id || p.id);
      const cleaned = favorites.filter((id) => existingIds.includes(id));
      if (cleaned.length !== favorites.length) {
        setFavorites(cleaned);
      }
    });
  }, [favorites, setFavorites]);

  return (
    <div className="pb-10">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-5 py-8 sm:px-8 sm:py-10 mb-6">
        <div className="absolute -top-16 -right-16 w-48 h-48 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-green-400/10 rounded-full blur-2xl" />
        <div className="relative flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
              <Heart className="w-3.5 h-3.5" />
              Обране
            </span>
            <h1 className="text-2xl sm:text-3xl font-bold leading-tight">Ваші улюблені товари</h1>
            <p className="text-gray-300 text-sm sm:text-base mt-2">
              {favorites.length > 0
                ? `${products.length} ${products.length === 1 ? 'товар' : products.length < 5 ? 'товари' : 'товарів'} у списку обраного`
                : 'Додавайте товари в обране, щоб не втратити їх'}
            </p>
          </div>
          {favorites.length > 0 && (
            <button
              type="button"
              onClick={clearFavorites}
              className="inline-flex items-center justify-center gap-2 shrink-0 px-4 py-2.5 rounded-xl border border-red-400/40 bg-red-500/10 text-red-200 text-sm font-medium hover:bg-red-500/20 transition"
            >
              <Trash2 className="w-4 h-4" />
              Очистити обране
            </button>
          )}
        </div>
      </section>

      <div className="flex flex-col md:flex-row gap-4">
        <aside className="hidden md:block w-[300px] shrink-0 px-4 py-4 rounded-2xl border border-gray-100 bg-white shadow-sm h-fit sticky top-[88px] z-30">
          <HomeSectionTitle title="Каталог" />
          <CategoryList />
        </aside>

        <section className="flex-1 min-w-0 rounded-2xl border border-gray-100 bg-white p-4 sm:p-6 shadow-sm">
          {loading ? (
            <div className="space-y-4">
              <div className="h-6 w-40 bg-gray-100 rounded-lg animate-pulse" />
              <div className="grid gap-4 grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="h-80 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            </div>
          ) : products.length > 0 ? (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <HomeSectionTitle
                  title="Список обраного"
                  subtitle={`Сторінка ${currentPage} з ${totalPages}`}
                />
              </div>
              <ProductList products={paginatedProducts} colVariant="2" />
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-center py-12 sm:py-16 px-4">
              <div className="w-16 h-16 rounded-2xl bg-green-50 text-green-500 flex items-center justify-center mb-5">
                <Heart className="w-8 h-8" />
              </div>
              <h2 className="text-xl font-bold text-gray-900 mb-2">Обране порожнє</h2>
              <p className="text-gray-500 text-sm max-w-sm mb-6">
                Натисніть на сердечко на картці товару — і він з&apos;явиться тут.
              </p>
              <Link
                href="/"
                className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition"
              >
                Перейти до каталогу
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}

          {totalPages > 1 && (
            <div className="mt-8 flex flex-wrap justify-center items-center gap-2">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => p - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                ← Попередня
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setCurrentPage(p)}
                  className={`min-w-[40px] px-3 py-2 text-sm border rounded-xl transition ${
                    p === currentPage
                      ? 'bg-gray-900 text-white border-gray-900'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  {p}
                </button>
              ))}

              <button
                type="button"
                onClick={() => setCurrentPage((p) => p + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 text-sm border border-gray-200 rounded-xl hover:bg-gray-50 disabled:opacity-40 transition"
              >
                Наступна →
              </button>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
