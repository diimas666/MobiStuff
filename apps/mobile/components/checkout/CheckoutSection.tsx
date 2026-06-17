import type { ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  title: string;
  children: ReactNode;
};

export function CheckoutSection({ title, children }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  section: {
    gap: 12,
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    color: c.textOnDark,
    letterSpacing: -0.3,
  },
  card: {
    backgroundColor: c.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 10,
    elevation: 3,
  },
}));

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{title}</Text>
      <View style={styles.card}>{children}</View>
    </View>
  );
}

