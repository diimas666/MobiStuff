import { Pressable, StyleSheet, Text, View } from 'react-native';
import { radius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type Option<T extends string> = {
  id: T;
  label: string;
  disabled?: boolean;
};

type Props<T extends string> = {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
};

export function SettingOptionChips<T extends string>({ options, value, onChange }: Props<T>) {
  const { colors } = useSettings();

  return (
    <View style={[styles.wrap, { backgroundColor: colors.card }]}>
      {options.map(option => {
        const selected = option.id === value;

        return (
          <Pressable
            key={option.id}
            accessibilityRole="button"
            accessibilityState={{ selected, disabled: option.disabled }}
            disabled={option.disabled}
            onPress={() => onChange(option.id)}
            style={({ pressed }) => [
              styles.chip,
              selected && { borderColor: colors.primary, backgroundColor: '#F0FDF4' },
              option.disabled && styles.chipDisabled,
              pressed && !option.disabled && styles.pressed,
            ]}>
            <Text
              style={[
                styles.chipText,
                { color: colors.textMuted },
                selected && { color: colors.primaryDark },
                option.disabled && styles.chipTextDisabled,
              ]}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    padding: 14,
    borderRadius: radius.md,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    backgroundColor: '#F9FAFB',
  },
  chipDisabled: {
    opacity: 0.55,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
  },
  chipTextDisabled: {
    opacity: 0.7,
  },
  pressed: {
    opacity: 0.88,
  },
});
