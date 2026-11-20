import type { Metadata } from 'next';
import Link from 'next/link';
import dbConnect from '@/lib/dbConnect';
import Order from '@/app/api/models/Order';
import { verifyOrderToken } from '@/lib/orderAccess';
import { normalizeUkrainianPhone } from '@/lib/phoneUtils';
import ProductReviews from '@/components/ProductReviews';

export const metadata: Metadata = { title: 'Оцініть покупку', robots: { index: false, follow: false } };
export const dynamic = 'force-dynamic';

type Props = { params: Promise<{ orderId: string }>; searchParams: Promise<{ t?: string }> };

/** Відгуки за посиланням із замовлення — з позначкою «Покупка підтверджена» */
export default async function ReviewOrderPage({ params, searchParams }: Props) {
  const orderId = decodeURIComponent((await params).orderId).slice(0, 40);
  const token = (await searchParams).t ?? '';
  await dbConnect();
  const order = await Order.findOne({ orderId }, 'orderId phone items name').lean<{ orderId: string; phone: string; name?: string; items: { handle: string; title: string; image?: string }[] }>();
  const phone = order ? normalizeUkrainianPhone(order.phone) : null;
  const ok = Boolean(order && phone && verifyOrderToken(order.orderId, phone, token));

  if (!ok || !order) {
    return (
      <div className="mx-auto max-w-md py-16 text-center">
        <h1 className="display-lg">Посилання недійсне.</h1>
        <p className="lead mt-3">Відкрийте посилання з повідомлення ще раз або залиште відгук на сторінці товару.</p>
        <Link href="/catalog" className="btn-primary mt-6">До каталогу</Link>
      </div>
    );
  }
  const items = order.items.filter((i, idx, arr) => i.handle && arr.findIndex((x) => x.handle === i.handle) === idx);
  return (
    <div className="mx-auto max-w-3xl pb-16">
      <h1 className="display-lg">Як вам покупка?</h1>
      <p className="lead mt-3">{order.name ? `${order.name}, д` : 'Д'}якуємо за замовлення {order.orderId}. Оцініть товари — це допоможе іншим покупцям.</p>
      {items.map((i) => (
        <div key={i.handle} className="mt-10">
          <div className="flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {i.image ? <img src={i.image} alt="" className="h-16 w-16 rounded-2xl bg-white object-contain p-1" /> : null}
            <Link href={`/product/${i.handle}`} className="text-[17px] font-semibold hover:underline">{i.title}</Link>
          </div>
          <div>
            <ProductReviews handle={i.handle} summary={{ count: 0, average: 0, reviews: [] }} orderId={order.orderId} token={token} />
          </div>
        </div>
      ))}
    </div>
  );
}
