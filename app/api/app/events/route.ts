import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import AppStat from '@/app/api/models/AppStat';
import { rateLimited } from '@/lib/rateLimit';

const ALLOWED = new Set(['app_open', 'view_product', 'add_to_cart', 'begin_checkout', 'purchase', 'search', 'push_open']);

/** Події застосунку пакетом: [{ name, value? }] — лише лічильники, без даних покупця */
export async function POST(req: Request) {
  if (rateLimited(req, 'app-events', 120, 60 * 1000)) return NextResponse.json({ ok: true });
  const b = await req.json().catch(() => null);
  const events: { name?: unknown; value?: unknown }[] = Array.isArray(b?.events) ? b.events.slice(0, 50) : [];
  const date = new Date().toISOString().slice(0, 10);
  const inc = new Map<string, { count: number; value: number }>();
  for (const e of events) {
    const name = typeof e?.name === 'string' ? e.name : '';
    if (!ALLOWED.has(name)) continue;
    const cur = inc.get(name) ?? { count: 0, value: 0 };
    cur.count += 1;
    cur.value += Math.max(0, Math.min(1_000_000, Math.round(Number(e?.value) || 0)));
    inc.set(name, cur);
  }
  if (inc.size) {
    await dbConnect();
    await AppStat.bulkWrite(
      [...inc.entries()].map(([event, v]) => ({
        updateOne: { filter: { date, event }, update: { $inc: { count: v.count, value: v.value } }, upsert: true },
      }))
    );
  }
  return NextResponse.json({ ok: true });
}
