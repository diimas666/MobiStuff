import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import {
  getOrderStatusLabel,
  getOrderStatusLightBadge,
  normalizeOrderStatus,
  ORDER_STATUS_LABELS,
} from '../../types/order';
import { getNotificationIcon, type NotificationItem } from '../../types/notification';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  item: NotificationItem;
  onPress: () => void;
};

type IconName = ComponentProps<typeof Ionicons>['name'];

function formatNotificationTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('uk-UA', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function parseStatusLabelFromBody(body: string): string | null {
  const match = body.match(/«([^»]+)»/);
  return match?.[1] ?? null;
}

function resolveOrderStatus(item: NotificationItem) {
  if (item.orderStatus) {
    return normalizeOrderStatus(item.orderStatus);
  }

  const label = parseStatusLabelFromBody(item.body);
  const entry = Object.entries(ORDER_STATUS_LABELS).find(([, value]) => value === label);

  return entry ? normalizeOrderStatus(entry[0]) : 'processing';
}

function NotificationBody({
  item,
  styles,
}: {
  item: NotificationItem;
  styles: ReturnType<typeof useThemedStyles>['styles'];
}) {
  if (item.type !== 'order_status') {
    return (
      <Text style={styles.body} numberOfLines={3}>
        {item.body}
      </Text>
    );
  }

  const status = resolveOrderStatus(item);
  const statusLabel = getOrderStatusLabel(status);
  const badge = getOrderStatusLightBadge(status);

  return (
    <View style={styles.bodyRow}>
      <Text style={styles.body}>Статус змінено на</Text>
      <View style={[styles.statusBadge, { backgroundColor: badge.bg }]}>
        <Ionicons name={badge.icon as IconName} size={13} color={badge.text} />
        <Text style={[styles.statusBadgeText, { color: badge.text }]}>{statusLabel}</Text>
      </View>
    </View>
  );
}

export function NotificationListItem({ item, onPress }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    backgroundColor: c.card,
    borderRadius: radius.lg,
    padding: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardUnread: {
    borderWidth: 1,
    borderColor: '#BBF7D0',
    backgroundColor: '#FAFFFB',
  },
  pressed: {
    opacity: 0.88,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconWrapUnread: {
    backgroundColor: '#F0FDF4',
  },
  content: {
    flex: 1,
    gap: 6,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
  },
  titleUnread: {
    fontWeight: '700',
  },
  time: {
    fontSize: 12,
    color: c.textMuted,
  },
  bodyRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'center',
    gap: 6,
  },
  body: {
    fontSize: 14,
    color: c.textMuted,
    lineHeight: 20,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: radius.pill,
  },
  statusBadgeText: {
    fontSize: 13,
    fontWeight: '700',
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: c.primary,
    marginTop: 6,
  },
}));

  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        !item.read && styles.cardUnread,
        pressed && styles.pressed,
      ]}>
      <View style={[styles.iconWrap, !item.read && styles.iconWrapUnread]}>
        <Ionicons
          name={getNotificationIcon(item.type)}
          size={20}
          color={item.read ? colors.textMuted : colors.primary}
        />
      </View>

      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, !item.read && styles.titleUnread]} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.time}>{formatNotificationTime(item.createdAt)}</Text>
        </View>
        <NotificationBody item={item} styles={styles} />
      </View>

      {!item.read ? <View style={styles.unreadDot} /> : null}
    </Pressable>
  );
}

