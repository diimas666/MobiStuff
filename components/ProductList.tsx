import ProductCard from './ProductCard';
import { Product } from '@/interface/product';
import { SearchX } from 'lucide-react';

interface Props {
  products: Product[];
  colVariant?: '1' | '2';
  wide?: boolean;
}

export default function ProductList({ products, colVariant = '2', wide = false }: Props) {
  if (products.length === 0) {
    return (
      <div className="panel flex flex-col items-center px-6 py-16 text-center">
        <SearchX className="mb-4 h-10 w-10 text-ink-3" strokeWidth={1.5} />
        <p className="text-lg font-semibold">Нічого не знайдено</p>
        <p className="mt-1 max-w-sm text-sm text-ink-2">
          Спробуйте змінити фільтри або подивіться інші категорії.
        </p>
      </div>
    );
  }

  const cols =
    colVariant === '1'
      ? 'grid-cols-1 min-[420px]:grid-cols-1'
      : 'grid-cols-2';
  const desktop = wide
    ? 'md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5'
    : 'md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4';

  return (
    <div className={`grid gap-3 sm:gap-4 ${cols} ${desktop}`}>
      {products.map((product, i) => (
        <ProductCard key={product._id || product.id} product={product} priority={i < 4} />
      ))}
    </div>
  );
}
