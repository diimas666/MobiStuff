'use client';
import { useState } from 'react';
import OffersSlider from '@/components/OffersSlider';
import { Columns2, Dice1 } from 'lucide-react';
import { Product } from '@/interface/product';
interface OfferSectionProps {
  title: string;
  products: Product[];
}
export default function OffersSection({ title, products }: OfferSectionProps) {
  const [mobileSlidesToShow, setMobileSlideToShow] = useState(1);
  const [slidesToScroll, setSlidesToScroll] = useState(1);
  const toggleSliders = () => {
    // setMobileSlideToShow((prev) => (prev === 1 ? 2 : 1));
    const newValue = mobileSlidesToShow === 1 ? 2 : 1;
    setMobileSlideToShow(newValue);
    setSlidesToScroll(newValue);
  };
  return (
    <section className="section-bottom">
      <div className="flex justify-between items-start">
        <h3 className="text-xl font-semibold mb-5">{title}</h3>
        <button
          onClick={toggleSliders}
          className="max-[490px]:block md:hidden  "
        >
          {mobileSlidesToShow === 1 ? (
            <Columns2 size={30} />
          ) : (
            <Dice1 size={30} />
          )}
        </button>
      </div>
      <div className="w-full overflow-hidden pb-6">
        <OffersSlider
          products={products}
          mobileSlidesToShow={mobileSlidesToShow}
          slidesToScroll={slidesToScroll}
        />
      </div>
    </section>
  );
}
