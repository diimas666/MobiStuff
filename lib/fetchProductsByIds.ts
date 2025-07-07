// lib/fetchProductsByIds.ts
import { Product } from '@/interface/product';

export async function fetchProductsByIds(ids: string[]): Promise<Product[]> {
  const res = await fetch('/api/products/byIds', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ ids }),
  });

  if (!res.ok) {
    console.error('❌ Не удалось загрузить избранные товары');
    return [];
  }

  return res.json();
}
