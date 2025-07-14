import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import type { Product } from '@/interface/product';

export async function getProductsByCategory(
  categorySlug: string,
  subcategorySlug?: string,
  limit = 40
): Promise<Product[]> {
  await dbConnect();

  const query: any = { categorySlug };

  if (subcategorySlug) {
    query.subcategorySlug = subcategorySlug;
  }

  const products = await ProductModel.find(query)
    .sort({ createdAt: -1 }) // самые новые первыми
    .limit(limit)
    .lean();

  return products.map((p: any) => ({
    ...p,
    _id: p._id?.toString(),
    id: p._id?.toString(),
  }));
}
