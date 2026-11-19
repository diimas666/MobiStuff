import type { ComponentProps, ReactNode } from 'react';
import { Children, Fragment } from 'react';
import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Група рядків як у Налаштуваннях iOS: білий блок, тонкі роздільники */
export function ListGroup({ title, children, footer }: { title?: string; children: ReactNode; footer?: string }) {
  const { styles } = useThemedStyles(c => ({
    wrap: { marginBottom: 24 },
    title: { marginLeft: 16, marginBottom: 7, fontSize: 13, color: c.ink3 },
    group: { backgroundColor: c.card, borderRadius: 20, overflow: 'hidden' },
    divider: { marginLeft: 58, height: 0.5, backgroundColor: c.line },
    footer: { marginTop: 7, marginHorizontal: 16, fontSize: 13, lineHeight: 18, color: c.ink3 },
  }));
  const items = Children.toArray(children).filter(Boolean);
  return (
    <View style={styles.wrap}>
      {title ? <Text style={styles.title}>{title}</Text> : null}
      <View style={styles.group}>
        {items.map((child, i) => (
          <Fragment key={i}>
            {i > 0 ? <View style={styles.divider} /> : null}
            {child}
          </Fragment>
        ))}
      </View>
      {footer ? <Text style={styles.footer}>{footer}</Text> : null}
    </View>
  );
}

type RowProps = {
  icon: IconName;
  iconColor?: string;
  label: string;
  value?: string;
  badge?: number;
  onPress?: () => void;
  testID?: string;
};

export function ListRow({ icon, iconColor, label, value, badge, onPress, testID }: RowProps) {
  const { styles, colors } = useThemedStyles(c => ({
    row: { minHeight: 52, flexDirection: 'row', alignItems: 'center', paddingHorizontal: 14, gap: 14 },
    icon: { width: 30, height: 30, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
    label: { flex: 1, fontSize: 17, color: c.text },
    value: { fontSize: 16, color: c.ink3 },
    badge: { minWidth: 22, height: 22, paddingHorizontal: 6, borderRadius: 11, backgroundColor: c.sale, alignItems: 'center', justifyContent: 'center' },
    badgeText: { fontSize: 12, fontWeight: '700', color: '#FFFFFF' },
  }));
  return (
    <Pressable testID={testID} accessibilityRole="button" onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.fill }]}>
      <View style={[styles.icon, { backgroundColor: iconColor ?? colors.primary }]}>
        <Ionicons name={icon} size={18} color="#FFFFFF" />
      </View>
      <Text style={styles.label}>{label}</Text>
      {value ? <Text style={styles.value}>{value}</Text> : null}
      {badge ? (
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{badge > 99 ? '99+' : badge}</Text>
        </View>
      ) : null}
      <Ionicons name="chevron-forward" size={18} color={colors.line} />
    </Pressable>
  );
}
