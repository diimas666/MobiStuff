import { Platform, Vibration } from 'react-native';
import { getSettingsSnapshot } from '../services/settingsStorage';

export async function triggerAddToCartHaptic(): Promise<void> {
  const settings = await getSettingsSnapshot();

  if (!settings.hapticFeedback) {
    return;
  }

  try {
    if (Platform.OS === 'android') {
      Vibration.vibrate(25);
      return;
    }

    Vibration.vibrate(10);
  } catch {
    // Вібровідгук недоступний на цьому пристрої
  }
}
