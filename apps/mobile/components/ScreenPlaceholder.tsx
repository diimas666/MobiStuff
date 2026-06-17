import { StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  title: string;
  subtitle?: string;
};

export function ScreenPlaceholder({ title, subtitle }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: c.screen,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: c.text,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: c.textMuted,
    textAlign: 'center',
  },
}));

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{title}</Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}

