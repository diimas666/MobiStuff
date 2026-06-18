import { ProductScreenHeader } from '../../components/product/ProductScreenHeader';
import { renderWithProviders } from '../testUtils';

describe('ProductScreenHeader', () => {
  it('renders back and cart actions', async () => {
    const onBack = jest.fn();
    const onCartPress = jest.fn();
    const tree = await renderWithProviders(
      <ProductScreenHeader onBack={onBack} onCartPress={onCartPress} cartCount={2} />,
    );

    expect(tree.root.findByProps({ testID: 'product-header-back' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'product-header-cart' })).toBeTruthy();
    expect(tree.root.findByProps({ testID: 'product-header-cart-badge' })).toBeTruthy();
  });
});
