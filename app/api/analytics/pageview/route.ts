import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import DailyStat from '@/app/api/models/DailyStat';

export async function POST() {
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
