import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SectionHeader } from '../ui/SectionHeader';
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
      marginBottom: 32,
    },
    list: {
      gap: 10,
      paddingRight: 4,
    },
    card: {
      width: 120,
      alignItems: 'center',
    },
    imageBox: {
      width: 120,
      height: 76,
      borderRadius: 20,
      backgroundColor: '#FFFFFF',
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
      color: c.text,
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
        <SectionHeader title="Бренди" subtitle="Перевірені виробники, офіційний товар." />
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
      <SectionHeader title="Бренди" subtitle="Перевірені виробники, офіційний товар." />

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
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}
