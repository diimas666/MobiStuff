// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q')?.trim() || '';

  if (q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  await dbConnect();

  const regex = new RegExp(q, 'i'); // нечутливий до регістру
  const products = await Product.find({ title: regex })
    .select('title handle image')
    .limit(10)
    .lean();

  return NextResponse.json(
    products.map((p) => ({
      id: String(p._id),
      title: p.title,
      handle: p.handle,
      image: p.image,
    }))
  );
}
