import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import type { Product } from '@/interface/product';

/** Товари з тієї ж кореневої категорії, без поточного */
export async function getRelatedProducts(
  categorySlug: string,
  excludeHandle: string,
  limit = 20
): Promise<Product[]> {
  if (!categorySlug) return [];

  await dbConnect();

  const products = await ProductModel.find({
    categorySlug,
    handle: { $ne: excludeHandle },
  })
    .sort({ createdAt: -1 })
    .limit(limit)
    .lean();

  return products.map((p: any) => ({
    ...p,
    _id: p._id?.toString(),
    id: p._id?.toString(),
  }));
}
