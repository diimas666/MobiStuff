import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

interface HomeSectionTitleProps {
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  as?: 'h1' | 'h2' | 'h3';
}

/** Apple-style two-tone heading: «Навушники. Звук, що завжди з тобою.» */
export default function HomeSectionTitle({
  title,
  subtitle,
  href,
  linkLabel = 'Дивитися всі',
  as: Tag = 'h2',
}: HomeSectionTitleProps) {
  return (
    <div className="mb-5 flex flex-wrap items-end justify-between gap-x-6 gap-y-2 sm:mb-7">
      <Tag className="display-md max-w-3xl">
        {title}
        {subtitle ? (
          <>
            {title.endsWith('.') ? ' ' : '. '}
            <span className="text-ink-3">{subtitle}</span>
          </>
        ) : null}
      </Tag>
      {href ? (
        <Link href={href} className="link-more shrink-0 text-[15px]">
          {linkLabel}
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : null}
    </div>
  );
}
