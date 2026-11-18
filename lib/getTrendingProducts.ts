import { findCards } from '@/lib/storefront';
import { Product } from '@/interface/product';

// lib/getTrendingProducts.ts
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  return findCards({ isTrending: true }, { limit });
}
