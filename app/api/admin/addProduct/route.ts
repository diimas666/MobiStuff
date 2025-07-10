import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect'; // ✅
import Product from '@/app/api/models/Product'; // ✅

export async function POST(req: NextRequest) {
  const body = await req.json();
  // console.log('📥 BODY З АДМІНКИ:', body); // 🟢 ОБОВ'ЯЗКОВО

  const adminPassword = process.env.ADMIN_SECRET;
  const authHeader = req.headers.get('authorization');

  if (authHeader !== `Bearer ${adminPassword}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    await dbConnect();
    const created = await Product.create(body);
    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    console.error('❌ Error creating product:', error); // 👈 лог ошибки
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
