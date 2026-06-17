import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const MAX_HEIGHT = 500;

type Props = {
  text: string;
};

export function ProductDescription({ text }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  block: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: c.textOnDark,
    marginBottom: 8,
  },
  scroll: {
    maxHeight: MAX_HEIGHT,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  description: {
    fontSize: 14,
    lineHeight: 22,
    color: c.textOnDarkMuted,
  },
}));

  return (
    <View style={styles.block}>
      <Text style={styles.sectionTitle}>Опис товару</Text>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        nestedScrollEnabled
        showsVerticalScrollIndicator>
        <Text style={styles.description}>{text}</Text>
      </ScrollView>
    </View>
  );
}

