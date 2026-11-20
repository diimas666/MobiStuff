import { NextResponse } from 'next/server';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import PromoCode from '@/app/api/models/PromoCode';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';

type Ctx = { params: Promise<{ id: string }> };

/** Увімкнути / вимкнути */
export async function PATCH(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
  const b = await req.json().catch(() => null);
  await dbConnect();
  const item = await PromoCode.findByIdAndUpdate(id, { $set: { active: Boolean(b?.active) } }, { new: true }).lean();
  return item ? NextResponse.json({ item }) : NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
}

export async function DELETE(req: Request, { params }: Ctx) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const { id } = await params;
  if (!isValidObjectId(id)) return NextResponse.json({ error: 'Не знайдено' }, { status: 404 });
  await dbConnect();
  await PromoCode.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
