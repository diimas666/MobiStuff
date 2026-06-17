import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { useSettings } from '../../context/SettingsContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  label: string;
  hint?: string;
  value?: string;
  destructive?: boolean;
  onPress: () => void;
};

export function SettingLinkRow({
  icon,
  label,
  hint,
  value,
  destructive = false,
  onPress,
}: Props) {
  const { colors } = useSettings();

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.row,
        { backgroundColor: colors.card },
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
        <Ionicons
          name={icon}
          size={18}
          color={destructive ? colors.danger : colors.primary}
        />
      </View>
      <View style={styles.content}>
        <Text style={[styles.label, { color: destructive ? colors.danger : colors.text }]}>
          {label}
        </Text>
        {hint ? <Text style={[styles.hint, { color: colors.textMuted }]}>{hint}</Text> : null}
      </View>
      {value ? <Text style={[styles.value, { color: colors.textMuted }]}>{value}</Text> : null}
      <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
    </Pressable>
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
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapDanger: {
    backgroundColor: '#FEF2F2',
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
  value: {
    fontSize: 13,
    fontWeight: '600',
  },
});
