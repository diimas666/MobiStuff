import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const MAX_HEIGHT = 420;

type Props = {
  text: string;
};

export function ProductDescription({ text }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  block: {
    marginBottom: 24,
    backgroundColor: c.card,
    borderRadius: 22,
    padding: 18,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '700',
    letterSpacing: -0.3,
    color: c.text,
    marginBottom: 8,
  },
  scroll: {
    maxHeight: MAX_HEIGHT,
  },
  scrollContent: {
    paddingBottom: 4,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
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

