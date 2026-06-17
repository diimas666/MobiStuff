import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import type { CatalogSubcategory } from '../../utils/catalogTree';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  subcategories: CatalogSubcategory[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export function SubcategoryChipBar({ subcategories, selectedSlug, onSelect }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  wrap: {
    marginBottom: 12,
  },
  content: {
    gap: 8,
    paddingRight: 4,
  },
  chip: {
    maxWidth: 220,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    backgroundColor: c.homeSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  chipActive: {
    backgroundColor: c.primary,
    borderColor: c.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textOnDarkMuted,
  },
  chipTextActive: {
    color: c.textOnDark,
  },
}));

  if (subcategories.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Pressable
          accessibilityRole="button"
          onPress={() => onSelect(null)}
          style={[styles.chip, selectedSlug == null && styles.chipActive]}>
          <Text style={[styles.chipText, selectedSlug == null && styles.chipTextActive]}>
            Усі
          </Text>
        </Pressable>

        {subcategories.map(sub => {
          const isActive = selectedSlug === sub.slug;

          return (
            <Pressable
              key={sub.slug}
              accessibilityRole="button"
              onPress={() => onSelect(isActive ? null : sub.slug)}
              style={[styles.chip, isActive && styles.chipActive]}>
              <Text style={[styles.chipText, isActive && styles.chipTextActive]} numberOfLines={1}>
                {sub.title}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
    </View>
  );
}

