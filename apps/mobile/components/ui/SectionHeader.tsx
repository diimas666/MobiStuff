import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
};

/** Заголовок секції як на сайті: великий заголовок + «Усі ›» акцентним кольором */
export function SectionHeader({ title, subtitle, actionLabel = 'Усі', onAction }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    row: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 14, gap: 12 },
    textBlock: { flex: 1 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.5, color: c.text },
    subtitle: { marginTop: 2, fontSize: 15, color: c.textOnDarkMuted },
    action: { flexDirection: 'row', alignItems: 'center', paddingBottom: 3 },
    actionText: { fontSize: 16, color: c.primary, fontWeight: '500' },
  }));

  return (
    <View style={styles.row}>
      <View style={styles.textBlock}>
        <Text style={styles.title} accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      {onAction ? (
        <Pressable onPress={onAction} hitSlop={10} style={({ pressed }) => [styles.action, pressed && { opacity: 0.6 }]}>
          <Text style={styles.actionText}>{actionLabel}</Text>
          <Ionicons name="chevron-forward" size={17} color={colors.primary} />
        </Pressable>
      ) : null}
    </View>
  );
}
