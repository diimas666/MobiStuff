import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  icon: IconName;
  label: string;
  onPress: () => void;
  badge?: number | string;
  showChevron?: boolean;
};

export function ProfileMenuItem({
  icon,
  label,
  onPress,
  badge,
  showChevron = true,
}: Props) {
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}>
      <View style={styles.iconWrap}>
        <Ionicons name={icon} size={22} color={colors.textMuted} />
      </View>

      <Text style={styles.label}>{label}</Text>

      {badge != null ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      ) : showChevron ? (
        <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    gap: 14,
  },
  pressed: {
    opacity: 0.72,
  },
  iconWrap: {
    width: 28,
    alignItems: 'center',
  },
  label: {
    flex: 1,
    fontSize: 16,
    fontWeight: '500',
    color: colors.text,
  },
  badge: {
    minWidth: 24,
    height: 24,
    borderRadius: radius.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 7,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.textOnDark,
  },
});
