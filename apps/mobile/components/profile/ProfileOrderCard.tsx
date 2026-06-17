import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { colors, radius } from '../../constants/theme';
import {
  formatOrderDate,
  formatOrderPaymentMethod,
  getOrderStatusLabel,
  getOrderStatusStyle,
  type StoredOrder,
} from '../../types/order';
import { formatPrice } from '../../types/catalog';

type Props = {
  order: StoredOrder;
};

export function ProfileOrderCard({ order }: Props) {
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const customerName = [order.name, order.lastName].filter(Boolean).join(' ');
  const statusStyle = getOrderStatusStyle(order.status);
  const statusLabel = getOrderStatusLabel(order.status);

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderId}>№ {order.id}</Text>
          <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>
        </View>
        <View
          style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBg }]}
        >
          <Ionicons
            name={statusStyle.icon}
            size={14}
            color={statusStyle.textColor}
          />
          <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
            {statusLabel}
          </Text>
        </View>
      </View>

      <View style={styles.imagesRow}>
        {previewItems.map(item => (
          <View key={`${item.productId}-${item.variant ?? 'default'}`} style={styles.imageWrap}>
            <ProductImage
              uri={item.image}
              label={item.title}
              size={56}
              rounded={radius.sm}
              resizeMode="cover"
            />
            {item.quantity > 1 ? (
              <View style={styles.qtyBadge}>
                <Text style={styles.qtyText}>×{item.quantity}</Text>
              </View>
            ) : null}
          </View>
        ))}
        {order.items.length > 3 ? (
          <View style={styles.moreBadge}>
            <Text style={styles.moreText}>+{order.items.length - 3}</Text>
          </View>
        ) : null}
      </View>

      <View style={styles.metaBlock}>
        <Text style={styles.metaLine} numberOfLines={1}>
          {itemCount} {itemCount === 1 ? 'товар' : itemCount < 5 ? 'товари' : 'товарів'} ·{' '}
          {formatPrice(order.total)}
        </Text>
        <Text style={styles.metaMuted} numberOfLines={1}>
          {order.city} · {order.warehouse}
        </Text>
        <Text style={styles.metaMuted} numberOfLines={1}>
          {formatOrderPaymentMethod(order.paymentMethod)}
        </Text>
        {customerName ? (
          <Text style={styles.metaMuted} numberOfLines={1}>
            {customerName} · {order.phone}
          </Text>
        ) : null}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.homeSearch,
    borderRadius: radius.lg,
    padding: 16,
    gap: 14,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 4,
  },
  orderId: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  date: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: radius.pill,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.card,
  },
  qtyBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  moreBadge: {
    width: 56,
    height: 56,
    borderRadius: radius.sm,
    backgroundColor: colors.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moreText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textOnDark,
  },
  metaBlock: {
    gap: 4,
  },
  metaLine: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.priceLight,
  },
  metaMuted: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
    lineHeight: 18,
  },
});
