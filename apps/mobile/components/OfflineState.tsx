import { useNetwork } from '../context/NetworkContext';
import { StateView } from './StateView';

type Props = {
  onRetry?: () => void;
};

/** Немає інтернету: кошик і обране збережені на телефоні */
export function OfflineState({ onRetry }: Props) {
  const { refresh } = useNetwork();
  return (
    <StateView
      testID="state-offline"
      icon="cloud-offline-outline"
      title="Немає інтернету"
      message="Перевірте Wi‑Fi або мобільні дані. Кошик і обране збережені — нічого не загубиться."
      actionLabel="Спробувати ще раз"
      onAction={() => (onRetry ? onRetry() : void refresh())}
    />
  );
}
