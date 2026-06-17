import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';
import { showToast } from '../../context/ToastContext';
import type { AppLanguage } from '../../types/settings';
import { LANGUAGE_OPTIONS } from '../../types/settings';

type Props = {
  value: AppLanguage;
  onChange: (value: AppLanguage) => void;
};

export function SettingLanguageRow({ value, onChange }: Props) {
  const { colors, resolvedTheme } = useSettings();
  const currentLabel = LANGUAGE_OPTIONS.find(option => option.id === value)?.label ?? 'Українська';

  const openPicker = () => {
    const options = [...LANGUAGE_OPTIONS.map(option => option.label), 'Скасувати'];
    const cancelButtonIndex = options.length - 1;

    const handleSelect = (index: number) => {
      if (index === cancelButtonIndex) {
        return;
      }

      const selected = LANGUAGE_OPTIONS[index];
      if (!selected) {
        return;
      }

      if (!selected.available) {
        showToast('Ця мова незабаром буде доступна', 'info');
        return;
      }

      onChange(selected.id);
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Мова інтерфейсу',
        },
        handleSelect,
      );
      return;
    }

    Alert.alert(
      'Мова інтерфейсу',
      undefined,
      [
        ...LANGUAGE_OPTIONS.map((option, index) => ({
          text: option.available ? option.label : `${option.label} (скоро)`,
          onPress: () => handleSelect(index),
        })),
        { text: 'Скасувати', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={[styles.row, { backgroundColor: colors.card }]}>
      <Text style={[styles.label, { color: colors.text }]}>Мова інтерфейсу</Text>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Мова ${currentLabel}`}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.dropdown,
          {
            borderColor: resolvedTheme === 'dark' ? '#374151' : '#E5E7EB',
            backgroundColor: resolvedTheme === 'dark' ? '#111827' : '#F9FAFB',
          },
          pressed && styles.pressed,
        ]}>
        <Text style={[styles.dropdownText, { color: colors.text }]}>{currentLabel}</Text>
        <Ionicons name="chevron-down" size={16} color={colors.textMuted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    flex: 1,
  },
  dropdown: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: radius.pill,
    borderWidth: 1,
    minWidth: 132,
    justifyContent: 'space-between',
  },
  dropdownText: {
    fontSize: 14,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.88,
  },
});
