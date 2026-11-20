import type { Metadata } from 'next';
import Link from 'next/link';
import { Search } from 'lucide-react';
import ProductList from '@/components/ProductList';
import { findCards } from '@/lib/storefront';
import { safe } from '@/lib/safeData';

export const metadata: Metadata = {
  title: 'Пошук',
  robots: { index: false, follow: true },
};

const escapeRegex = (v: string) => v.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Сторінка результатів пошуку (з шапки, 404 тощо) */
export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q: raw = '' } = await searchParams;
  const q = String(raw).trim().slice(0, 80);
  const words = q.split(/\s+/).filter(Boolean).slice(0, 5);
  const products =
    q.length >= 2
      ? await safe(
          findCards(
            { $and: words.map((w) => ({ $or: [{ title: new RegExp(escapeRegex(w), 'i') }, { brand: new RegExp(escapeRegex(w), 'i') }] })) },
            { limit: 60, sort: { inStock: -1, isTrending: -1 } }
          ),
          [],
          'search'
        )
      : [];

  return (
    <div className="pb-10">
      <h1 className="display-lg">{q ? `«${q}»` : 'Пошук.'}</h1>
      <form action="/search" className="relative mt-6 max-w-xl">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-3" />
        <input name="q" type="search" defaultValue={q} placeholder="Навушники, павербанк, чохол…" aria-label="Пошук товарів" className="field h-[52px] rounded-full pl-12" />
      </form>
      {q ? <p className="mt-4 text-[15px] text-ink-2">{products.length ? `Знайдено ${products.length}` : 'Нічого не знайдено'}</p> : null}
      <div className="mt-8">
        <ProductList
          products={products}
          empty={
            q ? (
              <div className="panel px-6 py-14 text-center">
                <p className="text-[19px] font-semibold">Нічого не знайшли за «{q}»</p>
                <p className="mt-2 text-[15px] text-ink-2">Спробуйте інше слово або перегляньте каталог.</p>
                <Link href="/catalog" className="btn-primary mt-6">
                  Відкрити каталог
                </Link>
              </div>
            ) : null
          }
        />
      </div>
    </div>
  );
}
