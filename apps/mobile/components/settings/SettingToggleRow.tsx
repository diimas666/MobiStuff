import type { ComponentProps } from 'react';
import { StyleSheet, Switch, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  label: string;
  hint?: string;
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
};

export function SettingToggleRow({
  icon,
  label,
  hint,
  value,
  onValueChange,
  disabled = false,
}: Props) {
  const { colors } = useSettings();

  return (
    <View style={[styles.row, { backgroundColor: colors.card }, disabled && styles.rowDisabled]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={18} color={colors.primary} />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: colors.text }]}>{label}</Text>
        {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        trackColor={{ false: '#D1D5DB', true: '#86EFAC' }}
        thumbColor={value ? colors.primary : '#F9FAFB'}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    minHeight: 58,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: radius.md,
  },
  rowDisabled: {
    opacity: 0.6,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    gap: 2,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
  },
  hint: {
    fontSize: 12,
    lineHeight: 17,
  },
});
