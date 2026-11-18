'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Heart } from 'lucide-react';
import ProductList from '@/components/ProductList';
import ProductGridSkeleton from '@/components/ProductGridSkeleton';
import { plural, productForms } from '@/lib/format';
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

  if (!loading && products.length === 0) {
    return (
      <div className="mx-auto flex max-w-2xl flex-col items-center px-4 py-16 text-center sm:py-24">
        <Heart className="mb-6 h-14 w-14 text-ink-3" strokeWidth={1.25} />
        <h1 className="display-lg">Тут буде ваше обране.</h1>
        <p className="lead mt-4">Натисніть на сердечко на картці товару, щоб зберегти його й повернутися пізніше.</p>
        <Link href="/catalog" className="btn-primary btn-lg mt-8">
          Перейти до каталогу
        </Link>
      </div>
    );
  }

  return (
    <div className="pb-10">
      <header className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="display-lg">Обране.</h1>
          {!loading && (
            <p className="mt-2 text-[15px] text-ink-2">
              {products.length} {plural(products.length, productForms)}
            </p>
          )}
        </div>
        {favorites.length > 0 && (
          <button type="button" onClick={clearFavorites} className="link-more text-[15px]">
            Очистити список
          </button>
        )}
      </header>

      {loading ? (
        <ProductGridSkeleton count={8} />
      ) : (
        <ProductList products={paginatedProducts} colVariant="2" wide />
      )}

      {totalPages > 1 && (
        <nav aria-label="Сторінки" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              type="button"
              onClick={() => {
                setCurrentPage(p);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              aria-current={p === currentPage ? 'page' : undefined}
              className={`h-11 min-w-11 rounded-full px-3 text-[15px] font-medium transition-colors ${
                p === currentPage ? 'bg-ink text-white' : 'bg-white hover:bg-line-soft'
              }`}
            >
              {p}
            </button>
          ))}
        </nav>
      )}
    </div>
  );
}
