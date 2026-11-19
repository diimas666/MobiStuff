import { Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const PERKS = [
  { icon: 'car-outline', title: 'Доставка Новою Поштою', text: '1–3 дні по всій Україні' },
  { icon: 'wallet-outline', title: 'Оплата при отриманні', text: 'Огляньте товар у відділенні' },
  { icon: 'refresh-outline', title: '14 днів на повернення', text: 'Якщо товар не підійшов' },
] as const;

/** Умови покупки під ціною — як на сторінці товару на сайті */
export function ProductPerks() {
  const { styles, colors } = useThemedStyles(c => ({
    box: { backgroundColor: c.card, borderRadius: 22, paddingHorizontal: 16, marginBottom: 20 },
    row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingVertical: 13 },
    divider: { borderTopWidth: 0.5, borderTopColor: c.line },
    title: { fontSize: 15, fontWeight: '600', color: c.text },
    text: { fontSize: 13, color: c.ink3, marginTop: 1 },
  }));
  return (
    <View style={styles.box}>
      {PERKS.map((p, i) => (
        <View key={p.title} style={[styles.row, i > 0 && styles.divider]}>
          <Ionicons name={p.icon} size={22} color={colors.primary} />
          <View style={{ flex: 1 }}>
            <Text style={styles.title}>{p.title}</Text>
            <Text style={styles.text}>{p.text}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}
