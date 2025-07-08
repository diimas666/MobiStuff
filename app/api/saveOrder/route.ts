// app/api/saveOrder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // або свій файл підключення до MongoDB
import Order from '../models/Order'; // твоя модель

export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const data = await req.json();
    const newOrder = await Order.create(data);

    return NextResponse.json({ success: true, order: newOrder });
  } catch (error) {
    console.error('❌ Помилка збереження замовлення:', error);
    return NextResponse.json({ success: false, message: 'Помилка збереження' }, { status: 500 });
  }
}
