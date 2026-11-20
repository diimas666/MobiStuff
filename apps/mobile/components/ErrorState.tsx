import { OfflineState } from './OfflineState';
import { StateView } from './StateView';
import { useNetwork } from '../context/NetworkContext';

type Props = {
  message?: string;
  onRetry?: () => void;
  /** Додаткова дія, напр. «До каталогу» для товару, якого вже немає */
  secondaryLabel?: string;
  onSecondary?: () => void;
};

/** Помилка завантаження або «не знайдено» (аналог 404 на сайті) */
export function ErrorState({
  message = 'Не вдалося завантажити дані. Спробуйте ще раз за мить.',
  onRetry,
  secondaryLabel,
  onSecondary,
}: Props) {
  const { isOffline } = useNetwork();
  if (isOffline) return <OfflineState onRetry={onRetry} />;

  const notFound = /не знайдено|not found/i.test(message);
  return (
    <StateView
      icon={notFound ? 'search-outline' : 'alert-circle-outline'}
      title={notFound ? 'Нічого не знайдено' : 'Щось пішло не так'}
      message={notFound ? 'Можливо, товар закінчився або посилання застаріло. Подивіться інші товари в каталозі.' : message}
      actionLabel={notFound ? undefined : 'Спробувати ще раз'}
      onAction={notFound ? undefined : onRetry}
      secondaryLabel={secondaryLabel}
      onSecondary={onSecondary}
    />
  );
}
