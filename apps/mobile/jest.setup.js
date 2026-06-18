jest.mock('@react-native-async-storage/async-storage', () => ({
  setItem: jest.fn(async () => undefined),
  getItem: jest.fn(async () => null),
  removeItem: jest.fn(async () => undefined),
  clear: jest.fn(async () => undefined),
  getAllKeys: jest.fn(async () => []),
  multiGet: jest.fn(async () => []),
  multiSet: jest.fn(async () => undefined),
  multiRemove: jest.fn(async () => undefined),
}));

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(() => jest.fn()),
  fetch: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
}));

jest.mock('react-native-vector-icons/Ionicons', () => 'Icon');

jest.mock('react-native-safe-area-context', () => {
  const React = require('react');
  const { View } = require('react-native');

  return {
    SafeAreaProvider: ({ children }) => children,
    SafeAreaView: ({ children, style }) => <View style={style}>{children}</View>,
    useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  };
});

jest.mock('react-native-screens', () => ({
  enableScreens: jest.fn(),
}));

jest.mock('./lib/networkMonitor', () => ({
  deriveIsOffline: jest.fn(() => false),
  startFetchNetworkMonitor: jest.fn(() => jest.fn()),
  refreshFetchNetworkState: jest.fn(async () => ({
    isConnected: true,
    isInternetReachable: true,
  })),
  loadNetInfoModule: jest.fn(() => null),
}));
