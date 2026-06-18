module.exports = {
  preset: '@react-native/jest-preset',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  transformIgnorePatterns: [
    'node_modules/(?!(react-native|@react-native|@react-navigation|react-native-vector-icons|@react-native-community|react-native-safe-area-context|react-native-screens|@shopify/flash-list)/)',
  ],
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  testMatch: ['**/__tests__/**/*.(test|spec).(ts|tsx|js)'],
  forceExit: true,
};
