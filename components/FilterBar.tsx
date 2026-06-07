'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { ChevronDown } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';

interface FilterBarProps {
  availableBrands?: string[];
  priceBounds?: { min: number; max: number };
}

export default function FilterBar({ availableBrands, priceBounds }: FilterBarProps) {
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

  const selectClass =
    'appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm w-full pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500';

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
          <label className="text-sm text-gray-600 mb-1">Сортування</label>
          <select name="sort" defaultValue={sort} className={selectClass}>
            <option value="">За замовчуванням</option>
            <option value="price-asc">Ціна: від дешевих</option>
            <option value="price-desc">Ціна: від дорогих</option>
            <option value="newest">Спочатку новинки</option>
            <option value="title-asc">За назвою А–Я</option>
          </select>
          <div className="pointer-events-none absolute right-3 bottom-2.5 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="relative flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Бренд</label>
          <select name="brand" defaultValue={brand} className={selectClass}>
            <option value="">Усі бренди</option>
            {brands.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <div className="pointer-events-none absolute right-3 bottom-2.5 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-2">Ціна, грн</label>
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
          <span className="text-sm text-gray-600">Додатково</span>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="onSale"
              value="true"
              defaultChecked={onSale}
              className="rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            Зі знижкою
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input
              type="checkbox"
              name="isTrending"
              value="true"
              defaultChecked={isTrending}
              className="rounded border-gray-300 text-green-500 focus:ring-green-500"
            />
            Тренд
          </label>
        </div>

        <button
          type="submit"
          className="w-full bg-black text-white px-5 py-2.5 rounded-md text-sm hover:bg-gray-800 transition shadow"
        >
          Застосувати
        </button>
      </form>

      {hasActiveFilters && (
        <Link
          href={`${pathname}?page=1&cols=${cols}`}
          className="inline-block mt-3 text-sm text-green-600 hover:underline"
        >
          Скинути фільтри
        </Link>
      )}
    </>
  );
}
