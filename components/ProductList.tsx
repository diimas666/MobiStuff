'use client';

import ProductCard from './ProductCard';
import { Product } from '@/interface/product';

interface Props {
  products: Product[];
}

export default function ProductList({ products }: Props) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))]">
      {products.length > 0 ? (
        products.map((product) => (
          <ProductCard key={product._id} product={product} />
        ))
      ) : (
        <p className="col-span-full text-center text-gray-500">
          Товари не знайдено.
        </p>
      )}
    </div>
  );
}
