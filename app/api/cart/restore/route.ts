import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import CartDraft from '@/app/api/models/CartDraft';

/** Відновлення кошика за посиланням з нагадування */
export async function GET(req: Request) {
  const token = (new URL(req.url).searchParams.get('token') || '').slice(0, 40);
  if (!/^[\w-]{10,40}$/.test(token)) return NextResponse.json({ items: [] }, { status: 400 });
  await dbConnect();
  const d = await CartDraft.findOne({ restoreToken: token }).select('items promoCode').lean<{ items: unknown[]; promoCode?: string }>();
  return NextResponse.json({ items: d?.items ?? [], promoCode: d?.promoCode });
}
