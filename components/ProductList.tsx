'use client';

import ProductCard from './ProductCard';
import { Product } from '@/interface/product';

interface Props {
  products: Product[];
  colVariant?: '1' | '2';
}

export default function ProductList({ products, colVariant = '2' }: Props) {
  const gridClass =
  colVariant === '2'
    ? 'grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]'
    : 'grid-cols-1';


  return (
    <div className={`grid gap-4 ${gridClass}`}>
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product._id || product.id} product={product} />
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">
          Товари не знайдено.
        </p>
      )}
    </div>
  );
}
