import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import type { Product } from '@/interface/product';

export async function getProductsByCategory(
  categorySlug: string,
  subcategorySlug: string,
  limit = 40
): Promise<Product[]> {
  await dbConnect();

  const products = await ProductModel.find({
    categorySlug,
    subcategorySlug,
  })
    .sort({ createdAt: -1 }) // ❗️чтобы самые новые сверху

    .limit(limit)
    .lean();

  return products.map((p: any) => ({
    ...p,
    _id: p._id?.toString(), // ✅ ОБЯЗАТЕЛЬНО
    id: p._id?.toString(), // ✅ для избранного
  }));
}
