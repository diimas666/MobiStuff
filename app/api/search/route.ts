// app/api/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';

function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export async function GET(req: NextRequest) {
  const q = (req.nextUrl.searchParams.get('q') || '').trim().slice(0, 80);

  if (q.length < 2) {
    return NextResponse.json([], { status: 200 });
  }

  await dbConnect();

  // Кожне слово запиту має зустрітися в назві або бренді (у будь-якому порядку)
  const words = q.split(/\s+/).filter(Boolean).slice(0, 5);
  const filter = {
    $and: words.map((w) => {
      const rx = new RegExp(escapeRegex(w), 'i');
      return { $or: [{ title: rx }, { brand: rx }] };
    }),
  };

  const products = await Product.find(filter)
    .select('title handle image price oldPrice brand inStock')
    .sort({ inStock: -1, isTrending: -1 })
    .limit(8)
    .lean<{ _id: unknown; title: string; handle: string; image: string; price: number; oldPrice?: number; brand?: string }[]>();

  return NextResponse.json(
    products.map((p) => ({
      id: String(p._id),
      title: p.title,
      handle: p.handle,
      image: p.image,
      price: p.price,
      oldPrice: p.oldPrice,
      brand: p.brand,
    })),
    { headers: { 'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300' } }
  );
}
