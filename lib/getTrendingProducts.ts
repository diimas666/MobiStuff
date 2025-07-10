import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import { Product } from '@/interface/product';

// lib/getTrendingProducts.ts
export async function getTrendingProducts(limit = 10): Promise<Product[]> {
  await dbConnect();

  const trending = await ProductModel.find({ isTrending: true }) // ← це головне
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  console.log('🔥 trending products count:', trending.length); // <- додай

  return trending.map((p: any) => ({
    ...p,
    _id: p._id.toString(),
    id: p._id.toString(),
  }));
}
