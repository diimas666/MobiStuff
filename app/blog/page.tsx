import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts } from '@/data/blog';

export const metadata: Metadata = {
  title: 'Поради з вибору аксесуарів',
  description: 'Як обрати павербанк, захисне скло, навушники, зарядку і кабель для телефона — короткі зрозумілі поради від MobiStuff.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  return (
    <div className="pb-16">
      <h1 className="display-lg">Поради.</h1>
      <p className="lead mt-4 max-w-2xl">Коротко і без реклами: як обрати аксесуар, який прослужить довго.</p>
      <ul className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {blogPosts.map((p) => (
          <li key={p.slug}>
            <Link href={`/blog/${p.slug}`} className="panel flex h-full flex-col p-6 transition-transform hover:-translate-y-0.5">
              <span className="text-[13px] text-ink-3">{p.shop.label} · {p.readMinutes} хв</span>
              <span className="mt-2 text-[20px] leading-snug font-semibold tracking-tight">{p.title}</span>
              <span className="mt-2 text-[15px] text-ink-2">{p.description}</span>
              <span className="link-more mt-auto pt-4 text-[15px]">Читати</span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
