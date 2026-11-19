import { memo } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import type { CartItem } from '../../types/cart';
import { formatPrice } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const IMAGE_SIZE = 88;

type Props = {
  item: CartItem;
  onIncrement: () => void;
  onDecrement: () => void;
  onRemove: () => void;
};

/** Товар у кошику: фото, назва, ціна за шт., лічильник і «Видалити» */
export const CartListItem = memo(function CartListItem({ item, onIncrement, onDecrement, onRemove }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    card: { flexDirection: 'row', gap: 14, backgroundColor: c.card, borderRadius: 22, padding: 12, marginBottom: 10 },
    image: { width: IMAGE_SIZE, height: IMAGE_SIZE, borderRadius: 16, backgroundColor: '#FFFFFF', overflow: 'hidden', alignItems: 'center', justifyContent: 'center' },
    content: { flex: 1, minWidth: 0 },
    title: { fontSize: 15, lineHeight: 20, fontWeight: '600', color: c.text },
    meta: { marginTop: 2, fontSize: 13, color: c.ink3 },
    bottom: { marginTop: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    stepper: { flexDirection: 'row', alignItems: 'center', backgroundColor: c.fill, borderRadius: 18, height: 34 },
    stepBtn: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
    qty: { minWidth: 22, textAlign: 'center', fontSize: 15, fontWeight: '600', color: c.text },
    total: { fontSize: 17, fontWeight: '700', letterSpacing: -0.3, color: c.text },
    remove: { marginTop: 6, alignSelf: 'flex-start' },
    removeText: { fontSize: 14, color: c.primary, fontWeight: '500' },
  }));
  const hasOld = item.oldPrice && item.oldPrice > item.price;

  return (
    <View style={styles.card}>
      <View style={styles.image}>
        <ProductImage uri={item.image} label={item.title} size={IMAGE_SIZE - 8} resizeMode="contain" backgroundColor="#FFFFFF" />
      </View>
      <View style={styles.content}>
        <Text style={styles.title} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.meta}>
          {item.variant ? `${item.variant} · ` : ''}
          {formatPrice(item.price)} за шт.{hasOld ? ` (було ${formatPrice(item.oldPrice!)})` : ''}
        </Text>
        <Pressable accessibilityRole="button" onPress={onRemove} hitSlop={8} style={styles.remove}>
          <Text style={styles.removeText}>Видалити</Text>
        </Pressable>
        <View style={styles.bottom}>
          <View style={styles.stepper}>
            <Pressable accessibilityRole="button" accessibilityLabel="Зменшити кількість" onPress={onDecrement} style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.5 }]}>
              <Ionicons name="remove" size={18} color={colors.text} />
            </Pressable>
            <Text style={styles.qty}>{item.quantity}</Text>
            <Pressable accessibilityRole="button" accessibilityLabel="Збільшити кількість" onPress={onIncrement} style={({ pressed }) => [styles.stepBtn, pressed && { opacity: 0.5 }]}>
              <Ionicons name="add" size={18} color={colors.text} />
            </Pressable>
          </View>
          <Text style={styles.total}>{formatPrice(item.price * item.quantity)}</Text>
        </View>
      </View>
    </View>
  );
});
