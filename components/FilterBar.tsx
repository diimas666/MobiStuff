'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterBarProps {
  availableBrands?: string[];
  priceBounds?: { min: number; max: number };
  variant?: 'light' | 'dark';
}

export default function FilterBar({
  availableBrands,
  priceBounds,
  variant = 'light',
}: FilterBarProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();

  const brand = searchParams.get('brand') || '';
  const minPriceParam = searchParams.get('minPrice');
  const maxPriceParam = searchParams.get('maxPrice');
  const isTrending = searchParams.get('isTrending') === 'true';
  const onSale = searchParams.get('onSale') === 'true';
  const sort = searchParams.get('sort') || '';
  const cols = searchParams.get('cols') || '2';

  const initialBounds = priceBounds ?? { min: 0, max: 5000 };

  const [brands, setBrands] = useState<string[]>(availableBrands ?? []);
  const [bounds, setBounds] = useState(initialBounds);
  const [minPrice, setMinPrice] = useState(
    minPriceParam ? Number(minPriceParam) : initialBounds.min
  );
  const [maxPrice, setMaxPrice] = useState(
    maxPriceParam ? Number(maxPriceParam) : initialBounds.max
  );

  useEffect(() => {
    if (availableBrands) setBrands(availableBrands);
    if (priceBounds) setBounds(priceBounds);
  }, [availableBrands, priceBounds]);

  useEffect(() => {
    if (availableBrands && priceBounds) return;

    const match = pathname.match(/^\/category\/([^/]+)\/([^/]+)/);
    if (!match) return;

    const [, category, subcategory] = match;
    fetch(`/api/products/facets?category=${category}&subcategory=${subcategory}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.brands) setBrands(data.brands);
        if (typeof data.minPrice === 'number' && typeof data.maxPrice === 'number') {
          const nextBounds = {
            min: data.minPrice,
            max: Math.max(data.maxPrice, data.minPrice + 1),
          };
          setBounds(nextBounds);
          if (!minPriceParam) setMinPrice(nextBounds.min);
          if (!maxPriceParam) setMaxPrice(nextBounds.max);
        }
      })
      .catch(() => {});
  }, [pathname, availableBrands, priceBounds, minPriceParam, maxPriceParam]);

  useEffect(() => {
    if (minPriceParam) setMinPrice(Number(minPriceParam));
    else setMinPrice(bounds.min);
    if (maxPriceParam) setMaxPrice(Number(maxPriceParam));
    else setMaxPrice(bounds.max);
  }, [minPriceParam, maxPriceParam, bounds.min, bounds.max]);

  const priceFilterActive =
    (minPriceParam && Number(minPriceParam) > bounds.min) ||
    (maxPriceParam && Number(maxPriceParam) < bounds.max);

  const hasActiveFilters =
    brand || priceFilterActive || isTrending || onSale || sort;

  const isDark = variant === 'dark';
  const selectClass = isDark
    ? 'appearance-none border border-white/15 bg-white/10 text-white rounded-xl px-3 py-2.5 text-sm w-full pr-10 focus:outline-none focus:ring-2 focus:ring-green-500/40 focus:border-green-500/30'
    : 'appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500';
  const labelClass = isDark ? 'text-sm text-gray-400 mb-1' : 'text-sm text-gray-600 mb-1';
  const sectionLabelClass = isDark ? 'text-sm text-gray-400' : 'text-sm text-gray-600';
  const checkboxLabelClass = isDark
    ? 'flex items-center gap-2 text-sm cursor-pointer text-gray-300'
    : 'flex items-center gap-2 text-sm cursor-pointer';
  const checkboxClass = isDark
    ? 'rounded border-white/20 bg-white/10 text-green-500 focus:ring-green-500/40'
    : 'rounded border-gray-300 text-green-500 focus:ring-green-500';
  const submitClass = isDark
    ? 'w-full bg-green-500 text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-green-600 transition shadow-lg'
    : 'w-full bg-black text-white px-5 py-2.5 rounded-md text-sm hover:bg-gray-800 transition shadow';
  const resetClass = isDark
    ? 'inline-block mt-3 text-sm text-green-400 hover:text-green-300 transition'
    : 'inline-block mt-3 text-sm text-green-600 hover:underline';
  const chevronClass = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <>
      <form className="flex flex-col gap-4" method="GET">
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="cols" value={cols} />
        {priceFilterActive || minPrice !== bounds.min || maxPrice !== bounds.max ? (
          <>
            <input type="hidden" name="minPrice" value={minPrice} />
            <input type="hidden" name="maxPrice" value={maxPrice} />
          </>
        ) : null}

        <div className="relative flex flex-col">
          <label className={labelClass}>Сортування</label>
          <select name="sort" defaultValue={sort} className={selectClass}>
            <option value="">За замовчуванням</option>
            <option value="price-asc">Ціна: від дешевих</option>
            <option value="price-desc">Ціна: від дорогих</option>
            <option value="newest">Спочатку новинки</option>
            <option value="title-asc">За назвою А–Я</option>
          </select>
          <div className={`pointer-events-none absolute right-3 bottom-2.5 ${chevronClass}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="relative flex flex-col">
          <label className={labelClass}>Бренд</label>
          <select name="brand" defaultValue={brand} className={selectClass}>
            <option value="">Усі бренди</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className={`pointer-events-none absolute right-3 bottom-2.5 ${chevronClass}`}>
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col">
          <label className={isDark ? 'text-sm text-gray-400 mb-2' : 'text-sm text-gray-600 mb-2'}>
            Ціна, грн
          </label>
          <PriceRangeSlider
            min={bounds.min}
            max={bounds.max}
            minValue={minPrice}
            maxValue={maxPrice}
            onChange={(min, max) => {
              setMinPrice(min);
              setMaxPrice(max);
            }}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className={sectionLabelClass}>Додатково</span>
          <label className={checkboxLabelClass}>
            <input
              type="checkbox"
              name="onSale"
              value="true"
              defaultChecked={onSale}
              className={checkboxClass}
            />
            Зі знижкою
          </label>
          <label className={checkboxLabelClass}>
            <input
              type="checkbox"
              name="isTrending"
              value="true"
              defaultChecked={isTrending}
              className={checkboxClass}
            />
            Тренд
          </label>
        </div>

        <button type="submit" className={submitClass}>
          Застосувати
        </button>
      </form>

      {hasActiveFilters && (
        <Link href={`${pathname}?page=1&cols=${cols}`} className={resetClass}>
          Скинути фільтри
        </Link>
      )}
    </>
  );
}
