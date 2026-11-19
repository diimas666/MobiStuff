import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../models/Order';
import { buildOrderFromPayload, notifyTelegram, OrderValidationError } from '@/lib/orders';
import { createOrderAccessToken } from '@/lib/orderAccess';
import { rateLimited } from '@/lib/rateLimit';

export async function POST(req: NextRequest) {
  try {
    // Захист від фейкових замовлень: не більше 10 за 10 хвилин з одного IP
    if (rateLimited(req, 'checkout', 10, 10 * 60 * 1000)) {
      return NextResponse.json(
        { message: 'Забагато спроб. Спробуйте через кілька хвилин або зателефонуйте нам.' },
        { status: 429 }
      );
    }

    const raw = await req.json().catch(() => null);
    if (!raw || typeof raw !== 'object') {
      return NextResponse.json({ message: 'Некоректні дані' }, { status: 400 });
    }

    await dbConnect();
    const order = await buildOrderFromPayload(raw as Record<string, unknown>);

    // Захист від подвійного натискання: те саме замовлення не створюємо двічі
    const existing = await Order.findOne({ orderId: order.orderId, phone: order.phone }).select('_id').lean();
    if (!existing) {
      await Order.create(order);
      await notifyTelegram(order);
    }

    return NextResponse.json({
      success: true,
      orderId: order.orderId,
      total: order.total,
      paymentMethod: order.paymentMethod,
      // Ключ для перегляду історії замовлень цього номера (мобільний застосунок)
      ordersToken: createOrderAccessToken(order.phone),
    });
  } catch (error) {
    if (error instanceof OrderValidationError) {
      return NextResponse.json({ message: error.message }, { status: 400 });
    }
    console.error('❌ Checkout error:', error);
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
  }
}
