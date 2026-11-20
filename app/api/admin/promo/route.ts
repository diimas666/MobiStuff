import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/app/api/models/PromoCode';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { normalizeCode } from '@/lib/promo';

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const items = await PromoCode.find().sort({ createdAt: -1 }).lean();
  return NextResponse.json({ items });
}

/** Новий промокод */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const b = await req.json().catch(() => null);
  const code = normalizeCode(b?.code);
  const type = b?.type === 'fixed' ? 'fixed' : 'percent';
  const value = Math.round(Number(b?.value));
  if (code.length < 3) return NextResponse.json({ error: 'Код — від 3 символів (літери, цифри)' }, { status: 400 });
  if (!(value > 0) || (type === 'percent' && value > 90)) {
    return NextResponse.json({ error: type === 'percent' ? 'Знижка від 1 до 90%' : 'Вкажіть суму знижки' }, { status: 400 });
  }
  const expiresAt = b?.expiresAt && !Number.isNaN(Date.parse(b.expiresAt)) ? new Date(`${String(b.expiresAt).slice(0, 10)}T23:59:59`) : undefined;
  await dbConnect();
  try {
    const item = await PromoCode.create({
      code,
      type,
      value,
      minTotal: Math.max(0, Math.round(Number(b?.minTotal) || 0)),
      maxUses: Math.max(0, Math.round(Number(b?.maxUses) || 0)),
      expiresAt,
      note: typeof b?.note === 'string' ? b.note.slice(0, 200) : undefined,
    });
    return NextResponse.json({ item }, { status: 201 });
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return NextResponse.json({ error: 'Такий код уже є' }, { status: 400 });
    throw e;
  }
}
