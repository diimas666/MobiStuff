import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { formatPrice } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type AppliedPromo = { code: string; discount: number; label: string };

/** Промокод в оформленні: перевірка на сервері, знижку показуємо одразу */
export function PromoCodeInput({ total, value, onChange }: { total: number; value: AppliedPromo | null; onChange: (p: AppliedPromo | null) => void }) {
  const { styles, colors } = useThemedStyles(c => ({
    link: { fontSize: 15, fontWeight: '500', color: c.primary },
    row: { flexDirection: 'row', gap: 8 },
    input: { flex: 1, height: 44, borderRadius: 12, backgroundColor: c.fill, paddingHorizontal: 12, fontSize: 16, fontWeight: '600', letterSpacing: 1, color: c.text },
    btn: { height: 44, paddingHorizontal: 14, borderRadius: 12, backgroundColor: c.text, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontSize: 15, fontWeight: '600', color: c.screen },
    error: { marginTop: 6, fontSize: 13, color: c.sale },
    applied: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: c.accentSoft, borderRadius: 12, paddingHorizontal: 12, paddingVertical: 10 },
    appliedText: { fontSize: 14, color: c.text },
  }));
  const [open, setOpen] = useState(false);
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const apply = async () => {
    if (!code.trim()) return;
    setLoading(true);
    setError('');
    try {
      const res = await api.validatePromo({ code, total });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.error || 'Промокод не підійшов');
      onChange(d);
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку');
    } finally {
      setLoading(false);
    }
  };

  if (value) {
    return (
      <View style={styles.applied}>
        <Text style={styles.appliedText}>
          {value.code} · {value.label} (−{formatPrice(value.discount)})
        </Text>
        <Pressable accessibilityRole="button" accessibilityLabel="Прибрати промокод" onPress={() => onChange(null)} hitSlop={8}>
          <Ionicons name="close-circle" size={20} color={colors.ink3} />
        </Pressable>
      </View>
    );
  }

  if (!open) {
    return (
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} hitSlop={6}>
        <Text style={styles.link}>Є промокод?</Text>
      </Pressable>
    );
  }

  return (
    <View>
      <View style={styles.row}>
        <TextInput
          value={code}
          onChangeText={t => setCode(t.toUpperCase())}
          placeholder="Промокод"
          placeholderTextColor={colors.ink3}
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
          onSubmitEditing={apply}
          style={styles.input}
        />
        <Pressable accessibilityRole="button" onPress={apply} disabled={loading} style={({ pressed }) => [styles.btn, pressed && { opacity: 0.8 }]}>
          {loading ? <ActivityIndicator color={colors.screen} /> : <Text style={styles.btnText}>Застосувати</Text>}
        </Pressable>
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}
