import { Pressable, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useSettings } from '../../context/SettingsContext';

type Props = {
  onPress: () => void;
};

export function BackButton({ onPress }: Props) {
  const { colors } = useSettings();

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel="Назад"
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        { backgroundColor: colors.homeSurface },
        pressed && styles.pressed,
      ]}>
      <Ionicons name="arrow-back" size={22} color={colors.textOnDark} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
});
