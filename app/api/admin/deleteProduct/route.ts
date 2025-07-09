// ✅ /app/api/admin/deleteProduct/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../models/Product';

export async function DELETE(req: Request) {
  await dbConnect();
  const body = await req.json();
  const { id } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID відсутній' }, { status: 400 });
  }

  try {
    const deleted = await Product.findByIdAndDelete(id);

    if (!deleted) {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Товар видалено' });
  } catch (error) {
    return NextResponse.json(
      { error: 'Помилка при видаленні товару' },
      { status: 500 }
    );
  }
}
