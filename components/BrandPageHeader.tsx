import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface BrandPageHeaderProps {
  brandTitle: string;
  productCount?: number;
}

export default function BrandPageHeader({
  brandTitle,
  productCount,
}: BrandPageHeaderProps) {
  return (
    <header className="mb-5 sm:mb-6">
      <nav
        aria-label="Навігація"
        className="mb-4 flex flex-wrap items-center gap-1 text-sm text-gray-500 sm:mb-5"
      >
        <Link href="/" className="transition hover:text-green-600">
          Головна
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <Link href="/catalog" className="transition hover:text-green-600">
          Каталог
        </Link>
        <ChevronRight className="h-3.5 w-3.5 shrink-0 text-gray-400" />
        <span className="line-clamp-1 font-medium text-gray-900">{brandTitle}</span>
      </nav>

      {productCount !== undefined && productCount > 0 && (
        <p className="text-sm text-gray-500">
          {productCount}{' '}
          {productCount === 1
            ? 'товар'
            : productCount < 5
              ? 'товари'
              : 'товарів'}{' '}
          бренду {brandTitle}
        </p>
      )}
    </header>
  );
}
