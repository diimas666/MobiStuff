import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import csv from 'csv-parser';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { slugify } from 'transliteration'; // npm i transliteration

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
    const image = row.image?.trim();
    const price = parseFloat(row.price?.replace(/[^\d.]/g, ''));
    const oldPrice =
      parseFloat(row.oldPrice?.replace(/[^\d.]/g, '')) || undefined;
    const inStock = row.inStock?.toLowerCase() === 'в наявності';
    const handle = slugify(title || '');

    const category = row.category?.trim() || '';
    const categorySlug = slugify(category);
    const tags = row.tags?.split(',').map((t: string) => t.trim()) || [];

    const subcategorySlug = tags.includes('tws')
      ? 'tws'
      : row.subcategorySlug?.trim() || `usi-${categorySlug}`;

    if (!title || !image || isNaN(price) || !handle) {
      console.warn('❌ Пропущено: некорректные данные', row);
      continue;
    }

    products.push({
      title,
      description: row.description || '',
      image,
      price,
      oldPrice,
      inStock,
      images: row.images?.split(',').map((i: string) => i.trim()) || [],
      tags,
      isNew: row.isNew === 'true' || row.isNew === 'TRUE',
      isFeatured: row.isFeatured === 'true' || row.isFeatured === 'TRUE',
      handle,
      category,
      categorySlug,
      subcategorySlug,
    });
  }

  if (products.length === 0) {
    return NextResponse.json(
      { error: 'Не знайдено коректних товарів' },
      { status: 400 }
    );
  }

  await Product.insertMany(products);
  return NextResponse.json({ success: true, count: products.length });
}
