import { NextResponse } from 'next/server';
import { getProductByHandle } from '@/lib/getProduct';
import { getCrossSell } from '@/lib/crossSell';
import { safe } from '@/lib/safeData';

/** Доповнення до товару (для кошика): ?handle=… &exclude=h1,h2 */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const handle = (url.searchParams.get('handle') || '').slice(0, 200);
  const exclude = new Set((url.searchParams.get('exclude') || '').split(',').slice(0, 50));
  const product = handle ? await safe(getProductByHandle(handle), null, 'cross-sell product') : null;
  if (!product) return NextResponse.json({ items: [] });
  const items = (await safe(getCrossSell(product, 10), [], 'cross-sell')).filter((p) => !exclude.has(p.handle)).slice(0, 6);
  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=3600' } });
}
