import { NextResponse } from 'next/server';
import { checkPromo, PromoError } from '@/lib/promo';
import { rateLimited } from '@/lib/rateLimit';

/** Перевірка промокоду з кошика (сайт і застосунок) */
export async function POST(req: Request) {
  // Захист від перебору кодів
  if (rateLimited(req, 'promo', 20, 10 * 60 * 1000)) {
    return NextResponse.json({ error: 'Забагато спроб. Спробуйте за кілька хвилин.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const subtotal = Math.max(0, Math.round(Number(body?.total) || 0));
  try {
    const promo = await checkPromo(body?.code, subtotal);
    return NextResponse.json(promo);
  } catch (e) {
    if (e instanceof PromoError) return NextResponse.json({ error: e.message }, { status: 400 });
    console.error('promo validate failed', e);
    return NextResponse.json({ error: 'Не вдалося перевірити промокод' }, { status: 500 });
  }
}
