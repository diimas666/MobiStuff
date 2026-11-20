import { NextResponse } from 'next/server';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import { verifyOrderAccessToken } from '@/lib/orderAccess';
import { getBalance } from '@/lib/loyalty';
import { getStoreSettings } from '@/lib/storeSettings';

/** Бали кешбеку для застосунку: номер + ключ, отриманий кодом з SMS */
export async function POST(req: Request) {
  const b = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof b?.phone === 'string' ? b.phone : '');
  if (!phone || !verifyOrderAccessToken(phone, b?.token)) return NextResponse.json({ error: 'Немає доступу' }, { status: 401 });
  const [loyalty, s] = await Promise.all([getBalance(phone), getStoreSettings()]);
  return NextResponse.json({ balance: loyalty.balance, history: loyalty.history.slice(0, 20), cashbackPercent: s.cashbackPercent ?? 3, maxPointsPercent: s.maxPointsPercent ?? 30 });
}
