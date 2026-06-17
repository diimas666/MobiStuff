import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../models/Order';
import { normalizeOrderPayload } from '@/lib/normalizeOrderPayload';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const newOrder = await Order.create(normalizeOrderPayload(data));

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('❌ Помилка збереження замовлення:', error);
    return NextResponse.json({ success: false, message: 'Помилка збереження' }, { status: 500 });
  }
}
