/**
 * @format
 */

import React from 'react';
import App from '../App';
import { renderWithProviders } from './testUtils';

jest.mock('../navigation/RootNavigator', () => ({
  RootNavigator: () => {
    const { Text } = require('react-native');
    return <Text testID="app-shell">Mobistuff</Text>;
  },
}));

test('renders app shell', async () => {
  const tree = await renderWithProviders(<App />);
  expect(tree.root.findByProps({ testID: 'app-shell' })).toBeTruthy();
});
