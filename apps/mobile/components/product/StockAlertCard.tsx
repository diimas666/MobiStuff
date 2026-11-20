import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { loadCheckoutProfile } from '../../services/checkoutProfileStorage';
import { useThemedStyles } from '../../hooks/useThemedStyles';

/** «Повідомити, коли зʼявиться» для товару, якого немає */
export function StockAlertCard({ productId }: { productId: string }) {
  const { styles, colors } = useThemedStyles(c => ({
    box: { backgroundColor: c.card, borderRadius: 20, padding: 16, marginBottom: 20 },
    title: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    titleText: { fontSize: 16, fontWeight: '600', color: c.text },
    row: { flexDirection: 'row', gap: 8, marginTop: 12 },
    input: { flex: 1, height: 46, borderRadius: 12, backgroundColor: c.fill, paddingHorizontal: 12, fontSize: 16, color: c.text },
    btn: { height: 46, paddingHorizontal: 16, borderRadius: 23, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontSize: 15, fontWeight: '600', color: c.onPrimary },
    done: { flexDirection: 'row', alignItems: 'center', gap: 8, backgroundColor: c.accentSoft, borderRadius: 16, padding: 14, marginBottom: 20 },
    doneText: { flex: 1, fontSize: 15, color: c.text },
    error: { marginTop: 8, fontSize: 13, color: c.sale },
  }));
  const [contact, setContact] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    void loadCheckoutProfile().then(p => p?.phone && setContact(p.phone));
  }, []);

  const submit = async () => {
    setState('sending');
    setError('');
    try {
      const r = await api.stockAlert({ productId, contact });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.message || 'Не вдалося підписатися');
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку');
      setState('idle');
    }
  };

  if (state === 'done') {
    return (
      <View style={styles.done}>
        <Ionicons name="checkmark-circle" size={20} color={colors.primary} />
        <Text style={styles.doneText}>Повідомимо, щойно товар зʼявиться</Text>
      </View>
    );
  }
  return (
    <View style={styles.box}>
      <View style={styles.title}>
        <Ionicons name="notifications-outline" size={18} color={colors.primary} />
        <Text style={styles.titleText}>Повідомити, коли зʼявиться</Text>
      </View>
      <View style={styles.row}>
        <TextInput value={contact} onChangeText={setContact} placeholder="Телефон або email" placeholderTextColor={colors.ink3} autoCapitalize="none" style={styles.input} />
        <Pressable accessibilityRole="button" disabled={state === 'sending' || !contact.trim()} onPress={submit} style={({ pressed }) => [styles.btn, (pressed || !contact.trim()) && { opacity: 0.7 }]}>
          {state === 'sending' ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>Підписатися</Text>}
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
