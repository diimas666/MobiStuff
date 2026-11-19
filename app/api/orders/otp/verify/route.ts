import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import OtpCode from '@/app/api/models/OtpCode';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { createOrderAccessToken, otpMatches } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';

const MAX_ATTEMPTS = 5;

/** Перевірка коду → ключ доступу до історії замовлень цього номера */
export async function POST(req: Request) {
  if (rateLimited(req, 'otp-verify', 20, 15 * 60 * 1000)) {
    return NextResponse.json({ error: 'Забагато спроб. Спробуйте пізніше.' }, { status: 429 });
  }
  const body = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof body?.phone === 'string' ? body.phone : '');
  const code = typeof body?.code === 'string' ? body.code.replace(/\D/g, '') : '';
  if (!phone || code.length !== 6) return NextResponse.json({ error: 'Введіть 6 цифр з SMS' }, { status: 400 });

  await dbConnect();
  const otp = await OtpCode.findOne({ phone, expiresAt: { $gt: new Date() } });
  if (!otp) return NextResponse.json({ error: 'Код недійсний або застарів. Запросіть новий.' }, { status: 400 });

  if (!otpMatches(phone, code, otp.codeHash)) {
    otp.attempts += 1;
    if (otp.attempts >= MAX_ATTEMPTS) await otp.deleteOne();
    else await otp.save();
    const left = MAX_ATTEMPTS - otp.attempts;
    return NextResponse.json(
      { error: left > 0 ? `Невірний код. Залишилось спроб: ${left}` : 'Забагато невірних спроб. Запросіть новий код.' },
      { status: 400 }
    );
  }

  await otp.deleteOne();
  return NextResponse.json({ ordersToken: createOrderAccessToken(phone) });
}
