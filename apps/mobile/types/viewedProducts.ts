export type ViewedProductItem = {
  productId: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
  viewedAt: string;
};

export type ViewedProductInput = {
  id: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
};

export function toViewedProductItem(product: ViewedProductInput): ViewedProductItem {
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    price: product.price,
    image: product.image,
    viewedAt: new Date().toISOString(),
  };
}
