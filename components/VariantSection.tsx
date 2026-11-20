'use client';

import { Check, Heart, ShoppingBag } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Product } from '@/interface/product';
import VariantSelector from './VariantSelector';
import { useCart } from '@/context/CartContext';
import { useFavorites } from '@/context/FavoritesContext';
import { trackAddToWishlist } from '@/lib/analytics';
import { formatPrice } from '@/lib/format';
import ProductImage from './ProductImage';
import QuickOrder from './QuickOrder';
import StockAlertForm from './StockAlertForm';

interface Props {
  variants: string[];
  product: Product;
}

/** Блок покупки: варіанти, «Додати в кошик», «Купити зараз» + липка панель на мобільному. */
export default function VariantSection({ variants, product }: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [added, setAdded] = useState(false);
  const [showBar, setShowBar] = useState(false);
  const ctaRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { cart, addToCart } = useCart();
  const { toggleFavorite, favorites } = useFavorites();

  const productId = product._id || product.id;
  const isFavorite = favorites.includes(productId);
  const inStock = product.inStock !== false;
  const inCart = cart.some((item) => item._id === product._id);

  useEffect(() => {
    const el = ctaRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([entry]) => setShowBar(!entry.isIntersecting && entry.boundingClientRect.top < 0), {
      threshold: 0,
    });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!added) return;
    const t = setTimeout(() => setAdded(false), 2200);
    return () => clearTimeout(t);
  }, [added]);

  const handleAdd = () => {
    addToCart(product);
    setAdded(true);
  };

  const handleBuyNow = () => {
    if (!inCart) addToCart(product);
    router.push('/checkout');
  };

  const handleFavorite = () => {
    if (!isFavorite) trackAddToWishlist(product);
    toggleFavorite(productId);
  };

  return (
    <div className="flex flex-col gap-6">
      {variants && variants.length > 0 && (
        <VariantSelector variants={variants} selected={selected} setSelected={setSelected} />
      )}

      <div ref={ctaRef} className="flex flex-col gap-3">
        <div className="flex gap-2">
          <button type="button" onClick={handleAdd} disabled={!inStock} className={`btn btn-lg flex-1 text-white ${added ? 'bg-ink' : 'bg-accent hover:bg-accent-hover'}`}>
            {added ? (
              <>
                <Check key="ok" className="pop h-5 w-5" strokeWidth={2.5} />
                Додано в кошик
              </>
            ) : (
              <>
                <ShoppingBag className="h-5 w-5" />
                {inStock ? 'Додати в кошик' : 'Немає в наявності'}
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleFavorite}
            aria-pressed={isFavorite}
            aria-label={isFavorite ? 'Прибрати з обраного' : 'Додати в обране'}
            className={`btn h-[58px] w-[58px] shrink-0 border ${
              isFavorite ? 'border-sale/30 bg-sale/5 text-sale' : 'border-line bg-white text-ink hover:border-ink-3'
            }`}
          >
            <Heart key={String(isFavorite)} className={`h-5 w-5 ${isFavorite ? 'pop fill-current' : ''}`} />
          </button>
        </div>
        {inStock && (
          <button type="button" onClick={handleBuyNow} className="btn-ghost btn-lg w-full">
            Купити зараз
          </button>
        )}
        {inStock && <QuickOrder productId={String(product._id)} title={product.title} price={product.price} variant={selected} />}
        {!inStock && <StockAlertForm productId={String(product._id)} />}
      </div>

      {/* Липка панель покупки (мобільний) */}
      <div
        aria-hidden={!showBar}
        className={`fixed inset-x-0 bottom-0 z-40 border-t border-line-soft bg-white/85 px-4 pt-3 pb-[max(12px,env(safe-area-inset-bottom))] backdrop-blur-xl transition-transform duration-500 ease-[cubic-bezier(.22,1,.36,1)] lg:hidden ${
          showBar ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        <div className="flex items-center gap-3">
          {product.image && (
            <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-xl bg-canvas">
              <ProductImage src={product.image} alt="" fill sizes="44px" className="object-contain p-1" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-[13px] text-ink-2">{product.title}</p>
            <p className="text-[17px] font-semibold">{formatPrice(product.price)}</p>
          </div>
          <button
            type="button"
            onClick={handleAdd}
            disabled={!inStock}
            tabIndex={showBar ? 0 : -1}
            className={`btn px-5 py-3 text-[15px] text-white ${added ? 'bg-ink' : 'bg-accent'}`}
          >
            {added ? <Check key="ok2" className="pop h-5 w-5" /> : 'У кошик'}
          </button>
        </div>
      </div>
    </div>
  );
}
