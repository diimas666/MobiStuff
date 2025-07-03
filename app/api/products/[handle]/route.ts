// app/api/products/[handle]/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';

export async function GET(
  req: Request,
  { params }: { params: { handle: string } }
) {
  await dbConnect();

  try {
    const product = await Product.findOne({ handle: params.handle });
    if (!product) {
      return NextResponse.json({ error: 'Товар не знайдено' }, { status: 404 });
    }
    return NextResponse.json(product);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
// }
// Это API-роут, который:

// ищет один товар по его handle (уникальный slug товара),

// возвращает JSON-объект товара,




// const res = await fetch(`/api/products/33wdsd`);
// const product = await res.json();
