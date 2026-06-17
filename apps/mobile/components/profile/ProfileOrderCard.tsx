import { StyleSheet, Text, View } from 'react-native';
import type { ComponentProps } from 'react';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ProductImage } from '../ProductImage';
import { radius } from '../../constants/theme';
import {
  formatOrderDate,
  formatOrderPaymentMethod,
  getOrderStatusLabel,
  getOrderStatusStyle,
  type StoredOrder,
} from '../../types/order';
import { formatPrice } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import type { AppColorPalette } from '../../constants/themePalettes';

type CardStyles = ReturnType<typeof useThemedStyles>['styles'];

function OrderMetaRow({
  icon,
  label,
  value,
  styles,
  colors,
}: {
  icon: IconName;
  label: string;
  value: string;
  styles: CardStyles;
  colors: AppColorPalette;
}) {
  return (
    <View style={styles.metaRow}>
      <View style={styles.metaIconWrap}>
        <Ionicons name={icon} size={16} color={colors.primary} />
      </View>
      <View style={styles.metaContent}>
        <Text style={styles.metaLabel}>{label}</Text>
        <Text style={styles.metaValue} numberOfLines={2}>
          {value}
        </Text>
      </View>
    </View>
  );
}

type Props = {
  order: StoredOrder;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

export function ProfileOrderCard({ order }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  card: {
    backgroundColor: c.homeSearch,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  topSection: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    gap: 10,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 12,
  },
  headerLeft: {
    flex: 1,
    gap: 2,
  },
  orderLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: c.textOnDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
  },
  orderId: {
    fontSize: 17,
    fontWeight: '700',
    color: c.textOnDark,
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
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  date: {
    fontSize: 13,
    color: c.textOnDarkMuted,
    flex: 1,
  },
  divider: {
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  productsSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 10,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: c.textOnDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  imagesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  imageWrap: {
    position: 'relative',
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: c.card,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.12)',
  },
  qtyBadge: {
    position: 'absolute',
    right: 4,
    bottom: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.72)',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: c.textOnDark,
  },
  moreBadge: {
    width: 64,
    height: 64,
    borderRadius: radius.sm,
    backgroundColor: c.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  moreText: {
    fontSize: 15,
    fontWeight: '700',
    color: c.textOnDark,
  },
  itemsCount: {
    fontSize: 13,
    color: c.textOnDarkMuted,
  },
  totalRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'rgba(45, 184, 75, 0.1)',
    gap: 12,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: c.textOnDarkMuted,
  },
  totalValue: {
    fontSize: 20,
    fontWeight: '700',
    color: c.priceLight,
  },
  detailsSection: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 12,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  metaIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: c.homeSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  metaContent: {
    flex: 1,
    gap: 2,
    paddingTop: 1,
  },
  metaLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: c.textOnDarkMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  metaValue: {
    fontSize: 14,
    color: c.textOnDark,
    lineHeight: 20,
  },
}));

  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const previewItems = order.items.slice(0, 3);
  const customerName = [order.name, order.lastName].filter(Boolean).join(' ');
  const statusStyle = getOrderStatusStyle(order.status);
  const statusLabel = getOrderStatusLabel(order.status);
  const itemsLabel =
    itemCount === 1 ? 'товар' : itemCount < 5 ? 'товари' : 'товарів';

  return (
    <View style={styles.card}>
      <View style={styles.topSection}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.orderLabel}>Замовлення</Text>
            <Text style={styles.orderId}>№ {order.id}</Text>
          </View>
          <View
            style={[styles.statusBadge, { backgroundColor: statusStyle.badgeBg }]}>
            <Ionicons
              name={statusStyle.icon as IconName}
              size={14}
              color={statusStyle.textColor}
            />
            <Text style={[styles.statusText, { color: statusStyle.textColor }]}>
              {statusLabel}
            </Text>
          </View>
        </View>

        <View style={styles.dateRow}>
          <Ionicons name="calendar-outline" size={15} color={colors.textOnDarkMuted} />
          <Text style={styles.date}>{formatOrderDate(order.createdAt)}</Text>
        </View>
      </View>

      <View style={styles.divider} />

      <View style={styles.productsSection}>
        <Text style={styles.sectionTitle}>Товари</Text>
        <View style={styles.imagesRow}>
          {previewItems.map(item => (
            <View
              key={`${item.productId}-${item.variant ?? 'default'}`}
              style={styles.imageWrap}>
              <ProductImage
                uri={item.image}
                label={item.title}
                size={64}
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
        <Text style={styles.itemsCount}>
          {itemCount} {itemsLabel}
        </Text>
      </View>

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Сума замовлення</Text>
        <Text style={styles.totalValue}>{formatPrice(order.total)}</Text>
      </View>

      <View style={styles.divider} />

      <View style={styles.detailsSection}>
        <OrderMetaRow
          icon="location-outline"
          label="Доставка"
          value={`${order.city} · ${order.warehouse}`}
          styles={styles}
          colors={colors}
        />
        <OrderMetaRow
          icon="card-outline"
          label="Оплата"
          value={formatOrderPaymentMethod(order.paymentMethod)}
          styles={styles}
          colors={colors}
        />
        {customerName ? (
          <OrderMetaRow
            icon="person-outline"
            label="Отримувач"
            value={`${customerName} · ${order.phone}`}
            styles={styles}
            colors={colors}
          />
        ) : null}
      </View>
    </View>
  );
}

