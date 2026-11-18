'use client';

import { X } from 'lucide-react';
import { formatPrice } from '@/lib/format';
import { useFilters } from './FilterContext';

/** Вибрані фільтри — чипи над товарами, кожен знімається одним дотиком */
export default function ActiveFilters() {
  const { params, setParams, reset } = useFilters();

  const chips: { key: string; label: string; clear: Record<string, null> }[] = [];
  const brand = params.get('brand');
  const phone = params.get('phone');
  const min = params.get('minPrice');
  const max = params.get('maxPrice');
  if (brand) chips.push({ key: 'brand', label: brand, clear: { brand: null } });
  if (phone) chips.push({ key: 'phone', label: phone, clear: { phone: null } });
  if (min || max) {
    const label = min && max ? `${formatPrice(Number(min))} – ${formatPrice(Number(max))}` : min ? `від ${formatPrice(Number(min))}` : `до ${formatPrice(Number(max))}`;
    chips.push({ key: 'price', label, clear: { minPrice: null, maxPrice: null } });
  }
  if (params.get('onSale') === 'true') chips.push({ key: 'sale', label: 'Зі знижкою', clear: { onSale: null } });
  if (params.get('isTrending') === 'true') chips.push({ key: 'hits', label: 'Хіти продажу', clear: { isTrending: null } });

  if (!chips.length) return null;

  return (
    <div className="mb-5 flex flex-wrap items-center gap-2">
      {chips.map((c) => (
        <button
          key={c.key}
          type="button"
          onClick={() => setParams(c.clear)}
          className="pop-in inline-flex items-center gap-1.5 rounded-full bg-ink py-1.5 pr-2.5 pl-3.5 text-[13px] font-medium text-white transition hover:bg-black"
          aria-label={`Прибрати фільтр: ${c.label}`}
        >
          {c.label}
          <X className="h-3.5 w-3.5 opacity-70" strokeWidth={2.5} />
        </button>
      ))}
      <button type="button" onClick={reset} className="px-2 text-[13px] font-medium text-accent hover:underline">
        Скинути все
      </button>
    </div>
  );
}

/** Порожній результат: з фільтрами — пропонуємо скинути, без — ведемо в каталог */
export function FilteredEmpty({ hasFilters }: { hasFilters: boolean }) {
  const { reset } = useFilters();
  return (
    <div className="panel flex flex-col items-center px-6 py-16 text-center">
      <p className="text-[19px] font-semibold tracking-tight">
        {hasFilters ? 'Немає товарів з такими фільтрами' : 'Тут поки порожньо'}
      </p>
      <p className="mt-2 max-w-sm text-[14px] text-ink-2">
        {hasFilters
          ? 'Спробуйте інший бренд або ширший діапазон цін.'
          : 'Товари цієї категорії скоро зʼявляться. Подивіться інші розділи каталогу.'}
      </p>
      {hasFilters ? (
        <button type="button" onClick={reset} className="btn-primary mt-6">
          Скинути фільтри
        </button>
      ) : (
        <a href="/catalog" className="btn-primary mt-6">
          Відкрити каталог
        </a>
      )}
    </div>
  );
}
