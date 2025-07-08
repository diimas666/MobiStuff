import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../../models/Order';

export async function DELETE(req: NextRequest) {
  await dbConnect();
  const { ids } = await req.json();

  if (!Array.isArray(ids) || ids.length === 0) {
    return NextResponse.json({ success: false, message: 'Немає ID для видалення' }, { status: 400 });
  }

  await Order.deleteMany({ _id: { $in: ids } });

  return NextResponse.json({ success: true });
}
