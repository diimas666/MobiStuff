export type FavoriteItem = {
  productId: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
};

export type FavoriteProductInput = {
  id: string;
  handle: string;
  title: string;
  price: number;
  image?: string;
};

export function toFavoriteItem(product: FavoriteProductInput): FavoriteItem {
  return {
    productId: product.id,
    handle: product.handle,
    title: product.title,
    price: product.price,
    image: product.image,
  };
}
