import { AppState } from 'react-native';
import { baseUrl } from '../config/api';

export type NetworkMonitorState = {
  isConnected: boolean | null;
  isInternetReachable: boolean | null;
};

const CHECK_INTERVAL_MS = 15000;
const REQUEST_TIMEOUT_MS = 5000;

export function deriveIsOffline(state: NetworkMonitorState): boolean {
  if (state.isConnected === false) {
    return true;
  }

  if (state.isInternetReachable === false) {
    return true;
  }

  return false;
}

async function probeNetwork(): Promise<NetworkMonitorState> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${baseUrl}/api/promotions`, {
      method: 'GET',
      headers: { Accept: 'application/json' },
      signal: controller.signal,
    });

    const online = response.ok;

    return {
      isConnected: online,
      isInternetReachable: online,
    };
  } catch {
    return {
      isConnected: false,
      isInternetReachable: false,
    };
  } finally {
    clearTimeout(timeoutId);
  }
}

export function startFetchNetworkMonitor(
  onChange: (state: NetworkMonitorState) => void,
): () => void {
  let cancelled = false;

  const runCheck = async () => {
    const state = await probeNetwork();

    if (!cancelled) {
      onChange(state);
    }
  };

  void runCheck();

  const intervalId = setInterval(() => {
    void runCheck();
  }, CHECK_INTERVAL_MS);

  const appStateSubscription = AppState.addEventListener('change', nextState => {
    if (nextState === 'active') {
      void runCheck();
    }
  });

  return () => {
    cancelled = true;
    clearInterval(intervalId);
    appStateSubscription.remove();
  };
}

export async function refreshFetchNetworkState(): Promise<NetworkMonitorState> {
  return probeNetwork();
}

type NetInfoModule = {
  addEventListener: (listener: (state: NetworkMonitorState) => void) => () => void;
  fetch: () => Promise<NetworkMonitorState>;
  refresh: () => Promise<NetworkMonitorState>;
};

export function loadNetInfoModule(): NetInfoModule | null {
  try {
    return require('@react-native-community/netinfo').default as NetInfoModule;
  } catch {
    return null;
  }
}
