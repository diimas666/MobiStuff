'use client'; // Указывает, что компонент работает на клиенте (использует useState и т.п.)

import { useState } from 'react'; // Хук состояния
import OffersSlider from '@/components/OffersSlider'; // Компонент со слайдером товаров
import { Columns2, Dice1 } from 'lucide-react'; // Иконки для кнопки переключения
import { Product } from '@/interface/product'; // Тип товара
import Link from 'next/link'; // Компонент Next.js для ссылок (без перезагрузки страницы)

// Типизация пропсов компонента
interface OfferSectionProps {
  title: string; // Заголовок секции (например, "Навушники")
  products: Product[]; // Список товаров, которые показываются в слайдере
  categorySlug?: string; // Слаг категории — нужен для перехода по кнопке "Показати більше"
}

// Основной компонент
export default function OffersSection({
  title,
  products,
  categorySlug,
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
        <h3 className="text-xl font-semibold mb-5">{title}</h3>
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
          mobileSlidesToShow={mobileSlidesToShow} // передаём количество карточек
          slidesToScroll={slidesToScroll} // и сколько скроллить
        />
      </div>

      {/* Кнопка "Показати більше" с переходом в категорию */}
      {categorySlug && (
        <div className="text-center mt-2">
          <Link
            href={`/category/${categorySlug}`} // путь на страницу категории
            className="inline-block bg-black text-white text-sm px-6 py-2 rounded hover:bg-gray-800 transition"
          >
            Показати більше
          </Link>
        </div>
      )}
    </section>
  );
}
