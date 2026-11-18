import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Order from '../../models/Order';

export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();

  const orders = await Order.find().sort({ createdAt: -1 });

  return NextResponse.json(orders);
}
