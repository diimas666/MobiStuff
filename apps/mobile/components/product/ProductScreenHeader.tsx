import { Pressable, Share, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  onBack: () => void;
  onCartPress: () => void;
  cartCount?: number;
  shareUrl?: string;
  shareTitle?: string;
};

/** Шапка товару: назад, поділитися, кошик — круглі кнопки як в iOS */
export function ProductScreenHeader({ onBack, onCartPress, cartCount = 0, shareUrl, shareTitle }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    row: { paddingHorizontal: spacing.screen, paddingBottom: 8, flexDirection: 'row', alignItems: 'center', gap: 10 },
    btn: { width: 40, height: 40, borderRadius: 20, backgroundColor: c.card, alignItems: 'center', justifyContent: 'center' },
    badge: {
      position: 'absolute', top: -4, right: -4, minWidth: 18, height: 18, paddingHorizontal: 4, borderRadius: 9,
      backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: c.screen,
    },
    badgeText: { fontSize: 10, fontWeight: '700', color: c.onPrimary },
  }));
  const press = ({ pressed }: { pressed: boolean }) => [styles.btn, pressed && { opacity: 0.6 }];

  return (
    <View style={styles.row}>
      <Pressable accessibilityRole="button" accessibilityLabel="Назад" testID="product-header-back" onPress={onBack} style={press}>
        <Ionicons name="chevron-back" size={22} color={colors.text} />
      </Pressable>
      <View style={{ flex: 1 }} />
      {shareUrl ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Поділитися"
          onPress={() => void Share.share({ message: `${shareTitle ?? ''} ${shareUrl}`.trim(), url: shareUrl })}
          style={press}>
          <Ionicons name="share-outline" size={20} color={colors.text} />
        </Pressable>
      ) : null}
      <Pressable accessibilityRole="button" accessibilityLabel="Кошик" testID="product-header-cart" onPress={onCartPress} style={press}>
        <Ionicons name="bag-outline" size={20} color={colors.text} />
        {cartCount > 0 ? (
          <View testID="product-header-cart-badge" style={styles.badge}>
            <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}
