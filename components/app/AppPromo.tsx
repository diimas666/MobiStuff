'use client';

import AppStoreButton, { useShowIosApp } from './AppStoreButton';

const PERKS = [
  'Статус замовлення і номер ТТН — одразу в сповіщеннях',
  'Повідомимо, коли товар з обраного подешевшає',
  'Оформлення в два дотики: дані доставки збережені',
];

/** Блок «Замовляйте в застосунку» — на головній */
export default function AppPromo() {
  const show = useShowIosApp();
  if (!show) return null;
  return (
    <section className="panel flex flex-col gap-6 overflow-hidden p-6 sm:flex-row sm:items-center sm:gap-10 sm:p-10">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/images/app-icon.png" alt="Застосунок MobiStuff" width={112} height={112} className="h-20 w-20 shrink-0 rounded-[22%] shadow-[0_10px_30px_-10px_rgba(0,0,0,.35)] sm:h-28 sm:w-28" />
      <div className="min-w-0 flex-1">
        <h2 className="text-[26px] leading-tight font-semibold tracking-[-0.025em] sm:text-[34px]">Замовляйте в застосунку MobiStuff.</h2>
        <ul className="mt-4 space-y-2 text-[15px] text-ink-2">
          {PERKS.map((p) => (
            <li key={p} className="flex gap-2.5">
              <span className="mt-[9px] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
              {p}
            </li>
          ))}
        </ul>
        <AppStoreButton source="home" className="mt-6" />
      </div>
    </section>
  );
}
