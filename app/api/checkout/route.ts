// app/api/saveOrder/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../models/Order';

export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();

    const newOrder = new Order(body);
    await newOrder.save();

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error('❌ Order save error:', error);
    return NextResponse.json({ message: 'Помилка сервера' }, { status: 500 });
  }
}
