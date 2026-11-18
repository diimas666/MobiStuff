'use client';

import { useEffect, useState } from 'react';
import { SlidersHorizontal, X } from 'lucide-react';
import { useFilters } from '@/components/catalog/FilterContext';
import { plural, productForms } from '@/lib/format';

/** Кнопка «Фільтри» + нижній лист на мобільному. Фільтри застосовуються одразу. */
export default function FilterSheet({
  children,
  activeCount = 0,
  resultCount,
}: {
  children: React.ReactNode;
  activeCount?: number;
  resultCount?: number;
}) {
  const [open, setOpen] = useState(false);
  const { pending, reset } = useFilters();

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <>
      <button type="button" onClick={() => setOpen(true)} className="chip gap-2 md:hidden max-sm:px-3">
        <SlidersHorizontal className="h-4 w-4" />
        Фільтри
        {activeCount > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-accent px-1 text-[11px] text-white">
            {activeCount}
          </span>
        )}
      </button>

      {open && (
        <div className="fixed inset-0 z-[60] md:hidden" role="dialog" aria-modal="true" aria-label="Фільтри">
          <div className="fade-in absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="sheet-up absolute inset-x-0 bottom-0 flex max-h-[90dvh] flex-col rounded-t-[28px] bg-white">
            <div className="shrink-0 px-5 pt-3">
              <div className="mx-auto mb-3 h-1.5 w-10 rounded-full bg-line" />
              <div className="flex items-center justify-between pb-3">
                {activeCount > 0 ? (
                  <button type="button" onClick={reset} className="text-[15px] text-accent">
                    Скинути
                  </button>
                ) : (
                  <span className="w-[60px]" />
                )}
                <h2 className="text-[17px] font-semibold">Фільтри</h2>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-canvas"
                  aria-label="Закрити"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain border-t border-line-soft px-5 pt-4 pb-4">{children}</div>
            <div className="shrink-0 border-t border-line-soft px-5 pt-3 pb-[max(16px,env(safe-area-inset-bottom))]">
              <button type="button" onClick={() => setOpen(false)} className="btn-primary btn-lg w-full" disabled={pending}>
                {pending
                  ? 'Шукаємо…'
                  : typeof resultCount === 'number'
                    ? resultCount > 0
                      ? `Показати ${resultCount} ${plural(resultCount, productForms)}`
                      : 'Нічого не знайдено'
                    : 'Показати товари'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
