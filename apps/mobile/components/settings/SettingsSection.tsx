import type { ComponentProps } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../../context/SettingsContext';

type IconName = ComponentProps<typeof Ionicons>['name'];

type Props = {
  title: string;
  icon?: IconName;
};

export function SettingsSection({ title, icon }: Props) {
  const { colors } = useSettings();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        {icon ? <Ionicons name={icon} size={16} color={colors.primary} /> : null}
        <Text style={[styles.title, { color: colors.textOnDarkMuted }]}>{title}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginBottom: 8,
    marginTop: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 4,
  },
  title: {
    fontSize: 13,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
});
