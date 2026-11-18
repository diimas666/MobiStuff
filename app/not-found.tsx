import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="mx-auto max-w-2xl py-20 text-center sm:py-28">
      <p className="text-[120px] leading-none font-semibold tracking-[-0.06em] text-line sm:text-[180px]">404</p>
      <h1 className="display-md mt-4">Такої сторінки немає.</h1>
      <p className="lead mt-4">Можливо, товар закінчився або посилання застаріло. Почніть з каталогу.</p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
        <Link href="/catalog" className="btn-primary btn-lg">
          Перейти до каталогу
        </Link>
        <Link href="/" className="link-more text-[17px]">
          На головну
          <ChevronRight className="h-4 w-4" />
        </Link>
      </div>
    </div>
  );
}
