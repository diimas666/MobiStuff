import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSettings } from '../context/SettingsContext';

type Props = {
  label?: string;
};

export function LoadingState({ label = 'Завантаження...' }: Props) {
  const { colors } = useSettings();

  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={[styles.label, { color: colors.textOnDarkMuted }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  label: {
    fontSize: 14,
  },
});
