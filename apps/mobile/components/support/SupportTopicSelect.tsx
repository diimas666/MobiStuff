import { ActionSheetIOS, Alert, Platform, Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { SUPPORT_TOPICS, type SupportTopicId } from '../../constants/support';
import { useSettings } from '../../context/SettingsContext';

type Props = {
  value: SupportTopicId | null;
  onChange: (value: SupportTopicId) => void;
  errorText?: string;
};

export function SupportTopicSelect({ value, onChange, errorText }: Props) {
  const { colors, resolvedTheme } = useSettings();
  const currentLabel =
    SUPPORT_TOPICS.find(option => option.id === value)?.label ?? 'Оберіть тему';

  const openPicker = () => {
    const options = [...SUPPORT_TOPICS.map(option => option.label), 'Скасувати'];
    const cancelButtonIndex = options.length - 1;

    const handleSelect = (index: number) => {
      if (index === cancelButtonIndex) {
        return;
      }
      const selected = SUPPORT_TOPICS[index];
      if (selected) {
        onChange(selected.id);
      }
    };

    if (Platform.OS === 'ios') {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options,
          cancelButtonIndex,
          title: 'Тема звернення',
        },
        handleSelect,
      );
      return;
    }

    Alert.alert(
      'Тема звернення',
      undefined,
      [
        ...SUPPORT_TOPICS.map((option, index) => ({
          text: option.label,
          onPress: () => handleSelect(index),
        })),
        { text: 'Скасувати', style: 'cancel' },
      ],
      { cancelable: true },
    );
  };

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, { color: colors.text }]}>Тема звернення</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Тема звернення: ${currentLabel}`}
        onPress={openPicker}
        style={({ pressed }) => [
          styles.dropdown,
          {
            backgroundColor: colors.card,
            borderColor: errorText
              ? colors.danger
              : resolvedTheme === 'dark'
                ? '#374151'
                : '#E5E7EB',
          },
          pressed && styles.pressed,
        ]}>
        <Text
          style={[
            styles.dropdownText,
            { color: value ? colors.text : colors.textMuted },
          ]}>
          {currentLabel}
        </Text>
        <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
      </Pressable>
      {errorText ? (
        <Text style={[styles.error, { color: colors.danger }]}>{errorText}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    paddingHorizontal: 2,
  },
  dropdown: {
    minHeight: 54,
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
  },
  dropdownText: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  error: {
    fontSize: 12,
    paddingHorizontal: 2,
  },
  pressed: {
    opacity: 0.88,
  },
});
