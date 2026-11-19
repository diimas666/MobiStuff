import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DailyStat from '@/app/api/models/DailyStat';
import { rateLimited } from '@/lib/rateLimit';

export async function POST(req: Request) {
  // Не даємо накручувати лічильник переглядів
  if (rateLimited(req, 'pageview', 120, 60 * 1000)) {
    return NextResponse.json({ ok: true });
  }
  try {
    await dbConnect();
    const date = new Date().toISOString().slice(0, 10);

    await DailyStat.findOneAndUpdate(
      { date },
      { $inc: { pageViews: 1 } },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
