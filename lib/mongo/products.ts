import { connectToDatabase } from '@/lib/mongo/connect';
import { Product } from '@/interface/product';

export async function getProductsByBrand(
  brand: string,
  page: number = 1,
  perPage: number = 20
): Promise<{ products: (Product & { _id: string })[]; total: number }> {
  const { db } = await connectToDatabase();
  const skip = (page - 1) * perPage;

  const collection = db.collection<Product>('products');
  const products = await collection
    .find({ brand: new RegExp(`^${brand}$`, 'i') })
    .skip(skip)
    .limit(perPage)
    .toArray();

  // сериализация _id
  const cleanProducts = products.map((product) => ({
    ...product,
    _id: product._id.toString(),
  }));

  const total = await collection.countDocuments({
    brand: new RegExp(`^${brand}$`, 'i'),
  });

  return { products: cleanProducts, total };
}
