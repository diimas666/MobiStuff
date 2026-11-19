import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { formatPrice } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

/** «Ще N ₴ до безкоштовної доставки» — шкала як у кошику на сайті */
export function FreeDeliveryProgress({ total, threshold }: { total: number; threshold: number }) {
  const { styles, colors } = useThemedStyles(c => ({
    box: { backgroundColor: c.card, borderRadius: 18, padding: 14, marginBottom: 14 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    text: { flex: 1, fontSize: 14, lineHeight: 19, color: c.text },
    bold: { fontWeight: '700' },
    track: { marginTop: 10, height: 6, borderRadius: 3, backgroundColor: c.fill, overflow: 'hidden' },
    fill: { height: 6, borderRadius: 3, backgroundColor: c.primary },
  }));
  if (!threshold) return null;
  const left = Math.max(0, threshold - total);
  const progress = Math.min(1, total / threshold);
  return (
    <View style={styles.box}>
      <View style={styles.row}>
        <Ionicons name={left ? 'car-outline' : 'checkmark-circle'} size={20} color={colors.primary} />
        <Text style={styles.text}>
          {left ? (
            <>
              Ще <Text style={styles.bold}>{formatPrice(left)}</Text> до безкоштовної доставки
            </>
          ) : (
            <Text style={styles.bold}>Доставка безкоштовна</Text>
          )}
        </Text>
      </View>
      <View style={styles.track}>
        <View style={[styles.fill, { width: `${progress * 100}%` }]} />
      </View>
    </View>
  );
}
