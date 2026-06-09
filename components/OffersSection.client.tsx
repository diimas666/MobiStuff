'use client';

import { useState } from 'react';
import dynamic from 'next/dynamic';

const OffersSlider = dynamic(() => import('@/components/OffersSlider'), {
  ssr: false,
  loading: () => (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 animate-pulse">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="h-80 bg-gray-200 rounded-xl" />
      ))}
    </div>
  ),
});
import { ArrowRight, Columns2, Dice1 } from 'lucide-react';
import { Product } from '@/interface/product'; // Тип товара
import Link from 'next/link'; // Компонент Next.js для ссылок (без перезагрузки страницы)
import { getCategoryLink } from '@/lib/getCategoryLink';
// Типизация пропсов компонента
interface OfferSectionProps {
  title: string; // Заголовок секции (например, "Навушники")
  products: Product[]; // Список товаров, которые показываются в слайдере
  categorySlug?: string | null;
  subcategorySlug?: string | null;
  compact?: boolean;
  hideLayoutToggle?: boolean;
}

// Основной компонент
export default function OffersSection({
  title,
  products,
  categorySlug,
  subcategorySlug,
  compact = false,
  hideLayoutToggle = false,
}: OfferSectionProps) {
  const defaultMobileSlides = hideLayoutToggle ? 2 : 1;
  const [mobileSlidesToShow, setMobileSlideToShow] = useState(defaultMobileSlides);
  const [slidesToScroll, setSlidesToScroll] = useState(defaultMobileSlides);

  // Функция переключения отображения карточек: 1 или 2
  const toggleSliders = () => {
    const newValue = mobileSlidesToShow === 1 ? 2 : 1;
    setMobileSlideToShow(newValue);
    setSlidesToScroll(newValue);
  };

  return (
    <section className="section-bottom">
      {/* Заголовок и кнопка переключения карточек (только на мобильных) */}
      {title ? (
        <div className="flex justify-between items-start gap-3 mb-5">
          <h3 className={`font-semibold ${compact ? 'text-lg' : 'text-xl'}`}>
            {title}
          </h3>
          {!hideLayoutToggle && (
            <button
              type="button"
              onClick={toggleSliders}
              className="md:hidden shrink-0 p-1 -mt-1"
              aria-label="Змінити кількість карток"
            >
              {mobileSlidesToShow === 1 ? (
                <Columns2 size={24} />
              ) : (
                <Dice1 size={24} />
              )}
            </button>
          )}
        </div>
      ) : null}

      {/* Сам слайдер товаров */}
      <div className="w-full overflow-hidden pb-6 mb-4">
        <OffersSlider
          products={products}
          mobileSlidesToShow={mobileSlidesToShow}
          slidesToScroll={slidesToScroll}
          compact={compact}
        />
      </div>

      {categorySlug && subcategorySlug && (
        <div className="text-center mt-1">
          <Link
            href={getCategoryLink(categorySlug, subcategorySlug)}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-2.5 rounded-xl shadow-md transition text-sm cursor-pointer"
          >
            Показати більше
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      )}
    </section>
  );
}

// безлопасній компонент переписан
/*
'use client';

import { useState } from 'react';
import OffersSlider from '@/components/OffersSlider';
import { Columns2, Dice1 } from 'lucide-react';
import { Product } from '@/interface/product';
import Link from 'next/link';
import { getCategoryLink } from '@/lib/getCategoryLink';

interface OfferSectionProps {
  title: string;
  products?: Product[]; // теперь допускаем отсутствие товаров
  categorySlug?: string;
  subcategorySlug?: string; // тоже необязательный — будем проверять
}

export default function OffersSection({
  title,
  products = [], // если не передали — будет пустой массив
  categorySlug = '',
  subcategorySlug = '',
}: OfferSectionProps) {
  const [mobileSlidesToShow, setMobileSlideToShow] = useState(1);
  const [slidesToScroll, setSlidesToScroll] = useState(1);

  const toggleSliders = () => {
    const newValue = mobileSlidesToShow === 1 ? 2 : 1;
    setMobileSlideToShow(newValue);
    setSlidesToScroll(newValue);
  };

  const isValidSlug = (slug?: string) =>
    typeof slug === 'string' && slug.trim().length > 0;

  const showMoreLink =
    isValidSlug(categorySlug) && isValidSlug(subcategorySlug);

  if (!products || products.length === 0) return null; // ничего не рендерим, если товаров нет

  return (
    <section className="section-bottom">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold mb-5">{title}</h3>
        <button onClick={toggleSliders} className="max-[490px]:block md:hidden">
          {mobileSlidesToShow === 1 ? (
            <Columns2 size={30} />
          ) : (
            <Dice1 size={30} />
          )}
        </button>
      </div>

      <div className="w-full overflow-hidden pb-6 mb-4">
        <OffersSlider
          products={products}
          mobileSlidesToShow={mobileSlidesToShow}
          slidesToScroll={slidesToScroll}
        />
      </div>

      {showMoreLink && (
        <div className="text-center mt-2">
          <Link
            href={getCategoryLink(categorySlug!, subcategorySlug!)}
            className="inline-block bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Показати більше
          </Link>
        </div>
      )}
    </section>
  );
}
*/
