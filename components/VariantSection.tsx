'use client';
import { Heart, ShoppingCart } from 'lucide-react';
import { Product } from '@/interface/product';
import VariantSelector from './VariantSelector';
import { useState } from 'react';
// контексты
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext'; // ✅
interface Props {
  variants: string[];
  product: Product;
}
export default function VariantSection({ variants, product }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const { addToCart } = useCart();
  const { toggleFavorite, favorites } = useFavorites();
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between p-4">
      <VariantSelector
        variants={variants}
        selected={selected}
        setSelected={setSelected}
      />

      <div className="flex flex-col gap-2  ">
        <button
          onClick={() => toggleFavorite(product._id || product.id)}
          className={`px-6 py-2 rounded-2xl transition shadow cursor-pointer ${
            favorites.includes(product._id || product.id)
              ? 'bg-red-100 text-green-600 '
              : 'bg-white text-black hover:bg-gray-100'
          }`}
        >
          {favorites.includes(product._id || product.id)
            ? 'В обраному'
            : 'Додати в обране'}
        </button>
        <button
          onClick={() => addToCart(product)}
          className="button-block-card hover:bg-green-200 flex items-center gap-3 py-2 px-4 justify-center  "
        >
          {''}Купити
          <ShoppingCart className="glass-icon-svg" />
        </button>
      </div>
    </div>
  );
}
