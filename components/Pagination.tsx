import Link from 'next/link';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  hrefFor: (page: number) => string;
}

export default function Pagination({ page, totalPages, hrefFor }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1).filter(
    (p) => p === 1 || p === totalPages || Math.abs(p - page) <= 1
  );

  const base =
    'inline-flex h-11 min-w-11 items-center justify-center rounded-full px-3 text-[15px] font-medium transition-colors';

  return (
    <nav aria-label="Сторінки" className="mt-10 flex flex-wrap items-center justify-center gap-1.5">
      {page > 1 ? (
        <Link href={hrefFor(page - 1)} className={`${base} bg-white hover:bg-line-soft`} aria-label="Попередня сторінка">
          <ChevronLeft className="h-5 w-5" />
        </Link>
      ) : null}
      {pages.map((p, i) => {
        const gap = i > 0 && p - pages[i - 1] > 1;
        return (
          <span key={p} className="flex items-center gap-1.5">
            {gap && <span className="px-1 text-ink-3">…</span>}
            <Link
              href={hrefFor(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`${base} ${p === page ? 'bg-ink text-white' : 'bg-white hover:bg-line-soft'}`}
            >
              {p}
            </Link>
          </span>
        );
      })}
      {page < totalPages ? (
        <Link href={hrefFor(page + 1)} className={`${base} bg-white hover:bg-line-soft`} aria-label="Наступна сторінка">
          <ChevronRight className="h-5 w-5" />
        </Link>
      ) : null}
    </nav>
  );
}
