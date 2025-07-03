// app/api/products/route.ts
// универсальность и удобство 
import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // ✅
import Product from '@/app/api/models/Product';

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');
  const subcategory = searchParams.get('subcategory');

  const filter: any = {};
  if (category) filter.categorySlug = category;
  if (subcategory) filter.subcategorySlug = subcategory;

  const products = await Product.find(filter);
  return NextResponse.json(products);
}
