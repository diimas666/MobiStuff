import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius, spacing } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { BrandCategoryOption } from '../../utils/brandCategories';

type Props = {
  visible: boolean;
  categories: BrandCategoryOption[];
  selectedSlug: string | null;
  onClose: () => void;
  onSelect: (slug: string | null) => void;
};

export function BrandCategoryFilterSheet({
  visible,
  categories,
  selectedSlug,
  onClose,
  onSelect,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    overlay: {
      flex: 1,
      justifyContent: 'flex-end',
    },
    backdrop: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0, 0, 0, 0.45)',
    },
    sheet: {
      backgroundColor: c.card,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      maxHeight: '72%',
      paddingBottom: 24,
    },
    handle: {
      alignSelf: 'center',
      width: 42,
      height: 4,
      borderRadius: 2,
      backgroundColor: '#D1D5DB',
      marginTop: 10,
      marginBottom: 12,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.screen,
      paddingBottom: 12,
    },
    title: {
      fontSize: 18,
      fontWeight: '700',
      color: c.text,
    },
    closeButton: {
      width: 36,
      height: 36,
      borderRadius: 18,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#F3F4F6',
    },
    list: {
      paddingHorizontal: spacing.screen,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 52,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: '#E5E7EB',
    },
    rowLast: {
      borderBottomWidth: 0,
    },
    rowLabel: {
      flex: 1,
      fontSize: 15,
      fontWeight: '500',
      color: c.text,
      paddingRight: 12,
    },
    rowLabelActive: {
      color: c.primary,
      fontWeight: '700',
    },
    count: {
      fontSize: 13,
      color: c.textMuted,
      marginRight: 10,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: 11,
      borderWidth: 1.5,
      borderColor: '#D1D5DB',
      alignItems: 'center',
      justifyContent: 'center',
    },
    checkboxActive: {
      backgroundColor: c.primary,
      borderColor: c.primary,
    },
    pressed: {
      opacity: 0.85,
    },
  }));

  const options: Array<{ slug: string | null; title: string; count: number }> = [
    {
      slug: null,
      title: 'Усі товари бренду',
      count: categories.reduce((sum, item) => sum + item.count, 0),
    },
    ...categories,
  ];

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}>
      <View style={styles.overlay}>
        <Pressable style={styles.backdrop} onPress={onClose} />

        <View style={styles.sheet}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={styles.title}>Категорія</Text>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Закрити"
              onPress={onClose}
              style={({ pressed }) => [styles.closeButton, pressed && styles.pressed]}>
              <Ionicons name="close" size={20} color={colors.textMuted} />
            </Pressable>
          </View>

          <ScrollView style={styles.list} showsVerticalScrollIndicator={false}>
            {options.map((option, index) => {
              const isActive = selectedSlug === option.slug;

              return (
                <Pressable
                  key={option.slug ?? 'all'}
                  onPress={() => {
                    onSelect(option.slug);
                    onClose();
                  }}
                  style={({ pressed }) => [
                    styles.row,
                    index === options.length - 1 && styles.rowLast,
                    pressed && styles.pressed,
                  ]}>
                  <Text
                    style={[styles.rowLabel, isActive && styles.rowLabelActive]}
                    numberOfLines={2}>
                    {option.title}
                  </Text>
                  <Text style={styles.count}>{option.count}</Text>
                  <View style={[styles.checkbox, isActive && styles.checkboxActive]}>
                    {isActive ? (
                      <Ionicons name="checkmark" size={14} color={colors.textOnDark} />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}
