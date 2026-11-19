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
    color: c.ink3,
    marginBottom: 4,
  },
}));

  if (!category) {
    return null;
  }

  return <Text style={styles.category}>{category}</Text>;
}

