'use client';

import Head from 'next/head';
import { usePathname } from 'next/navigation';

export default function Canonical() {
  const pathname = usePathname();
  const canonicalUrl =
    `https://mobistuff.shop${pathname}`.replace(/\/$/, '') ||
    'https://mobistuff.shop';
  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}
