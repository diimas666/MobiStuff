'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowUpRight, Loader2, Search, X } from 'lucide-react';
import ProductImage from '@/components/ProductImage';
import { trackSearch } from '@/lib/analytics';
import { formatPrice } from '@/lib/format';
import { popularItems } from '@/data/popularAndTrending';

interface SearchBarProps {
  setIsSearchOpen: (open: boolean) => void;
}

interface Result {
  id: string;
  title: string;
  handle: string;
  image: string;
  price?: number;
  oldPrice?: number;
  brand?: string;
}

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function highlight(text: string, keyword: string) {
  const k = keyword.trim();
  if (!k) return text;
  return text.split(new RegExp(`(${escapeRegex(k)})`, 'gi')).map((part, i) =>
    part.toLowerCase() === k.toLowerCase() ? (
      <strong key={i} className="font-semibold text-ink">
        {part}
      </strong>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

/** Пошук на всю ширину під хедером (як на apple.com): великий інпут, швидкі посилання, результати з фото */
export default function SearchBar({ setIsSearchOpen }: SearchBarProps) {
  const [search, setSearch] = useState('');
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const query = search.trim();

  const close = () => setIsSearchOpen(false);

  useEffect(() => {
    inputRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setIsSearchOpen(false);
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [setIsSearchOpen]);

  useEffect(() => {
    setActive(-1);
    if (query.length < 2) {
      setResults([]);
      setError(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ctrl = new AbortController();
    const t = setTimeout(() => {
      fetch(`/api/search?q=${encodeURIComponent(query)}`, { signal: ctrl.signal })
        .then((res) => {
          if (!res.ok) throw new Error();
          return res.json();
        })
        .then((data: Result[]) => {
          setResults(data);
          setError(null);
        })
        .catch((e) => {
          if (e?.name === 'AbortError') return;
          setError('Пошук тимчасово недоступний. Спробуйте ще раз.');
          setResults([]);
        })
        .finally(() => setLoading(false));
    }, 220);
    return () => {
      clearTimeout(t);
      ctrl.abort();
    };
  }, [query]);

  const go = (handle: string) => {
    trackSearch(query);
    close();
    router.push(`/product/${handle}`);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!results.length) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((i) => (i + 1) % results.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
    }
  };

  return (
    <>
      <div className="fixed inset-x-0 top-[60px] bottom-0 z-40 bg-ink/20 backdrop-blur-[2px] fade-in sm:top-[64px]" onClick={close} aria-hidden />
      <div className="search-panel absolute inset-x-0 top-full z-50" role="dialog" aria-label="Пошук товарів">
        <div className="mx-auto w-full max-w-[760px] px-4 pt-3 pb-6 sm:px-6 sm:pt-5 sm:pb-8">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              // Обраний стрілками товар — відкриваємо його, інакше — усі результати
              const pick = active >= 0 ? results[active] : undefined;
              if (pick) go(pick.handle);
              else if (query.trim().length >= 2) {
                trackSearch(query);
                close();
                router.push(`/search?q=${encodeURIComponent(query.trim())}`);
              }
            }}
            className="flex items-center gap-3 border-b border-line pb-3"
          >
            <Search className="h-6 w-6 shrink-0 text-ink-3" strokeWidth={1.75} />
            <input
              ref={inputRef}
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Пошук: навушники, AirPods, Type-C…"
              className="min-w-0 flex-1 bg-transparent text-[20px] font-medium tracking-tight text-ink placeholder:text-ink-3 outline-none sm:text-[24px] [&::-webkit-search-cancel-button]:hidden"
              autoComplete="off"
              enterKeyHint="search"
              aria-label="Пошук товарів"
              aria-controls="search-results"
            />
            {loading ? <Loader2 className="h-5 w-5 shrink-0 animate-spin text-ink-3" /> : null}
            <button type="button" onClick={close} className="hdr-icon -mr-2 shrink-0" aria-label="Закрити пошук">
              <X className="h-5 w-5" />
            </button>
          </form>

          <div id="search-results" className="max-h-[calc(100dvh-170px)] overflow-y-auto overscroll-contain pt-4">
            {query.length < 2 && (
              <div className="fade-in">
                <p className="mb-3 text-[12px] font-medium text-ink-3">Популярне</p>
                <ul className="space-y-0.5">
                  {popularItems.slice(0, 6).map((item) => (
                    <li key={item.id}>
                      <Link
                        href={`/category/${item.categorySlug}/${item.subcategorySlug}`}
                        onClick={close}
                        className="group flex items-center gap-3 rounded-xl px-2 py-2 text-[15px] text-ink-2 transition-colors hover:bg-canvas hover:text-ink"
                      >
                        <ArrowUpRight className="h-4 w-4 text-ink-3 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                        {item.title}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {error && <p className="px-2 py-3 text-[15px] text-sale">{error}</p>}

            {query.length >= 2 && !loading && !error && results.length === 0 && (
              <div className="px-2 py-6 text-center">
                <p className="text-[17px] font-medium">Нічого не знайшли за «{query}»</p>
                <p className="mt-1 text-[14px] text-ink-2">Спробуйте іншу назву або подивіться весь каталог.</p>
                <Link href="/catalog" onClick={close} className="btn-ghost mt-4">
                  Відкрити каталог
                </Link>
              </div>
            )}

            {results.length > 0 && (
              <>
                <p className="mb-2 text-[12px] font-medium text-ink-3">Товари</p>
                <ul className="space-y-1" role="listbox">
                  {results.map((p, i) => (
                    <li key={p.id || p.handle} role="option" aria-selected={i === active}>
                      <button
                        type="button"
                        onClick={() => go(p.handle)}
                        onMouseEnter={() => setActive(i)}
                        className={`flex w-full items-center gap-4 rounded-2xl p-2 text-left transition-colors ${
                          i === active ? 'bg-canvas' : ''
                        }`}
                      >
                        <span className="relative h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-canvas sm:h-[72px] sm:w-[72px]">
                          {p.image ? (
                            <ProductImage src={p.image} alt="" fill sizes="72px" className="object-contain p-1.5 mix-blend-multiply" />
                          ) : null}
                        </span>
                        <span className="min-w-0 flex-1">
                          {p.brand ? <span className="block text-[12px] text-ink-3">{p.brand}</span> : null}
                          <span className="line-clamp-2 text-[15px] leading-snug text-ink-2">{highlight(p.title, query)}</span>
                        </span>
                        {typeof p.price === 'number' ? (
                          <span className="shrink-0 text-right">
                            <span className="block text-[15px] font-semibold text-ink">{formatPrice(p.price)}</span>
                            {p.oldPrice && p.oldPrice > p.price ? (
                              <span className="block text-[12px] text-ink-3 line-through">{formatPrice(p.oldPrice)}</span>
                            ) : null}
                          </span>
                        ) : null}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
