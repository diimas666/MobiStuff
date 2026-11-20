import Link from 'next/link';
import Container from '@/components/Container';
import { policyTexts } from '@/data/storePolicies';
import { getStoreSettings } from '@/lib/storeSettings';
import AppStoreButton from '@/components/app/AppStoreButton';

const columns = [
  {
    title: 'Магазин',
    links: [
      { href: '/catalog', label: 'Каталог' },
      { href: '/category/category-naushniki/category-bluetooth-stereo-garnituri-tws', label: 'Навушники' },
      { href: '/category/category-akkumulyatori-i-powerbank/category-portativnie-batarei', label: 'Павербанки' },
      { href: '/category/category-zaryadki-i-kabeli/category-lightning', label: 'Кабелі' },
      { href: '/category/category-chehli/category-apple', label: 'Чохли для iPhone' },
    ],
  },
  {
    title: 'Покупцям',
    links: [
      { href: '/delivery', label: 'Доставка і оплата' },
      { href: '/returns', label: 'Повернення' },
      { href: '/warranty', label: 'Гарантія' },
      { href: '/tracking', label: 'Відстежити посилку' },
      { href: '/favorites', label: 'Обране' },
      { href: '/cart', label: 'Кошик' },
    ],
  },
  {
    title: 'MobiStuff',
    links: [
      { href: '/about', label: 'Про нас' },
      { href: '/contacts', label: 'Контакти' },
      { href: '/privacy', label: 'Політика конфіденційності' },
    ],
  },
];

export default async function Footer() {
  const settings = await getStoreSettings();
  const storePolicies = policyTexts(settings.freeDeliveryFrom, settings.cardOnlyFrom);
  return (
    <footer className="mt-20 border-t border-line-soft bg-canvas text-[13px] text-ink-2">
      <Container className="py-10 sm:py-14">
        <p className="max-w-3xl border-b border-line-soft pb-6 leading-relaxed">
          {storePolicies.freeDelivery}. {storePolicies.cardOnly}. {storePolicies.codAvailable}.
        </p>

        <div className="grid grid-cols-2 gap-x-6 gap-y-8 py-8 sm:grid-cols-4">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="mb-3 font-semibold text-ink">{col.title}</h3>
              <ul className="space-y-2.5">
                {col.links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="transition-colors hover:text-ink hover:underline">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div>
            <h3 className="mb-3 font-semibold text-ink">Підтримка</h3>
            <p className="mb-2.5">{settings.workingHours || 'Пишіть — відповідаємо протягом дня.'}</p>
            {settings.phone && (
              <a href={`tel:${settings.phone.replace(/[^\d+]/g, '')}`} className="mb-1.5 block font-medium text-ink hover:underline">
                {settings.phone}
              </a>
            )}
            {settings.email && (
              <a href={`mailto:${settings.email}`} className="font-medium text-accent hover:underline">
                {settings.email}
              </a>
            )}
            {(settings.instagram || settings.telegram) && (
              <p className="mt-2.5 flex gap-3">
                {settings.instagram && <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">Instagram</a>}
                {settings.telegram && <a href={settings.telegram} target="_blank" rel="noopener noreferrer" className="hover:text-ink hover:underline">Telegram</a>}
              </p>
            )}
          </div>
        </div>

        <div className="mb-8 flex flex-wrap items-center gap-x-5 gap-y-3">
          <AppStoreButton source="footer" />
          <p className="text-[13px]">Замовляйте швидше в застосунку для iPhone.</p>
        </div>

        <div className="flex flex-col gap-2 border-t border-line-soft pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} MobiStuff. Усі права захищені.</p>
          <p>Україна</p>
        </div>
      </Container>
    </footer>
  );
}
