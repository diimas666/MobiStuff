import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AppStat from '@/app/api/models/AppStat';
import AppError from '@/app/api/models/AppError';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';

/** Воронка застосунку за 30 днів і останні помилки */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const since = new Date(Date.now() - 30 * 864e5).toISOString().slice(0, 10);
  const rows = await AppStat.find({ date: { $gte: since } }).lean<{ date: string; event: string; count: number; value: number }[]>();
  const totals: Record<string, { count: number; value: number }> = {};
  for (const r of rows) {
    totals[r.event] ??= { count: 0, value: 0 };
    totals[r.event].count += r.count;
    totals[r.event].value += r.value;
  }
  const errors = await AppError.find().sort({ lastAt: -1 }).limit(30).select('message screen count lastAt fatal appVersion').lean();
  return NextResponse.json({ totals, errors });
}
