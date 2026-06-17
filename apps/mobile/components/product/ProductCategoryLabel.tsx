import { StyleSheet, Text } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  category?: string;
};

export function ProductCategoryLabel({ category }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  category: {
    fontSize: 13,
    fontWeight: '600',
    color: c.priceLight,
    marginBottom: 6,
  },
}));

  if (!category) {
    return null;
  }

  return <Text style={styles.category}>{category}</Text>;
}

