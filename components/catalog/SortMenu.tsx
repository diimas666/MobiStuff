'use client';

import { useEffect, useRef, useState } from 'react';
import { ArrowUpDown, Check, ChevronDown } from 'lucide-react';
import { useFilters } from './FilterContext';

export const SORT_OPTIONS = [
  { value: '', label: 'Рекомендовані' },
  { value: 'price-asc', label: 'Спочатку дешевші' },
  { value: 'price-desc', label: 'Спочатку дорожчі' },
  { value: 'newest', label: 'Новинки' },
  { value: 'title-asc', label: 'За назвою' },
];

/** Сортування — компактне меню-поповер замість системного select */
export default function SortMenu({ align = 'right' }: { align?: 'left' | 'right' }) {
  const { params, setParams } = useFilters();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === (params.get('sort') ?? '')) ?? SORT_OPTIONS[0];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('pointerdown', onDown);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Сортування: ${current.label}`}
        className="chip relative justify-center gap-1.5 whitespace-nowrap max-sm:h-10 max-sm:w-10 max-sm:px-0"
      >
        <ArrowUpDown className="h-4 w-4 sm:hidden" />
        {current.value && <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-accent sm:hidden" />}
        <span className="hidden text-ink-2 sm:inline">Сортування:</span>
        <span className="hidden sm:inline">{current.label}</span>
        <ChevronDown className={`hidden h-4 w-4 text-ink-3 transition-transform sm:block ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Сортування"
          className={`pop-in absolute z-30 mt-2 w-60 overflow-hidden rounded-2xl border border-line-soft bg-white/95 p-1.5 shadow-[0_18px_40px_-12px_rgba(0,0,0,.25)] backdrop-blur-xl ${
            align === 'right' ? 'right-0 origin-top-right' : 'left-0 origin-top-left'
          }`}
        >
          {SORT_OPTIONS.map((o) => {
            const selected = o.value === current.value;
            return (
              <li key={o.value || 'default'}>
                <button
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => {
                    setOpen(false);
                    setParams({ sort: o.value || null });
                  }}
                  className={`flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-left text-[15px] transition-colors hover:bg-canvas ${
                    selected ? 'font-medium text-ink' : 'text-ink-2'
                  }`}
                >
                  {o.label}
                  {selected && <Check className="h-4 w-4 text-accent" strokeWidth={2.5} />}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
