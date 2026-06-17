import { Image, StyleSheet, Text, View } from 'react-native';
import { radius } from '../constants/theme';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = {
  uri?: string;
  label?: string;
  size?: number;
  rounded?: number;
  resizeMode?: 'cover' | 'contain';
  backgroundColor?: string;
};

export function ProductImage({
  uri,
  label = '?',
  size = 72,
  rounded = radius.md,
  resizeMode = 'cover',
  backgroundColor,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  image: {
    backgroundColor: c.screen,
  },
  placeholder: {
    backgroundColor: c.screen,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '700',
    color: c.textMuted,
  },
}));

  const resolvedBackground = backgroundColor ?? colors.screen;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          styles.image,
          { width: size, height: size, borderRadius: rounded, backgroundColor: resolvedBackground },
        ]}
        resizeMode={resizeMode}
      />
    );
  }

  return (
    <View
      style={[
        styles.placeholder,
        { width: size, height: size, borderRadius: rounded, backgroundColor: resolvedBackground },
      ]}>
      <Text style={styles.placeholderText}>{label.slice(0, 1).toUpperCase()}</Text>
    </View>
  );
}

