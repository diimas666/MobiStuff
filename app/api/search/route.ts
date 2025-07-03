// app/api/search/route.ts
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('query');

  if (!query) {
    return NextResponse.json([], { status: 200 });
  }

  const regex = new RegExp(query, 'i'); // нечувствительный к регистру поиск
  const results = await Product.find({
    $or: [{ title: regex }, { description: regex }, { tags: regex }],
  });

  return NextResponse.json(results);
}


// const res = await fetch(`/api/search?query=powerbank`);
// const products = await res.json();
