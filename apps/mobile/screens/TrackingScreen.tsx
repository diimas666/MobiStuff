import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, TextInput, View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { api } from '../config/api';
import { spacing } from '../constants/theme';
import type { ProfileStackParamList } from '../navigation/types';
import { useThemedStyles } from '../hooks/useThemedStyles';

type Props = NativeStackScreenProps<ProfileStackParamList, 'Tracking'>;
type Status = { number: string; status: string; statusCode: number; cityRecipient?: string; warehouseRecipient?: string; scheduledDeliveryDate?: string; actualDeliveryDate?: string };

const stage = (code: number) => (code === 9 || code === 10 || code === 11 ? 3 : code === 7 || code === 8 ? 2 : code >= 4 && code <= 6 ? 1 : 0);
const STEPS = [
  { icon: 'cube-outline', label: 'Створено' },
  { icon: 'car-outline', label: 'В дорозі' },
  { icon: 'location-outline', label: 'У відділенні' },
  { icon: 'checkmark-done-outline', label: 'Отримано' },
] as const;

/** Відстеження посилки Нової Пошти всередині застосунку */
export function TrackingScreen({ route, navigation }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    content: { paddingHorizontal: spacing.screen, paddingBottom: 40 },
    title: { marginTop: 14, fontSize: 34, fontWeight: '700', letterSpacing: -0.8, color: c.text },
    sub: { marginTop: 4, fontSize: 15, color: c.textOnDarkMuted },
    form: { marginTop: 20, flexDirection: 'row', gap: 8 },
    input: { flex: 1, height: 50, borderRadius: 14, backgroundColor: c.card, paddingHorizontal: 14, fontSize: 18, letterSpacing: 0.5, color: c.text },
    btn: { height: 50, paddingHorizontal: 18, borderRadius: 25, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontSize: 16, fontWeight: '600', color: c.onPrimary },
    error: { marginTop: 14, fontSize: 15, color: c.sale },
    card: { marginTop: 20, backgroundColor: c.card, borderRadius: 24, padding: 20 },
    ttn: { fontSize: 13, color: c.ink3 },
    status: { marginTop: 4, fontSize: 22, fontWeight: '700', letterSpacing: -0.3, color: c.text },
    steps: { marginTop: 20, flexDirection: 'row', justifyContent: 'space-between' },
    step: { alignItems: 'center', flex: 1 },
    dot: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
    stepText: { marginTop: 6, fontSize: 12, textAlign: 'center' },
    row: { marginTop: 14, flexDirection: 'row', justifyContent: 'space-between', gap: 12 },
    label: { fontSize: 14, color: c.ink3 },
    value: { flex: 1, textAlign: 'right', fontSize: 14, color: c.text },
  }));
  const [ttn, setTtn] = useState(route.params?.ttn ?? '');
  const [data, setData] = useState<Status | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const track = useCallback(async (value: string) => {
    setLoading(true);
    setError('');
    setData(null);
    try {
      const r = await api.tracking(value.replace(/\D/g, ''));
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Не вдалося перевірити');
      setData(d);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (route.params?.ttn) void track(route.params.ttn);
  }, [route.params?.ttn, track]);

  const current = data ? stage(data.statusCode) : -1;

  return (
    <Screen variant="home" testID="screen-tracking">
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.title}>Де моя посилка?</Text>
        <Text style={styles.sub}>Статус від Нової Пошти за номером ТТН</Text>
        <View style={styles.form}>
          <TextInput value={ttn} onChangeText={setTtn} keyboardType="number-pad" placeholder="20450012345678" placeholderTextColor={colors.ink3} style={styles.input} />
          <Pressable accessibilityRole="button" onPress={() => track(ttn)} disabled={loading || ttn.replace(/\D/g, '').length < 10} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
            {loading ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>Знайти</Text>}
          </Pressable>
        </View>
        {error ? <Text style={styles.error}>{error}</Text> : null}
        {data ? (
          <View style={styles.card}>
            <Text style={styles.ttn}>ТТН {data.number}</Text>
            <Text style={styles.status}>{data.status}</Text>
            <View style={styles.steps}>
              {STEPS.map((s, i) => {
                const done = i <= current;
                return (
                  <View key={s.label} style={styles.step}>
                    <View style={[styles.dot, { backgroundColor: done ? colors.primary : colors.fill }]}>
                      <Ionicons name={s.icon} size={20} color={done ? colors.onPrimary : colors.ink3} />
                    </View>
                    <Text style={[styles.stepText, { color: done ? colors.text : colors.ink3, fontWeight: done ? '600' : '400' }]}>{s.label}</Text>
                  </View>
                );
              })}
            </View>
            {data.cityRecipient ? (
              <View style={styles.row}>
                <Text style={styles.label}>Куди</Text>
                <Text style={styles.value}>{data.cityRecipient}{data.warehouseRecipient ? `, ${data.warehouseRecipient}` : ''}</Text>
              </View>
            ) : null}
            {data.actualDeliveryDate || data.scheduledDeliveryDate ? (
              <View style={styles.row}>
                <Text style={styles.label}>{data.actualDeliveryDate ? 'Доставлено' : 'Очікувана доставка'}</Text>
                <Text style={styles.value}>{data.actualDeliveryDate || data.scheduledDeliveryDate}</Text>
              </View>
            ) : null}
          </View>
        ) : null}
      </ScrollView>
    </Screen>
  );
}
