import type { ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  label: string;
  hint?: string;
  selected: boolean;
  onPress: () => void;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function CheckoutRadioRow({
  label,
  hint,
  selected,
  onPress,
  leading,
  trailing,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    minHeight: 64,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  rowSelected: {
    borderColor: c.primary,
    backgroundColor: '#F0FDF4',
  },
  pressed: {
    opacity: 0.92,
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '700',
    color: c.text,
  },
  hint: {
    fontSize: 13,
    color: c.textMuted,
  },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: {
    borderColor: c.primary,
  },
  radioDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: c.primary,
  },
}));

  return (
    <Pressable
      accessibilityRole="radio"
      accessibilityState={{ selected }}
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        selected && styles.rowSelected,
        pressed && styles.pressed,
      ]}>
      {leading}
      <View style={styles.content}>
        <Text style={styles.label}>{label}</Text>
        {hint ? <Text style={styles.hint}>{hint}</Text> : null}
      </View>
      {trailing}
      <View style={[styles.radio, selected && styles.radioSelected]}>
        {selected ? <View style={styles.radioDot} /> : null}
      </View>
    </Pressable>
  );
}

