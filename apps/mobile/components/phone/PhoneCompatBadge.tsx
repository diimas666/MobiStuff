import { Pressable, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useMyPhone } from '../../context/MyPhoneContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { compatibleWith, compatModels } from '../../utils/phoneCompat';

/** На товарі: чи підходить до телефону покупця */
export function PhoneCompatBadge({ title }: { title: string }) {
  const { phone, openPicker } = useMyPhone();
  const { styles, colors } = useThemedStyles(c => ({
    box: { flexDirection: 'row', alignItems: 'center', gap: 12, borderRadius: 16, paddingHorizontal: 14, paddingVertical: 12, marginBottom: 16 },
    text: { flex: 1, fontSize: 14, lineHeight: 19, color: c.text },
    link: { fontSize: 14, fontWeight: '600', color: c.primary },
  }));
  const models = compatModels(title);
  if (!models.length) return null;
  const ok = compatibleWith(title, phone);

  if (!phone) {
    return (
      <Pressable accessibilityRole="button" onPress={openPicker} style={[styles.box, { backgroundColor: colors.card }]}>
        <Ionicons name="phone-portrait-outline" size={20} color={colors.ink3} />
        <Text style={styles.text}>Для {models.slice(0, 2).join(', ')}{models.length > 2 ? ` і ще ${models.length - 2}` : ''}</Text>
        <Text style={styles.link}>Мій телефон</Text>
      </Pressable>
    );
  }
  return (
    <Pressable accessibilityRole="button" onPress={openPicker} style={[styles.box, { backgroundColor: ok ? colors.accentSoft : '#FEF3C7' }]}>
      <Ionicons name={ok ? 'checkmark-circle' : 'warning-outline'} size={20} color={ok ? colors.primary : '#B45309'} />
      <Text style={[styles.text, !ok && { color: '#78350F' }]}>
        {ok ? `Підходить до вашого ${phone}` : `Не для вашого ${phone} — для ${models.slice(0, 2).join(', ')}`}
      </Text>
    </Pressable>
  );
}
