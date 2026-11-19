import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { useCart } from '../../context/CartContext';

type Props = {
  onCartPress?: () => void;
};

/** Логотип і кошик — як шапка сайту */
export function HomeHeader({ onCartPress }: Props) {
  const { totalQuantity } = useCart();
  const { styles, colors } = useThemedStyles(c => ({
    row: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: 6, marginBottom: 14 },
    logo: { fontSize: 30, fontWeight: '700', letterSpacing: -1, color: c.text },
    logoAccent: { color: c.primary },
    subtitle: { marginTop: 1, fontSize: 15, color: c.textOnDarkMuted },
    cartButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: c.card,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badge: {
      position: 'absolute',
      top: -2,
      right: -2,
      minWidth: 19,
      height: 19,
      paddingHorizontal: 5,
      borderRadius: 10,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 2,
      borderColor: c.screen,
    },
    badgeText: { fontSize: 11, fontWeight: '700', color: c.onPrimary },
  }));

  return (
    <View style={styles.row}>
      <View>
        <Text testID="home-greeting" style={styles.logo} accessibilityRole="header">
          Mobi<Text style={styles.logoAccent}>Stuff</Text>
        </Text>
        <Text style={styles.subtitle}>Аксесуари для телефону</Text>
      </View>

      <Pressable
        accessibilityRole="button"
        accessibilityLabel={totalQuantity ? `Кошик, товарів: ${totalQuantity}` : 'Кошик'}
        onPress={onCartPress}
        style={({ pressed }) => [styles.cartButton, pressed && { opacity: 0.7 }]}>
        <Ionicons name="bag-outline" size={22} color={colors.text} />
        {totalQuantity > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{totalQuantity > 99 ? '99+' : totalQuantity}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
