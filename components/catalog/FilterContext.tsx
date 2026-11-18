'use client';

import { createContext, useCallback, useContext, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';

type Patch = Record<string, string | null | undefined>;

interface FilterCtx {
  params: URLSearchParams;
  pending: boolean;
  /** Змінює параметри URL і миттєво застосовує фільтр (без кнопки «Застосувати») */
  setParams: (patch: Patch) => void;
  reset: () => void;
}

const Ctx = createContext<FilterCtx | null>(null);

/** Параметри, які не є фільтрами і зберігаються при скиданні */
const KEEP_ON_RESET = ['cols'];

export function FilterProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [pending, startTransition] = useTransition();

  const go = useCallback(
    (next: URLSearchParams) => {
      next.delete('page');
      const qs = next.toString();
      startTransition(() => router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false }));
    },
    [pathname, router]
  );

  const setParams = useCallback(
    (patch: Patch) => {
      const next = new URLSearchParams(searchParams.toString());
      Object.entries(patch).forEach(([k, v]) => {
        if (v === null || v === undefined || v === '') next.delete(k);
        else next.set(k, v);
      });
      go(next);
    },
    [searchParams, go]
  );

  const reset = useCallback(() => {
    const next = new URLSearchParams();
    KEEP_ON_RESET.forEach((k) => {
      const v = searchParams.get(k);
      if (v) next.set(k, v);
    });
    go(next);
  }, [searchParams, go]);

  return (
    <Ctx.Provider value={{ params: new URLSearchParams(searchParams.toString()), pending, setParams, reset }}>
      {children}
    </Ctx.Provider>
  );
}

export function useFilters() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useFilters must be used inside FilterProvider');
  return ctx;
}

/** Обгортка результатів: плавно приглушує список, поки завантажуються нові товари */
export function FilterResults({ children }: { children: React.ReactNode }) {
  const { pending } = useFilters();
  return (
    <div aria-busy={pending} className={`transition-opacity duration-300 ${pending ? 'pointer-events-none opacity-40' : 'opacity-100'}`}>
      {children}
    </div>
  );
}
