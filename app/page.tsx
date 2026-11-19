import type { Metadata } from 'next';
import { SITE_NAME, SITE_URL } from '@/lib/site';
import Link from 'next/link';
import Image from 'next/image';
import { popularItems } from '@/data/popularAndTrending';
import BrandList from '@/components/BrandList';
import OffersSection from '@/components/OffersSection.client';
import ProductShelf from '@/components/ProductShelf';
import { getProductsByCategory } from '@/lib/getProductsByCategory';
import { getTrendingProducts } from '@/lib/getTrendingProducts';
import { getFeatured, getNewArrivals, getPromotions, getSaleProducts } from '@/lib/storefront';
import PromoCards from '@/components/PromoCards';
import HomeHero from '@/components/HomeHero';
import HomeSectionTitle from '@/components/HomeSectionTitle';
import ProductImage from '@/components/ProductImage';
import { getStoreSettings } from '@/lib/storeSettings';
import { ChevronRight, CreditCard, PackageCheck, RotateCcw, Truck } from 'lucide-react';

const getBenefits = (FREE_DELIVERY_FROM: number, CARD_ONLY_FROM: number) => [
  { icon: Truck, title: 'Доставка 1–3 дні', text: 'Новою Поштою по всій Україні' },
  { icon: PackageCheck, title: `Безкоштовно від ${FREE_DELIVERY_FROM} ₴`, text: 'Доставку оплачуємо ми' },
  { icon: CreditCard, title: 'Оплата при отриманні', text: `Для замовлень до ${CARD_ONLY_FROM} ₴` },
  { icon: RotateCcw, title: '14 днів на повернення', text: 'Якщо товар не підійшов' },
];

const getBanners = (FREE_DELIVERY_FROM: number) => [
  { src: '/images/banners/free-delivery.webp', alt: `Безкоштовна доставка від ${FREE_DELIVERY_FROM} грн`, href: '/delivery' },
  { src: '/images/banners/borofone-discount.webp', alt: 'Знижка 5% на Borofone', href: '/brand/borofone' },
];

export const revalidate = 300;

export const metadata: Metadata = {
  title: { absolute: `Аксесуари для телефону — купити в Україні | ${SITE_NAME}` },
  description:
    'Навушники, павербанки, зарядки, кабелі, смарт-годинники, чохли та захисне скло. Доставка Новою Поштою 1–3 дні, оплата при отриманні, 14 днів на повернення.',
  alternates: { canonical: SITE_URL },
  openGraph: {
    url: SITE_URL,
    title: `Аксесуари для телефону — ${SITE_NAME}`,
    description: 'Зарядки, кабелі, павербанки, навушники та інше з доставкою по всій Україні за 1–3 дні.',
  },
};

