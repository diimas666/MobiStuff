import { memo } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { radius, spacing } from '../../constants/theme';
import type { HomeCategory } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  category: HomeCategory;
  onPress?: (category: HomeCategory) => void;
};

export const CategoryListItem = memo(function CategoryListItem({
  category,
  onPress,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  row: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: spacing.screen,
    gap: 16,
  },
  imageBox: {
    width: 72,
    height: 72,
    borderRadius: radius.md,
    backgroundColor: c.card,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: c.textOnDark,
    lineHeight: 22,
  },
  arrow: {
    marginLeft: 8,
  },
}));

  return (
    <Pressable
      style={styles.row}
      onPress={() => onPress?.(category)}
      accessibilityRole="button"
      accessibilityLabel={category.title}>
      <View style={styles.imageBox}>
        <ProductImage
          uri={category.image}
          label={category.title}
          size={56}
          rounded={radius.md}
        />
      </View>
      <Text style={styles.title} numberOfLines={2}>
        {category.title}
      </Text>
      <Ionicons
        name="chevron-forward"
        size={20}
        color={colors.textOnDarkMuted}
        style={styles.arrow}
      />
    </Pressable>
  );
});

