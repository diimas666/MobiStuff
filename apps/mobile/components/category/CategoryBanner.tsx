import { Text, View } from 'react-native';
import { BackButton } from '../navigation/BackButton';
import type { HomeCategory } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  category: HomeCategory;
  subtitle?: string;
  onBack?: () => void;
};

/** Заголовок категорії: назад, велика назва, підзаголовок — як на сайті */
export function CategoryBanner({ category, subtitle, onBack }: Props) {
  const { styles } = useThemedStyles(c => ({
    // Сітка вже має відступ (spacing.screen − GRID_GAP/2) — додаємо лише половину проміжку
    wrapper: { paddingHorizontal: 6, marginBottom: 12 },
    title: { marginTop: onBack ? 14 : 4, fontSize: 32, lineHeight: 37, fontWeight: '700', letterSpacing: -0.8, color: c.text },
    subtitle: { marginTop: 4, fontSize: 15, color: c.ink3 },
  }));
  return (
    <View style={styles.wrapper}>
      {onBack ? <BackButton onPress={onBack} /> : null}
      <Text style={styles.title} accessibilityRole="header">
        {category.title}
      </Text>
      {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
    </View>
  );
}
