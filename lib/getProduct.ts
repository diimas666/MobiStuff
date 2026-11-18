import { cache } from 'react';
import dbConnect from '@/lib/dbConnect';
import ProductModel from '@/app/api/models/Product';
import type { Product } from '@/interface/product';

/** Товар за handle напряму з БД; cache() — один запит на рендер (metadata + сторінка) */
export const getProductByHandle = cache(async (handle: string): Promise<Product | null> => {
  if (!handle || handle.length > 300) return null;
  await dbConnect();
  const doc = await ProductModel.findOne({ handle: decodeURIComponent(handle) }).lean<Record<string, any>>();
  if (!doc) return null;
  return JSON.parse(
    JSON.stringify({ ...doc, _id: String(doc._id), id: String(doc._id) })
  ) as Product;
});
