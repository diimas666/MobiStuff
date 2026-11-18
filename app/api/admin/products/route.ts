import { NextResponse } from 'next/server';
import dbConnect from '@/lib/dbConnect';
import Product from '@/app/api/models/Product';
import { checkAdminAuth, unauthorizedResponse } from '@/lib/adminAuth';

/** Повний список товарів для адмінки (з службовими полями MMA) */
export async function GET(req: Request) {
  if (!checkAdminAuth(req)) return unauthorizedResponse();
  await dbConnect();
  const products = await Product.find({})
    .select('+mmaKey +mmaSlug +mmaSourcePrice +priceManuallyEdited +lastSyncedAt').sort({ updatedAt: -1 }).lean();
  return NextResponse.json(products);
}
