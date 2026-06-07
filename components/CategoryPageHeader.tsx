import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface CategoryPageHeaderProps {
  categoryTitle: string;
  subcategoryTitle: string;
  productCount?: number;
}

export default function CategoryPageHeader({
  categoryTitle,
  subcategoryTitle,
  productCount,
}: CategoryPageHeaderProps) {
  return (
    <header className="mb-6">
      <nav
        aria-label="Навігація"
        className="flex flex-wrap items-center gap-1 text-sm text-gray-500 mb-4 sm:mb-5"
      >
        <Link href="/" className="hover:text-green-600 transition">
          Головна
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <Link href="/catalog" className="hover:text-green-600 transition">
          Каталог
        </Link>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <span className="text-gray-600">{categoryTitle}</span>
        <ChevronRight className="w-3.5 h-3.5 shrink-0 text-gray-400" />
        <span className="font-medium text-gray-900 line-clamp-1">{subcategoryTitle}</span>
      </nav>

      <div className="flex items-start gap-3">
        <span className="w-1 h-12 sm:h-14 rounded-full bg-gradient-to-b from-green-400 to-green-600 shrink-0" />
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-green-600 mb-1">
            {categoryTitle}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
            {subcategoryTitle}
          </h1>
          {productCount !== undefined && productCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">
              {productCount} {productCount === 1 ? 'товар' : productCount < 5 ? 'товари' : 'товарів'} в наявності
            </p>
          )}
        </div>
      </div>
    </header>
  );
}
