import { NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { isValidObjectId } from 'mongoose';
import dbConnect from '@/lib/dbConnect';
import Review from '@/app/api/models/Review';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const status = new URL(req.url).searchParams.get('status') || 'pending';
  await dbConnect();
  const filter = ['pending', 'approved', 'rejected'].includes(status) ? { status } : {};
  const [reviews, pending] = await Promise.all([Review.find(filter).sort({ createdAt: -1 }).limit(300).lean(), Review.countDocuments({ status: 'pending' })]);
  return NextResponse.json({ reviews, pending });
}

/** { id, status?, reply? } — схвалити / відхилити / відповісти від магазину */
export async function PATCH(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const b = await req.json().catch(() => null);
  if (!b || !isValidObjectId(b.id)) return NextResponse.json({ error: 'Відгук не знайдено' }, { status: 404 });
  const $set: Record<string, unknown> = {};
  if (['approved', 'rejected', 'pending'].includes(b.status)) $set.status = b.status;
  if (typeof b.reply === 'string') $set.reply = b.reply.trim().slice(0, 1000);
  await dbConnect();
  const r = await Review.findByIdAndUpdate(b.id, { $set }, { new: true }).lean<{ handle: string }>();
  if (!r) return NextResponse.json({ error: 'Відгук не знайдено' }, { status: 404 });
  revalidateTag(`reviews:${r.handle}`, { expire: 0 });
  return NextResponse.json({ review: r });
}

export async function DELETE(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const id = new URL(req.url).searchParams.get('id');
  if (!id || !isValidObjectId(id)) return NextResponse.json({ error: 'Відгук не знайдено' }, { status: 404 });
  await dbConnect();
  const r = await Review.findByIdAndDelete(id).lean<{ handle: string }>();
  if (r) revalidateTag(`reviews:${r.handle}`, { expire: 0 });
  return NextResponse.json({ ok: true });
}
