import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../../models/Order';
import { normalizeOrderStatus } from '@/lib/orderStatus';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';

type SyncItem = {
  orderId?: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => null);
    // Лише статус за парою «номер замовлення + телефон»; не більше 50 за запит
    const items: SyncItem[] = Array.isArray(body?.orders) ? body.orders.slice(0, 50) : [];

    if (!items.length) {
      return NextResponse.json({ statuses: {} });
    }

    await dbConnect();

    const statuses: Record<string, string> = {};

    await Promise.all(
      items.map(async (item) => {
        const orderId = typeof item?.orderId === 'string' ? item.orderId.trim().slice(0, 40) : '';
        const phone = normalizeUkrainianPhone(typeof item?.phone === 'string' ? item.phone : '');

        if (!orderId || !phone) return;

        const phoneVariants = [phone, phone.replace(/^\+/, '')];
        const order = await Order.findOne({
          orderId,
          phone: { $in: phoneVariants },
        }).select('status orderId');

        if (order) {
          statuses[orderId] = normalizeOrderStatus(order.status);
        }
      })
    );

    return NextResponse.json({ statuses });
  } catch (error) {
    console.error('❌ sync-status:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
