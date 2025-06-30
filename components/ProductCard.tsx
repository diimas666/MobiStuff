// components/ProductCard.tsx
import Link from 'next/link';
import Image from 'next/image';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/interface/product';
interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <div className="rounded-xl overflow-hidden shadow-md border hover:shadow-lg transition-all duration-300 relative">
      <Link href={`/product/${product.handle}`} className="block">
        <div className="relative w-full h-60 bg-gray-100 border ">
          <Image
            src={product.image}
            alt={product.title}
            fill
            className="object-cover"
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
        <div className="p-4 bg-gray-800 text-white min-h-[120px]  relative">
          {/* название заголовок  */}
          <h3 className="text-lg font-semibold line-clamp-1 mb-1 max-w-[270px]">
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
          {/* цена  */}
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-white">
              {product.price} грн
            </span>
            {product.oldPrice && (
              <span className="text-sm line-through text-gray-500">
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
          <div className="border-white flex flex-col gap-2 absolute right-3 bottom-3">
            <button className="button-block-card">
              {''}
              <Heart className="glass-icon-svg" />
            </button>
            <button className="button-block-card">
              {''}
              <ShoppingCart className="glass-icon-svg" />
            </button>
          </div>
    </div>
  );
}
