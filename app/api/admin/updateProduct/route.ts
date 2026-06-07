// ✅ /app/api/admin/updateProduct/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';
import Product from '../../models/Product';

function applyDiscount(
  basePrice: number,
  discountPercent: number
): { price: number; oldPrice: number; discountPercent: number } | null {
  if (discountPercent > 0 && discountPercent < 100) {
    return {
      oldPrice: basePrice,
      price: Math.round(basePrice * (1 - discountPercent / 100)),
      discountPercent,
    };
  }
  return null;
}

export async function PATCH(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();

  await dbConnect();
  const body = await req.json();

  const { id, ...updateFields } = body;

  if (!id) {
    return NextResponse.json({ error: 'ID відсутній' }, { status: 400 });
  }

  try {
    const existing = await Product.findById(id);
    if (!existing) {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    }

    const unsetFields: Record<string, string> = {};

    if (updateFields.discountPercent !== undefined) {
      const discount = Number(updateFields.discountPercent) || 0;
      const basePrice =
        existing.oldPrice && existing.oldPrice > existing.price
          ? existing.oldPrice
          : existing.price;

      const discounted = applyDiscount(basePrice, discount);
      if (discounted) {
        updateFields.oldPrice = discounted.oldPrice;
        updateFields.price = discounted.price;
        updateFields.discountPercent = discounted.discountPercent;
      } else {
        updateFields.price = basePrice;
        unsetFields.oldPrice = '';
        unsetFields.discountPercent = '';
        delete updateFields.discountPercent;
      }
      updateFields.priceManuallyEdited = true;
    }

    if (updateFields.price !== undefined && updateFields.discountPercent === undefined) {
      if (existing.price !== updateFields.price) {
        updateFields.priceManuallyEdited = true;
        if (existing.discountPercent && existing.discountPercent > 0) {
          unsetFields.oldPrice = '';
          unsetFields.discountPercent = '';
        }
      }
    }

    const updateQuery: Record<string, unknown> = { $set: updateFields };
    if (Object.keys(unsetFields).length > 0) {
      updateQuery.$unset = unsetFields;
    }

    const updated = await Product.findByIdAndUpdate(id, updateQuery, {
      new: true,
    });

    return NextResponse.json({ message: 'Оновлено', product: updated });
  } catch (e) {
    console.error('❌ Помилка оновлення:', e);
    return NextResponse.json(
      { error: 'Помилка при оновленні товару' },
      { status: 500 }
    );
  }
}
