import { findCards } from '@/lib/storefront';
import type { Product } from '@/interface/product';

/** Товари з тієї ж кореневої категорії, без поточного */
export async function getRelatedProducts(
  categorySlug: string,
  excludeHandle: string,
  limit = 20
): Promise<Product[]> {
  if (!categorySlug) return [];

  return findCards({ categorySlug, handle: { $ne: excludeHandle } }, { limit });
}
