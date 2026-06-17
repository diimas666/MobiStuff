import { showErrorToast } from '../context/ToastContext';
import { isNetworkOffline } from '../lib/networkStatus';
import { resolveErrorMessage } from './errors';

export function reportLoadError(error: unknown, fallback: string): string {
  const message = resolveErrorMessage(error, fallback);

  if (!isNetworkOffline()) {
    showErrorToast(error, fallback);
  }

  return message;
}
