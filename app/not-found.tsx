import Link from 'next/link';
import type { Metadata } from 'next';
import { ChevronRight, Search } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Сторінку не знайдено',
  robots: { index: false },
};

const POPULAR = [
  { label: 'Навушники TWS', href: '/category/category-naushniki/category-bluetooth-stereo-garnituri-tws' },
  { label: 'Павербанки', href: '/category/category-akkumulyatori-i-powerbank/category-portativnie-batarei' },
  { label: 'Зарядки', href: '/category/category-zaryadki-i-kabeli/category-besprovodnie-zaryadnie-ustroystva' },
  { label: 'Кабелі', href: '/category/category-zaryadki-i-kabeli/category-lightning' },
  { label: 'Чохли для iPhone', href: '/category/category-chehli/category-apple' },
  { label: 'Акції', href: '/sale' },
];

/** 404: пошук і популярні розділи, щоб не губити покупця */
export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-16 text-center sm:py-24">
      <p className="text-[120px] leading-none font-semibold tracking-[-0.06em] text-line sm:text-[180px]" aria-hidden="true">
        404
      </p>
      <h1 className="display-md mt-4">Такої сторінки немає.</h1>
      <p className="lead mt-4">Можливо, товар закінчився або посилання застаріло. Знайдіть потрібне через пошук.</p>

      <form action="/search" className="relative mx-auto mt-8 max-w-md">
        <Search className="pointer-events-none absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 text-ink-3" />
        <input name="q" type="search" placeholder="Навушники, павербанк, чохол…" aria-label="Пошук товарів" className="field h-[52px] rounded-full pl-12" />
      </form>

      <div className="mt-8 flex flex-wrap justify-center gap-2">
        {POPULAR.map((p) => (
          <Link key={p.href} href={p.href} className="chip">
            {p.label}
          </Link>
        ))}
      </div>

      <Link href="/" className="link-more mt-10 inline-flex text-[17px]">
        На головну
        <ChevronRight className="h-4 w-4" />
      </Link>
    </div>
  );
}
