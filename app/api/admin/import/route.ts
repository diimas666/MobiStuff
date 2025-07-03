// app/api/admin/import/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { Readable } from 'stream';
import csv from 'csv-parser';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';

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
    products.push({
      ...row,
      price: parseFloat(row.price),
      images: row.images.split(',').map((i: string) => i.trim()),
      tags: row.tags.split(',').map((t: string) => t.trim()),
      isNew: row.isNew === 'true',
      isFeatured: row.isFeatured === 'true',
    });
  }

  await Product.insertMany(products);

  return NextResponse.json({ success: true });
}
