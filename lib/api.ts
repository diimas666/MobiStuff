// lib/api.ts — серверні вибірки для сторінок (без HTTP-запиту до власного API)
import { unstable_cache } from 'next/cache';
import { queryProducts, queryProductFacets } from '@/lib/queryProducts';
import { CARD_FIELDS } from '@/lib/storefront';

export interface ProductFilters {
  brand?: string;
  phone?: string;
  minPrice?: string;
  maxPrice?: string;
  isTrending?: string;
  onSale?: string;
  sort?: string;
}

export const fetchProducts = unstable_cache(
  async (category?: string, subcategory?: string, filters?: ProductFilters) =>
    queryProducts({ category, subcategory, ...filters }, CARD_FIELDS),
  ['products-cards-v1'],
  { revalidate: 300, tags: ['products'] }
);

export const fetchProductFacets = unstable_cache(
  async (category: string, subcategory: string) => queryProductFacets(category, subcategory),
  ['facets-v2'],
  { revalidate: 300, tags: ['products'] }
);
