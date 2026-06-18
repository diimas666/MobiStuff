import type { ReactElement } from 'react';
import ReactTestRenderer from 'react-test-renderer';
import { SettingsProvider } from '../context/SettingsContext';

export async function renderWithProviders(ui: ReactElement) {
  let tree: ReactTestRenderer.ReactTestRenderer | undefined;

  await ReactTestRenderer.act(() => {
    tree = ReactTestRenderer.create(<SettingsProvider>{ui}</SettingsProvider>);
  });

  return tree!;
}
