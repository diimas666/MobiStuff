// ✅ /app/api/admin/updateProduct/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '../../models/Product';

export async function PATCH(req: Request) {
  await dbConnect();
  const body = await req.json();

  // console.log('📦 PATCH BODY:', body);

  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID відсутній' }, { status: 400 });
  }

  if (updateFields.price !== undefined) {
    const existing = (await Product.findById(id).select('price').lean()) as {
      price?: number;
    } | null;
    if (existing && existing.price !== updateFields.price) {
      updateFields.priceManuallyEdited = true;
    }
  }

  try {
    const updated = await Product.findByIdAndUpdate(id, updateFields, {
      new: true,
    });

    if (!updated) {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    }

    console.log('✅ Оновлений товар:', updated); // і тут лог

    return NextResponse.json({ message: 'Оновлено', product: updated });
  } catch (e) {
    console.error('❌ Помилка оновлення:', e);
    return NextResponse.json(
      { error: 'Помилка при оновленні товару' },
      { status: 500 }
    );
  }
}
