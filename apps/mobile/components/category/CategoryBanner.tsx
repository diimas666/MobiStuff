import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { radius, spacing } from '../../constants/theme';
import type { HomeCategory } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  category: HomeCategory;
  subtitle?: string;
  onBack?: () => void;
};

const IMAGE_HEIGHT = 140;

export function CategoryBanner({ category, subtitle, onBack }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    wrapper: {
      marginHorizontal: spacing.screen,
      marginBottom: 12,
    },
    card: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      overflow: 'hidden',
    },
    imageWrap: {
      width: '100%',
      height: IMAGE_HEIGHT,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: c.card,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    backButton: {
      position: 'absolute',
      top: 8,
      left: 16,
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0, 0, 0, 0.35)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    titleStrip: {
      backgroundColor: c.card,
      paddingHorizontal: 16,
      paddingVertical: 12,
    },
    title: {
      fontSize: 22,
      fontWeight: '700',
      color: c.text,
    },
    subtitle: {
      marginTop: 4,
      fontSize: 14,
      fontWeight: '500',
      color: c.textMuted,
    },
  }));

  return (
    <View style={styles.wrapper}>
      <View style={styles.card}>
        <View style={styles.imageWrap}>
          {category.image ? (
            <Image
              source={{ uri: category.image }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <ProductImage
              uri={category.image}
              label={category.title}
              size={120}
              rounded={radius.lg}
              resizeMode="contain"
              backgroundColor={colors.card}
            />
          )}

          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Назад"
            onPress={onBack}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={22} color={colors.textOnDark} />
          </Pressable>
        </View>

        <View style={styles.titleStrip}>
          <Text style={styles.title}>{category.title}</Text>
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      </View>
    </View>
  );
}
