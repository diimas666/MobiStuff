import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import Loyalty from '@/app/api/models/Loyalty';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';

type O = { orderId: string; phone?: string; name?: string; lastName?: string; email?: string; city?: string; total?: number; status?: string; createdAt?: string };

/** Покупці: зведення замовлень за номером телефону + бали кешбеку */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const orders = await Order.find({}, 'orderId phone name lastName email city total status createdAt').sort({ createdAt: -1 }).limit(20000).lean<O[]>();
  const loyalty = await Loyalty.find({}, 'phone balance').lean<{ phone: string; balance: number }[]>();
  const points = new Map(loyalty.map((l) => [l.phone, l.balance]));

  const map = new Map<string, { phone: string; name: string; email: string; city: string; orders: number; spent: number; cancelled: number; lastAt: string; firstAt: string; lastOrderId: string }>();
  for (const o of orders) {
    const phone = normalizeUkrainianPhone(o.phone || '');
    if (!phone) continue;
    const c = map.get(phone) ?? { phone, name: '', email: '', city: '', orders: 0, spent: 0, cancelled: 0, lastAt: '', firstAt: '', lastOrderId: '' };
    c.orders += 1;
    if (o.status === 'cancelled' || o.status === 'returned') c.cancelled += 1;
    else c.spent += o.total || 0;
    if (!c.lastAt) {
      c.lastAt = String(o.createdAt || '');
      c.lastOrderId = o.orderId;
      c.name = [o.name, o.lastName].filter(Boolean).join(' ');
      c.email = o.email || '';
      c.city = o.city || '';
    }
    c.firstAt = String(o.createdAt || '');
    map.set(phone, c);
  }
  const customers = [...map.values()].map((c) => ({ ...c, points: points.get(c.phone) ?? 0 }));
  return NextResponse.json({ customers });
}

/** Нарахувати або списати бали вручну: { phone, delta, reason } */
export async function POST(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  const b = await req.json().catch(() => null);
  const phone = normalizeUkrainianPhone(typeof b?.phone === 'string' ? b.phone : '');
  const delta = Math.round(Number(b?.delta));
  const reason = (typeof b?.reason === 'string' ? b.reason.trim() : '').slice(0, 120) || (delta > 0 ? 'Нараховано менеджером' : 'Списано менеджером');
  if (!phone || !Number.isFinite(delta) || delta === 0 || Math.abs(delta) > 100000) return NextResponse.json({ error: 'Вкажіть номер і кількість балів' }, { status: 400 });
  await dbConnect();
  const filter = delta < 0 ? { phone, balance: { $gte: -delta } } : { phone };
  const r = await Loyalty.findOneAndUpdate(
    filter,
    { $inc: { balance: delta }, $push: { history: { delta, reason: `${reason} (адмін)`, at: new Date() } } },
    { upsert: delta > 0, new: true }
  ).lean<{ balance: number }>();
  if (!r) return NextResponse.json({ error: 'Недостатньо балів' }, { status: 400 });
  return NextResponse.json({ balance: r.balance });
}
