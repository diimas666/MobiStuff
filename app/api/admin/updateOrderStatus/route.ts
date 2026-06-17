import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../../models/Order';
import { isOrderStatus, ORDER_STATUS_LABELS } from '@/lib/orderStatus';

export async function PATCH(req: NextRequest) {
  try {
    await dbConnect();
    const { id, status } = await req.json();

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'ID замовлення відсутній' }, { status: 400 });
    }

    if (!isOrderStatus(status)) {
      return NextResponse.json(
        {
          error: 'Невірний статус',
          allowed: Object.entries(ORDER_STATUS_LABELS).map(([value, label]) => ({
            value,
            label,
          })),
        },
        { status: 400 }
      );
    }

    const order = await Order.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );

    if (!order) {
      return NextResponse.json({ error: 'Замовлення не знайдено' }, { status: 404 });
    }

    return NextResponse.json({ success: true, order });
  } catch (error) {
    console.error('❌ updateOrderStatus:', error);
    return NextResponse.json({ error: 'Помилка сервера' }, { status: 500 });
  }
}
