import { findCards } from '@/lib/storefront';
import type { Product } from '@/interface/product';

export async function getProductsByCategory(
  categorySlug: string,
  subcategorySlug?: string,
  limit = 40
): Promise<Product[]> {

  const query: any = { categorySlug };

  if (subcategorySlug) {
    query.subcategorySlug = subcategorySlug;
  }

  return findCards(query, { limit });
}
