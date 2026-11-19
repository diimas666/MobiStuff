import { StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../../context/SettingsContext';

type IconName = string;

type Props = {
  title: string;
  icon?: IconName;
};

export function SettingsSection({ title }: Props) {
  const { colors } = useSettings();

  return (
    <View style={styles.wrap}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.ink3 }]}>{title}</Text>
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
    paddingHorizontal: 16,
  },
  title: {
    fontSize: 13,
    fontWeight: '400',
  },
});
