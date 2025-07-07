import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../models/Product';

export async function POST(request: Request) {
  await dbConnect();

  const { ids } = await request.json();

  if (!Array.isArray(ids)) {
    return NextResponse.json({ message: 'Invalid IDs' }, { status: 400 });
  }

  const products = await Product.find({ _id: { $in: ids } });
  return NextResponse.json(products);
}
