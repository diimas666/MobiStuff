import { NextResponse } from 'next/server';
import { trackParcel } from '@/lib/novaposhta';
import { rateLimited } from '@/lib/rateLimit';

/** Відстеження посилки: ?ttn=20450012345678 [&phone=0991234567] */
export async function GET(req: Request) {
  if (rateLimited(req, 'tracking', 30, 10 * 60 * 1000)) return NextResponse.json({ error: 'Забагато запитів. Спробуйте за кілька хвилин.' }, { status: 429 });
  const url = new URL(req.url);
  const ttn = (url.searchParams.get('ttn') || '').replace(/\D/g, '');
  const phone = (url.searchParams.get('phone') || '').replace(/\D/g, '').slice(-12);
  if (!/^\d{10,20}$/.test(ttn)) return NextResponse.json({ error: 'ТТН — це 14 цифр, напр. 20450012345678' }, { status: 400 });
  try {
    const status = await trackParcel(ttn, phone || undefined);
    // Код 3 — Нова Пошта не знає такого номера
    if (!status || status.statusCode === 3) return NextResponse.json({ error: 'Посилку з таким номером не знайдено. Перевірте цифри ТТН.' }, { status: 404 });
    return NextResponse.json(status, { headers: { 'Cache-Control': 'private, max-age=60' } });
  } catch (e) {
    console.error('tracking failed', e);
    return NextResponse.json({ error: 'Нова Пошта зараз не відповідає. Спробуйте пізніше.' }, { status: 502 });
  }
}
