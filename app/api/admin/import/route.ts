import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import csv from 'csv-parser';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { slugify } from 'transliteration'; // для генерации handle

export async function POST(req: NextRequest) {
  const formData = await req.formData();
  const file = formData.get('file') as File;
  if (!file)
    return NextResponse.json({ error: 'Файл не знайдено' }, { status: 400 });

  const buffer = Buffer.from(await file.arrayBuffer());
  await dbConnect();

  const products: any[] = [];
  const stream = Readable.from(buffer).pipe(csv());

  for await (const row of stream) {
    const title = row.title?.trim();
    const price = parseFloat(row.price?.replace(/[^\d.]/g, ''));
    const oldPrice =
      parseFloat(row.oldPrice?.replace(/[^\d.]/g, '')) || undefined;
    const inStock = row.inStock?.toLowerCase() === 'в наявності';
    const handle = slugify(title || '');

    if (!title || isNaN(price) || !handle) {
      console.warn('❌ Пропущено: некорректные данные', row);
      continue;
    }
    if (!row.image?.trim()) {
      console.warn('❌ Пропущено: нет image', row);
      continue;
    }

    products.push({
      title,
      description: row.description || '',
      price,
      oldPrice,
      inStock,
      image: row.image?.trim(), // ✅ ДОБАВИЛ ЭТО
      images: row.images?.split(',').map((i: string) => i.trim()) || [],
      tags: row.tags?.split(',').map((t: string) => t.trim()) || [],
      isNew: row.isNew === 'true',
      isFeatured: row.isFeatured === 'true',
      handle,
    });
  }

  await Product.insertMany(products);
  return NextResponse.json({ success: true });
}
