import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../../models/Order';
import { normalizeOrderStatus } from '@/lib/orderStatus';

type SyncItem = {
  orderId?: string;
  phone?: string;
};

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const body = await req.json();
    const items: SyncItem[] = Array.isArray(body?.orders) ? body.orders : [];

    if (!items.length) {
      return NextResponse.json({ statuses: {} });
    }

    const statuses: Record<string, string> = {};

    await Promise.all(
      items.map(async (item) => {
        const orderId = item.orderId?.trim();
        const phone = item.phone?.trim();

        if (!orderId || !phone) return;

        const order = await Order.findOne({ orderId, phone }).select('status orderId');

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
