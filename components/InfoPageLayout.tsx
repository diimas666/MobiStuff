import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { storePolicies } from '@/data/storePolicies';

interface InfoPageLayoutProps {
  title: string;
  subtitle: string;
  badge?: string;
  children: React.ReactNode;
  ctaLabel?: string;
  ctaHref?: string;
}

export default function InfoPageLayout({
  title,
  subtitle,
  badge,
  children,
  ctaLabel = 'Перейти до каталогу',
  ctaHref = '/',
}: InfoPageLayoutProps) {
  return (
    <div className="pb-12">
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-gray-900 via-gray-800 to-green-900 text-white px-6 py-10 sm:px-10 sm:py-14 mb-10">
        <div className="absolute -top-20 -right-20 w-64 h-64 bg-green-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-green-400/10 rounded-full blur-2xl" />
        <div className="relative max-w-3xl">
          {badge && (
            <span className="inline-block mb-4 px-3 py-1 text-xs font-semibold uppercase tracking-wide bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
              {badge}
            </span>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold mb-4 leading-tight">{title}</h1>
          <p className="text-gray-300 text-base sm:text-lg leading-relaxed">{subtitle}</p>
        </div>
      </section>

      <div className="max-w-5xl mx-auto">{children}</div>

      <section className="max-w-5xl mx-auto mt-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 rounded-2xl bg-gray-50 border border-gray-100 px-6 py-8 sm:px-10">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">Готові обрати аксесуар?</h2>
            <p className="text-gray-600 text-sm mt-1">{storePolicies.paymentSummary}</p>
          </div>
          <Link
            href={ctaHref}
            className="inline-flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-xl shadow-md transition shrink-0"
          >
            {ctaLabel}
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

export function InfoCard({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-gray-100 bg-white p-5 sm:p-6 shadow-sm hover:shadow-md hover:border-green-200 transition-all duration-300">
      <div className="w-11 h-11 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
      <div className="text-sm text-gray-600 leading-relaxed">{children}</div>
    </div>
  );
}

export function InfoHighlight({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="text-center px-4 py-6 rounded-xl bg-white border border-gray-100 shadow-sm">
      <div className="text-2xl sm:text-3xl font-bold text-green-500 mb-1">{value}</div>
      <div className="text-sm text-gray-600">{label}</div>
    </div>
  );
}

export function InfoStep({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-4">
      <div className="shrink-0 w-9 h-9 rounded-full bg-green-500 text-white font-bold text-sm flex items-center justify-center">
        {number}
      </div>
      <div>
        <h4 className="font-semibold text-gray-900 mb-1">{title}</h4>
        <p className="text-sm text-gray-600 leading-relaxed">{children}</p>
      </div>
    </div>
  );
}
