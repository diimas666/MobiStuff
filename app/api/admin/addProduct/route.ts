import { revalidateStore } from '@/lib/revalidateStore';
import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import { checkAdminAuth } from '@/lib/adminAuth';
import Product from '@/app/api/models/Product';

export async function POST(req: NextRequest) {
  if (!checkAdminAuth(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();

  try {
    await dbConnect();
    const created = await Product.create(body);
    revalidateStore();
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating product:', error); // 👈 лог ошибки
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
