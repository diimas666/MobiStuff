import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useNetwork } from '../context/NetworkContext';
import { useThemedStyles } from '../hooks/useThemedStyles';

export function OfflineBanner() {
  const { isOffline } = useNetwork();
  const { styles, colors } = useThemedStyles(c => ({
    banner: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 8,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: c.homeSurface,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: 'rgba(255,255,255,0.12)',
    },
    text: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textOnDark,
    },
  }));

  if (!isOffline) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <Ionicons name="cloud-offline-outline" size={16} color={colors.priceLight} />
      <Text style={styles.text}>Немає інтернету</Text>
    </View>
  );
}
