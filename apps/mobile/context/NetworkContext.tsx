import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { showToast } from './ToastContext';
import { errorMessages } from '../utils/errors';
import { setNetworkOffline, subscribeNetworkOffline } from '../lib/networkStatus';
import {
  deriveIsOffline,
  loadNetInfoModule,
  refreshFetchNetworkState,
  startFetchNetworkMonitor,
  type NetworkMonitorState,
} from '../lib/networkMonitor';

type NetworkContextValue = {
  isOffline: boolean;
  isConnected: boolean | null;
  reconnectCount: number;
  refresh: () => Promise<NetworkMonitorState>;
};

const NetworkContext = createContext<NetworkContextValue | null>(null);

export function NetworkProvider({ children }: { children: ReactNode }) {
  const [netState, setNetState] = useState<NetworkMonitorState | null>(null);
  const [reconnectCount, setReconnectCount] = useState(0);
  const wasOfflineRef = useRef(false);
  const isInitialRef = useRef(true);
  const usesFetchMonitorRef = useRef(false);

  const applyState = useCallback((nextState: NetworkMonitorState) => {
    const offline = deriveIsOffline(nextState);

    if (!isInitialRef.current) {
      if (offline && !wasOfflineRef.current) {
        showToast(errorMessages.noInternet, 'error');
      }

      if (!offline && wasOfflineRef.current) {
        showToast(errorMessages.connectionRestored, 'success');
        setReconnectCount(count => count + 1);
      }
    }

    isInitialRef.current = false;
    wasOfflineRef.current = offline;
    setNetworkOffline(offline);
    setNetState(nextState);
  }, []);

  const refresh = useCallback(async () => {
    if (usesFetchMonitorRef.current) {
      const nextState = await refreshFetchNetworkState();
      applyState(nextState);
      return nextState;
    }

    const NetInfo = loadNetInfoModule();
    if (!NetInfo) {
      const nextState = await refreshFetchNetworkState();
      applyState(nextState);
      return nextState;
    }

    const nextState = await NetInfo.refresh();
    applyState(nextState);
    return nextState;
  }, [applyState]);

  useEffect(() => {
    const unsubscribeOffline = subscribeNetworkOffline(offline => {
      applyState({
        isConnected: !offline,
        isInternetReachable: !offline,
      });
    });

    const NetInfo = loadNetInfoModule();
    let unsubscribeMonitor: (() => void) | undefined;

    if (!NetInfo) {
      usesFetchMonitorRef.current = true;
      unsubscribeMonitor = startFetchNetworkMonitor(applyState);
    } else {
      try {
        unsubscribeMonitor = NetInfo.addEventListener(applyState);
        void NetInfo.fetch().then(applyState);
      } catch {
        usesFetchMonitorRef.current = true;
        unsubscribeMonitor = startFetchNetworkMonitor(applyState);
      }
    }

    return () => {
      unsubscribeOffline();
      unsubscribeMonitor?.();
    };
  }, [applyState]);

  const value = useMemo<NetworkContextValue>(
    () => ({
      isOffline: netState ? deriveIsOffline(netState) : false,
      isConnected: netState?.isConnected ?? null,
      reconnectCount,
      refresh,
    }),
    [netState, reconnectCount, refresh],
  );

  return <NetworkContext.Provider value={value}>{children}</NetworkContext.Provider>;
}

export function useNetwork() {
  const context = useContext(NetworkContext);

  if (!context) {
    throw new Error('useNetwork must be used within NetworkProvider');
  }

  return context;
}

export function useNetworkReconnectEffect(effect: () => void) {
  const { reconnectCount } = useNetwork();
  const effectRef = useRef(effect);

  effectRef.current = effect;

  useEffect(() => {
    if (reconnectCount === 0) {
      return;
    }

    const timer = setTimeout(() => {
      effectRef.current();
    }, 400);

    return () => {
      clearTimeout(timer);
    };
  }, [reconnectCount]);
}
