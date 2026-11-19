import { NextResponse } from 'next/server';
import { randomInt } from 'crypto';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import OtpCode from '@/app/api/models/OtpCode';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { hashOtp } from '@/lib/orderAccess';
import { keyLimited, rateLimited } from '@/lib/rateLimit';
import { sendSms } from '@/lib/customerNotify';
import { SITE_NAME } from '@/lib/site';

const TTL_MS = 10 * 60 * 1000;

/**
 * Код для входу в історію замовлень на новому пристрої.
 * Відповідь однакова незалежно від того, чи є замовлення на номері (не видаємо, чиї це номери);
 * SMS надсилаємо лише якщо замовлення є — не витрачаємо гроші на випадкові номери.
 */
export async function POST(req: Request) {
  if (!process.env.TURBOSMS_TOKEN) {
    return NextResponse.json({ error: 'Вхід за кодом тимчасово недоступний' }, { status: 503 });
  }
  if (rateLimited(req, 'otp-req', 5, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Забагато спроб. Спробуйте через 15 хвилин.' }, { status: 429 });
  }

  const body = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof body?.phone === 'string' ? body.phone : '');
  if (!phone) return NextResponse.json({ error: 'Невірний номер телефону' }, { status: 400 });
  if (keyLimited(`otp-phone:${phone}`, 3, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Код уже надіслано. Новий можна отримати через 15 хвилин.' }, { status: 429 });
  }

  await dbConnect();
  const hasOrders = await Order.exists({ phone: { $in: [phone, phone.slice(1)] } });
  if (hasOrders) {
    const code = String(randomInt(0, 1_000_000)).padStart(6, '0');
    await OtpCode.deleteMany({ phone });
    await OtpCode.create({ phone, codeHash: hashOtp(phone, code), expiresAt: new Date(Date.now() + TTL_MS) });
    await sendSms(phone, `${SITE_NAME}: код для перегляду замовлень ${code}. Нікому його не повідомляйте.`);
  }

  return NextResponse.json({ ok: true, ttlSeconds: TTL_MS / 1000 });
}
