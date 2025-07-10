import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../models/Product';
import mongoose from 'mongoose';

export async function POST(request: Request) {
  await dbConnect();

  const { ids } = await request.json();

  if (!Array.isArray(ids)) {
    return NextResponse.json({ message: 'Invalid IDs' }, { status: 400 });
  }

  try {
    // ✅ Конвертируем строки в ObjectId
    const objectIds = ids
      .filter((id: string) => mongoose.Types.ObjectId.isValid(id))
      .map((id: string) => new mongoose.Types.ObjectId(id));

    const products = await Product.find({ _id: { $in: objectIds } });
    return NextResponse.json(products);
  } catch (error) {
    console.error('❌ Ошибка при поиске продуктов:', error);
    return NextResponse.json({ message: 'Ошибка сервера' }, { status: 500 });
  }
}
