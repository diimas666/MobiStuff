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
import { Columns2, Dice1 } from 'lucide-react'; // Иконки для кнопки переключения
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
}

// Основной компонент
export default function OffersSection({
  title,
  products,
  categorySlug,
  subcategorySlug,
  compact = false,
}: OfferSectionProps) {
  // Состояние количества карточек, отображаемых на мобильных
  const [mobileSlidesToShow, setMobileSlideToShow] = useState(1);

  // Состояние — сколько карточек скроллить за раз
  const [slidesToScroll, setSlidesToScroll] = useState(1);

  // Функция переключения отображения карточек: 1 или 2
  const toggleSliders = () => {
    const newValue = mobileSlidesToShow === 1 ? 2 : 1;
    setMobileSlideToShow(newValue);
    setSlidesToScroll(newValue);
  };

  return (
    <section className="section-bottom">
      {/* Заголовок и кнопка переключения карточек (только на мобильных) */}
      <div className="flex justify-between items-start">
        <h3 className={`font-semibold mb-5 ${compact ? 'text-lg' : 'text-xl'}`}>
          {title}{' '}
          {/* <span className="text-gray-500 text-base">({products.length})</span> */}
        </h3>

        <button onClick={toggleSliders} className="max-[490px]:block md:hidden">
          {/* Если показывается 1 карточка — иконка на 2, если 2 — иконка на 1 */}
          {mobileSlidesToShow === 1 ? (
            <Columns2 size={30} />
          ) : (
            <Dice1 size={30} />
          )}
        </button>
      </div>

      {/* Сам слайдер товаров */}
      <div className="w-full overflow-hidden pb-6 mb-4">
        <OffersSlider
          products={products}
          mobileSlidesToShow={mobileSlidesToShow}
          slidesToScroll={slidesToScroll}
          compact={compact}
        />
      </div>

      {/* Кнопка "Показати більше" с переходом в категорию */}
      {categorySlug && (
        <div className="text-center mt-2">
          {categorySlug && subcategorySlug && (
            <Link
              href={getCategoryLink(categorySlug, subcategorySlug)} // путь на страницу категории
              className="inline-block bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 transition"
            >
              Показати більше
            </Link>
          )}
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
