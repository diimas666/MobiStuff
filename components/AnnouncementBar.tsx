'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useStoreSettings } from '@/context/StoreSettingsContext';

/** Оголошення з адмінки (напр. «−20% на навушники до неділі») — над вмістом сторінки */
export default function AnnouncementBar() {
  const { announcement } = useStoreSettings();
  const pathname = usePathname();
  if (!announcement.enabled || !announcement.text || pathname.startsWith('/admin')) return null;

  const content = (
    <span className="block px-4 text-center text-[13px] leading-snug font-medium sm:text-[14px]">
      {announcement.text}
      {announcement.link && <span className="ml-1.5 text-accent">Детальніше</span>}
    </span>
  );

  return (
    <div className="-mt-5 mb-5 border-b border-line-soft bg-white py-2.5 sm:-mt-8 sm:mb-8">
      {announcement.link ? (
        <Link href={announcement.link} className="block hover:opacity-80">
          {content}
        </Link>
      ) : (
        content
      )}
    </div>
  );
}
