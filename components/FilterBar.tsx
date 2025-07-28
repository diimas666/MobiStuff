'use client';
import { useSearchParams, usePathname } from 'next/navigation';
import Link from 'next/link';
import { brands } from '@/data/brands'; // ✅ путь актуальный
import { ChevronDown } from 'lucide-react';

export default function FilterBar() {
  const searchParams = useSearchParams();
  const brand = searchParams.get('brand') || '';
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const cols = searchParams.get('cols') || '2';
  const pathname = usePathname();

  return (
    <>
      <form className="mb-4 flex flex-wrap gap-4 items-end" method="GET">
        <input type="hidden" name="page" value="1" />
        <input type="hidden" name="cols" value={cols} />

        {/* Бренд */}
        <div className="relative flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Бренд</label>
          <select
            name="brand"
            defaultValue={brand}
            className="appearance-none border border-gray-300 rounded-md px-3 py-2 text-sm w-[257px] pr-10 shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          >
            <option value="">Усі бренди</option>
            {brands.map((item) => (
              <option key={item.handle} value={item.handle}>
                {item.title}
              </option>
            ))}
          </select>

          {/* Кастомная стрелка */}
          <div className="pointer-events-none absolute right-3 bottom-2.5 text-gray-400">
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>

        {/* Ціна від */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Ціна від</label>
          <input
            type="number"
            name="minPrice"
            defaultValue={minPrice}
            placeholder="0"
            className="text-[16px] border border-gray-300 rounded-md px-3 py-2 text-sm w-[120px] shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Ціна до */}
        <div className="flex flex-col">
          <label className="text-sm text-gray-600 mb-1">Ціна до</label>
          <input
            type="number"
            name="maxPrice"
            defaultValue={maxPrice}
            placeholder="1000"
            className="text-[16px] border border-gray-300 rounded-md px-3 py-2 text-sm w-[120px] shadow-sm focus:outline-none focus:ring-2 focus:ring-black"
          />
        </div>

        {/* Кнопка */}
        <div className="flex flex-col">
          <button
            type="submit"
            className="bg-black text-white px-5 py-2 rounded-md text-sm hover:bg-gray-800 transition shadow"
          >
            Застосувати
          </button>
        </div>
      </form>

      {/* 🔄 Сброс фильтров */}
      {(brand || minPrice || maxPrice) && (
        <Link
          href={`${pathname}?page=1&cols=${cols}`}
          className="text-sm text-blue-600 hover:underline"
        >
          Скинути фільтри
        </Link>
      )}
    </>
  );
}
