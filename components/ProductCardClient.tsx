// components/ProductCardClient.tsx
'use client';

import ProductCard from './ProductCard';
import { Product } from '@/interface/product';

export default function ProductCardClient({ product }: { product: Product }) {
  return <ProductCard product={product} />;
}
