import { NextResponse } from 'next/server';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { rateLimited } from '@/lib/rateLimit';
import { verifyOtp } from '@/lib/otp';
import { createCustomerSession, customerCookie } from '@/lib/customerSession';

/** Вхід у кабінет: телефон + код з SMS (код запитується через /api/orders/otp/request) */
export async function POST(req: Request) {
  if (rateLimited(req, 'account-login', 20, 15 * 60 * 1000)) return NextResponse.json({ error: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 });
  const b = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof b?.phone === 'string' ? b.phone : '');
  const code = typeof b?.code === 'string' ? b.code.replace(/\D/g, '') : '';
  if (!phone || code.length !== 6) return NextResponse.json({ error: 'Введіть 6 цифр з SMS' }, { status: 400 });
  const r = await verifyOtp(phone, code);
  if (!r.ok) return NextResponse.json({ error: r.error }, { status: 400 });
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', customerCookie(createCustomerSession(phone)));
  return res;
}

/** Вихід */
export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.headers.set('Set-Cookie', customerCookie('', 0));
  return res;
}