export default async function GeneralPage() {
  const { freeDeliveryFrom, cardOnlyFrom } = await getStoreSettings();
  const benefits = getBenefits(freeDeliveryFrom, cardOnlyFrom);
  const banners = getBanners(freeDeliveryFrom);
  const [promotions, sale, fresh, featured] = await Promise.all([
    getPromotions(),
    getSaleProducts(12),
    getNewArrivals(12),
    getFeatured(6),
  ]);
  const [
    trending,
    headphones,
    powerbanks,
    cables,
    chargers,
    mice,
    holders,
    speakers,
    watches,
    cases,
    films,
  ] = await Promise.all([
    getTrendingProducts(),
    getProductsByCategory('category-naushniki', 'category-bluetooth-stereo-garnituri-tws', 12),
    getProductsByCategory('category-akkumulyatori-i-powerbank', 'category-portativnie-batarei', 12),
    getProductsByCategory('category-zaryadki-i-kabeli', 'category-lightning', 12),
    getProductsByCategory('category-zaryadki-i-kabeli', 'category-besprovodnie-zaryadnie-ustroystva', 12),
    getProductsByCategory('category-kompyyuternaya-periferiya', 'category-mishi', 12),
    getProductsByCategory('category-avtomobilynaya-tematika', 'category-avtomobilynie-derzhateli', 12),
    getProductsByCategory('category-audio-i-video', 'category-portativnie-kolonki', 12),
    getProductsByCategory('category-gadzheti', 'category-umnie-chasi-i-fitnes-trekeri', 12),
    getProductsByCategory('category-chehli', 'category-apple', 12),
    getProductsByCategory('category-zashtita-ekrana', 'category-zashtitnie-stekla', 12),
  ]);

  const featuredSections = [
    { title: 'Навушники', subtitle: 'Звук, що завжди з тобою.', categorySlug: 'category-naushniki', subcategorySlug: 'category-bluetooth-stereo-garnituri-tws', products: headphones },
    { title: 'Павербанки', subtitle: 'Заряд на весь день.', categorySlug: 'category-akkumulyatori-i-powerbank', subcategorySlug: 'category-portativnie-batarei', products: powerbanks },
    { title: 'Кабелі', subtitle: 'Швидка зарядка і передача даних.', categorySlug: 'category-zaryadki-i-kabeli', subcategorySlug: 'category-lightning', products: cables },
    { title: 'Бездротова зарядка', subtitle: 'Поклав — і заряджається.', categorySlug: 'category-zaryadki-i-kabeli', subcategorySlug: 'category-besprovodnie-zaryadnie-ustroystva', products: chargers },
    { title: 'Чохли для iPhone', subtitle: 'Захист, який пасує.', categorySlug: 'category-chehli', subcategorySlug: 'category-apple', products: cases },
    { title: 'Смарт-годинники', subtitle: 'Сповіщення та здоров’я на зап’ясті.', categorySlug: 'category-gadzheti', subcategorySlug: 'category-umnie-chasi-i-fitnes-trekeri', products: watches },
    { title: 'Колонки', subtitle: 'Музика будь-де.', categorySlug: 'category-audio-i-video', subcategorySlug: 'category-portativnie-kolonki', products: speakers },
    { title: 'Тримачі в авто', subtitle: 'Навігація перед очима.', categorySlug: 'category-avtomobilynaya-tematika', subcategorySlug: 'category-avtomobilynie-derzhateli', products: holders },
    { title: 'Мишки', subtitle: 'Точність у кожному русі.', categorySlug: 'category-kompyyuternaya-periferiya', subcategorySlug: 'category-mishi', products: mice },
    { title: 'Захисне скло', subtitle: 'Екран без подряпин.', categorySlug: 'category-zashtita-ekrana', subcategorySlug: 'category-zashtitnie-stekla', products: films },
  ];

  const [firstSections, restSections] = [featuredSections.slice(0, 4), featuredSections.slice(4)];

  return (
    <div className="space-y-16 sm:space-y-24">
      {/* «Топ» з адмінки — на першому екрані; якщо не вибрано — хіти */}
      <HomeHero products={featured.length >= 3 ? featured : trending} />

      {/* Переваги магазину */}
      <section aria-label="Переваги" className="-mt-6 grid grid-cols-2 gap-x-4 gap-y-6 px-1 sm:-mt-12 lg:grid-cols-4">
        {benefits.map(({ icon: Icon, title, text }) => (
          <div key={title} className="flex items-start gap-3">
            <Icon className="mt-0.5 h-6 w-6 shrink-0 text-accent" strokeWidth={1.6} />
            <div>
              <p className="text-[15px] font-semibold leading-tight">{title}</p>
              <p className="mt-1 text-[13px] text-ink-2">{text}</p>
            </div>
          </div>
        ))}
      </section>

      {/* Популярні категорії — bento */}
      <section>
        <HomeSectionTitle title="Популярне" subtitle="Те, що беруть найчастіше." href="/catalog" linkLabel="Весь каталог" />
        <div className="grid auto-rows-[160px] grid-cols-2 gap-3 sm:auto-rows-[210px] sm:gap-4 md:grid-cols-4">
          {popularItems.map((item, i) => (
            <Link
              key={item.id}
              href={`/category/${item.categorySlug}/${item.subcategorySlug}`}
              className={`group relative overflow-hidden rounded-[22px] bg-ink ${
                i === 0 ? 'col-span-2 row-span-2' : ''
              } ${i === 3 ? 'md:col-span-2' : ''}`}
            >
              <ProductImage
                src={item.image}
                alt={item.title}
                fill
                sizes={i === 0 ? '(max-width: 768px) 100vw, 50vw' : '(max-width: 768px) 50vw, 25vw'}
                className="object-cover opacity-90 transition-transform duration-[1200ms] ease-[cubic-bezier(.22,1,.36,1)] group-hover:scale-[1.06]"
                priority={i < 2}
              />
              <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/0 to-black/0" />
              <div className="absolute inset-x-0 top-0 p-4 sm:p-6">
                <h3 className={`font-semibold tracking-tight text-white ${i === 0 ? 'text-2xl sm:text-4xl' : 'text-lg sm:text-xl'}`}>
                  {item.title}
                </h3>
                <span className="mt-1 inline-flex items-center text-[13px] text-white/80 transition-colors group-hover:text-white sm:text-sm">
                  Дивитися
                  <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {trending.length > 0 && (
        <section id="hits" className="scroll-mt-24">
          <HomeSectionTitle title="Хіти продажу" subtitle="Найпопулярніше цього сезону." />
          <ProductShelf products={trending} priorityCount={2} />
        </section>
      )}

      {firstSections.map((section) => (
        <OffersSection key={section.title} {...section} />
      ))}

      {/* Акції: банери з адмінки, інакше — статичні */}
      <section>
        <HomeSectionTitle title="Акції" subtitle="Вигідніше, ніж зазвичай." href="/sale" linkLabel="Усі акції" />
        {promotions.length > 0 ? (
          <PromoCards promotions={promotions.slice(0, 6)} />
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4">
            {banners.map((b, i) => (
              <Link key={b.src} href={b.href} className="tile tile-hover relative block aspect-[16/9] overflow-hidden">
                <Image src={b.src} alt={b.alt} fill sizes="(max-width: 640px) 100vw, 50vw" className="object-cover" loading={i === 0 ? 'eager' : 'lazy'} />
              </Link>
            ))}
          </div>
        )}
      </section>

      {sale.length > 0 && (
        <section>
          <HomeSectionTitle title="Зараз зі знижкою" subtitle="Встигніть, поки є в наявності." href="/sale" />
          <ProductShelf products={sale} />
        </section>
      )}

      {fresh.length > 0 && (
        <section>
          <HomeSectionTitle title="Новинки" subtitle="Щойно в магазині." />
          <ProductShelf products={fresh} />
        </section>
      )}

      {restSections.map((section) => (
        <OffersSection key={section.title} {...section} />
      ))}

      <section>
        <HomeSectionTitle title="Бренди" subtitle="Перевірені виробники, офіційний товар." />
        <BrandList />
      </section>

      {/* Про магазин + CTA */}
      <section className="panel overflow-hidden px-6 py-12 text-center sm:px-12 sm:py-20">
        <h2 className="display-lg mx-auto max-w-3xl">Усе для телефону — в одному місці.</h2>
        <p className="lead mx-auto mt-5 max-w-2xl">
          MobiStuff — інтернет-магазин мобільних аксесуарів. Павербанки, зарядні пристрої, навушники, кабелі,
          чохли та смарт-годинники з доставкою по всій Україні та гарантією якості.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
          <Link href="/catalog" className="btn-primary btn-lg">
            Обрати аксесуар
          </Link>
          <Link href="/delivery" className="link-more text-[17px]">
            Доставка і оплата
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
