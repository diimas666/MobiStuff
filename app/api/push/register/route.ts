import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PushDevice from '@/app/api/models/PushDevice';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { verifyOrderAccessToken } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';

/**
 * Реєстрація пристрою для push. Номер прив'язується лише з ключем доступу до замовлень —
 * так ніхто не підпишеться на сповіщення про чужі замовлення.
 */
export async function POST(req: Request) {
  if (rateLimited(req, 'push-register', 30, 10 * 60 * 1000)) return NextResponse.json({ ok: false }, { status: 429 });
  const b = await req.json().catch(() => null);
  const token = typeof b?.token === 'string' ? b.token.trim() : '';
  if (!/^[a-f0-9]{64,200}$/i.test(token)) return NextResponse.json({ error: 'Невірний токен' }, { status: 400 });

  const phones: string[] = [];
  for (const item of Array.isArray(b?.phones) ? b.phones.slice(0, 5) : []) {
    const phone = normalizeUkrainianPhone(typeof item?.phone === 'string' ? item.phone : '');
    if (phone && verifyOrderAccessToken(phone, item?.token)) phones.push(phone);
  }

  await dbConnect();
  await PushDevice.updateOne(
    { token },
    { $set: { lastSeen: new Date(), platform: 'ios' }, ...(phones.length ? { $addToSet: { phones: { $each: phones } } } : {}) },
    { upsert: true }
  );
  return NextResponse.json({ ok: true, linked: phones.length });
}
