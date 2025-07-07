import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart, Scale } from 'lucide-react';
import { Product } from '@/interface/product';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const toggleFavorite = (productId: string) => {
    const stored = JSON.parse(localStorage.getItem('favorites') || '[]');
    const updated = stored.includes(productId)
      ? stored.filter((id: string) => id !== productId)
      : [...stored, productId];
    localStorage.setItem('favorites', JSON.stringify(updated));
  };
  const { addToCart } = useCart();

  const handleAddToCart = () => {
    addToCart({
      ...product,
      image: (product.image ?? '').replace(/"/g, '').trim(),
    });
  };
  return (
    <div className="min-h-[460px] flex flex-col justify-between border rounded-xl overflow-hidden shadow-md  hover:border-green-500 transition-all duration-300 relative">
      {/* <div className="w-full max-w-[340px] mx-auto rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-all duration-300 relative"> */}
      <Link href={`/product/${product.handle}`} className="block ">
        <div className="relative w-full aspect-[4/4] bg-gray-100 ">
          <Image
            src={(product.image ?? '').replace(/"/g, '')}
            alt={product.title}
            fill
            className="object-cover rounded-t-xl"
          />
          {/* новинка слева.  */}
          {product.isNew && (
            <span className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
              Новинка
            </span>
          )}
          {/* скидка справа красиво   */}
          {product.discountPercent && (
            <span className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              -{product.discountPercent}%
            </span>
          )}
        </div>
        {/* низ карточки цена. и тд   */}
        <div className="p-4 bg-gray-800 text-white h-full max-h-[270px] ">
          {/* название заголовок  */}
          <h3 className="text-lg font-semibold line-clamp-3 mb-1 max-w-[370px]">
            {product.title}
          </h3>
          {/* рейтинг */}
          {product.rating && (
            <div className="flex items-center gap-1 mb-2 text-sm text-yellow-500">
              {'★'.repeat(Math.round(product.rating))}
              <span className="ml-1 text-gray-500">
                ({product.reviewsCount ?? 0})
              </span>
            </div>
          )}
          {/* бренди  */}
          {product.brand && (
            <div className="flex gap-1 font-medium">
              Бренд : {product.brand}
            </div>
          )}
          {/* цена  */}
          <div className="flex  gap-2 min-h-[60px] max-[490px]:flex-row items-start mb-4">
            <span className="text-xl font-bold  text-green-500 ">
              {product.price} грн
            </span>
            {product.oldPrice && (
              <span className="text-sm line-through text-green-500 mt-2">
                {product.oldPrice} грн
              </span>
            )}
          </div>
          {/* есть нет в наличии  */}
          {!product.inStock && (
            <span className="mt-2 inline-block text-xs text-red-500">
              Нет в наличии
            </span>
          )}
          {/* иноки корзина и сравнить  */}
        </div>
      </Link>
      <div className="border-white flex  gap-4 absolute right-5 bottom-3">
        <button
          onClick={() => toggleFavorite(product._id!)}
          className="button-block-card hover:bg-green-500"
        >
          {''}
          <Heart className="glass-icon-svg" />
        </button>
        <button className="button-block-card hover:bg-green-500">
          {''}
          <Scale className="glass-icon-svg" />
        </button>
        <button
          onClick={handleAddToCart}
          className="button-block-card hover:bg-green-500"
          disabled={!product.inStock}
          title={!product.inStock ? 'Немає в наявності' : 'Додати в кошик'}
        >
          <ShoppingCart className="glass-icon-svg" />
        </button>
      </div>
    </div>
  );
}
