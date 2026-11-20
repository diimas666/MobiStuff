import { NextResponse } from 'next/server';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { createOrderAccessToken } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';
import { verifyOtp } from '@/lib/otp';

/** Перевірка коду → ключ доступу до історії замовлень цього номера (застосунок) */
export async function POST(req: Request) {
  if (rateLimited(req, 'otp-verify', 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof body?.phone === 'string' ? body.phone : '');
  const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : '';
  if (!phone || code.length !== 6) return NextResponse.json({ error: 'Введіть 6 цифр з SMS' }, { status: 400 });
  const r = await verifyOtp(phone, code);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  return NextResponse.json({ ordersToken: createOrderAccessToken(phone) });
}
