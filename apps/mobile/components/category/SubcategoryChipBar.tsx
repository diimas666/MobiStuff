import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { colors, radius } from '../../constants/theme';
import type { CatalogSubcategory } from '../../utils/catalogTree';

type Props = {
  subcategories: CatalogSubcategory[];
  selectedSlug: string | null;
  onSelect: (slug: string | null) => void;
};

export function SubcategoryChipBar({ subcategories, selectedSlug, onSelect }: Props) {
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

const styles = StyleSheet.create({
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
    backgroundColor: colors.homeSurface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textOnDarkMuted,
  },
  chipTextActive: {
    color: colors.textOnDark,
  },
});
