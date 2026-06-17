import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import type { BrandItem } from '../../types/brand';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  items: BrandItem[];
  isLoading?: boolean;
  onBrandPress?: (brand: BrandItem) => void;
};

export function BrandsSection({ items, isLoading, onBrandPress }: Props) {
  const { styles } = useThemedStyles(c => ({
    section: {
      marginBottom: 28,
    },
    header: {
      marginBottom: 8,
      gap: 4,
    },
    title: {
      fontSize: 20,
      fontWeight: '700',
      color: c.textOnDark,
    },
    subtitle: {
      fontSize: 13,
      lineHeight: 18,
      color: c.textOnDarkMuted,
    },
    list: {
      gap: 12,
      paddingRight: 4,
      paddingTop: 8,
    },
    card: {
      width: 124,
      alignItems: 'center',
    },
    imageBox: {
      width: 112,
      height: 72,
      borderRadius: radius.md,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: 8,
      overflow: 'hidden',
      paddingHorizontal: 10,
      paddingVertical: 8,
    },
    brandImage: {
      width: '100%',
      height: '100%',
    },
    label: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textOnDark,
      textAlign: 'center',
    },
    hint: {
      fontSize: 11,
      color: c.textOnDarkMuted,
      textAlign: 'center',
      marginTop: 2,
    },
    loader: {
      paddingVertical: 24,
      alignItems: 'center',
    },
  }));

  if (isLoading) {
    return (
      <View style={styles.section}>
        <View style={styles.header}>
          <Text style={styles.title}>Популярні бренди</Text>
          <Text style={styles.subtitle}>Натисніть, щоб дізнатися більше про бренд</Text>
        </View>
        <View style={styles.loader}>
          <ActivityIndicator />
        </View>
      </View>
    );
  }

  if (items.length === 0) {
    return null;
  }

  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={styles.title}>Популярні бренди</Text>
        <Text style={styles.subtitle}>Натисніть, щоб дізнатися більше про бренд</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}>
        {items.map(brand => (
          <Pressable
            key={brand.id}
            style={styles.card}
            onPress={() => onBrandPress?.(brand)}>
            <View style={styles.imageBox}>
              <Image
                source={{ uri: brand.image }}
                style={styles.brandImage}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.label} numberOfLines={1}>
              {brand.title}
            </Text>
            <Text style={styles.hint}>Детальніше</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
