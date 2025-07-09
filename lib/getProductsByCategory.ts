import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product'; // Mongoose-модель
import type { Product as ProductType } from '@/interface/product'; // Тип интерфейса
import { sanitizeMongoDocs } from '@/lib/sanitizeMongoDocs';

export async function getProductsByCategory(
  categorySlug: string,
  subcategorySlug: string,
  limit = 10
): Promise<ProductType[]> {
  await dbConnect();

  const products = await ProductModel.find({
    categorySlug,
    subcategorySlug,
  })
    .limit(limit)
    .lean();

  return sanitizeMongoDocs(products) as ProductType[]; // если sanitize возвращает unknown[]
}
