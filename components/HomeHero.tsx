import Link from 'next/link';
import { ArrowRight, CreditCard, Gift, ShieldCheck, Truck } from 'lucide-react';
import { CARD_ONLY_FROM, FREE_DELIVERY_FROM } from '@/data/storePolicies';
import PaymentRulesNote from '@/components/PaymentRulesNote';

export default function HomeHero() {
  return (
    <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-5 py-8 sm:px-10 sm:py-12 mb-6 sm:mb-8">
      <div className="absolute -top-24 -right-24 w-72 h-72 bg-green-500/20 rounded-full blur-3xl" />
      <div className="absolute -bottom-20 -left-20 w-56 h-56 bg-green-400/10 rounded-full blur-2xl" />

      <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
        <div className="max-w-2xl">
          <span className="inline-block mb-3 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
            MobiStuff
          </span>
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold leading-tight mb-3">
            Аксесуари для ваших гаджетів
          </h1>
          <p className="text-gray-300 text-sm sm:text-base leading-relaxed mb-6">
            Навушники, павербанки, кабелі, чохли, зарядки та смарт-годинники — тисячі
            товарів з доставкою по всій Україні.
          </p>
          <Link
            href="/category/category-naushniki/category-bluetooth-stereo-garnituri-tws"
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-5 py-2.5 rounded-xl shadow-lg transition text-sm sm:text-base"
          >
            Переглянути каталог
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 lg:max-w-lg shrink-0">
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-4 text-center">
            <Truck className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold">1–3 дні</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">доставка</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-4 text-center">
            <Gift className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold">від {FREE_DELIVERY_FROM} ₴</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">безкоштовно</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-4 text-center">
            <CreditCard className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold">від {CARD_ONLY_FROM} ₴</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">оплата карткою</p>
          </div>
          <div className="rounded-xl bg-white/10 backdrop-blur-sm border border-white/10 px-3 py-4 text-center">
            <ShieldCheck className="w-5 h-5 text-green-400 mx-auto mb-2" />
            <p className="text-xs sm:text-sm font-semibold">5000+</p>
            <p className="text-[10px] sm:text-xs text-gray-400 mt-0.5">товарів</p>
          </div>
        </div>
      </div>

      <div className="relative mt-6">
        <PaymentRulesNote variant="dark" />
      </div>
    </section>
  );
}
