let isOffline = false;

type Listener = (offline: boolean) => void;
const listeners = new Set<Listener>();

export function setNetworkOffline(value: boolean) {
  if (isOffline === value) {
    return;
  }

  isOffline = value;
  listeners.forEach(listener => listener(value));
}

export function isNetworkOffline(): boolean {
  return isOffline;
}

export function subscribeNetworkOffline(listener: Listener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
