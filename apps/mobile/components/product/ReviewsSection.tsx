import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { loadCheckoutProfile } from '../../services/checkoutProfileStorage';

type Review = { id: string; name: string; rating: number; text: string; verified: boolean; reply?: string; createdAt: string };
type Summary = { count: number; average: number; reviews: Review[] };

function Stars({ value, size = 14, color = '#FF9F0A', empty = '#D2D2D7' }: { value: number; size?: number; color?: string; empty?: string }) {
  return (
    <View style={{ flexDirection: 'row', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Ionicons key={i} name="star" size={size} color={i <= Math.round(value) ? color : empty} />
      ))}
    </View>
  );
}

const plural = (n: number) => (n % 10 === 1 && n % 100 !== 11 ? 'відгук' : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? 'відгуки' : 'відгуків');

/** Відгуки на екрані товару + «Написати відгук» (публікується після перевірки) */
export function ReviewsSection({ handle }: { handle: string }) {
  const { styles, colors } = useThemedStyles(c => ({
    wrap: { marginBottom: 28 },
    head: { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between' },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4, color: c.text },
    meta: { marginTop: 4, flexDirection: 'row', alignItems: 'center', gap: 6 },
    metaText: { fontSize: 14, color: c.ink3 },
    write: { height: 36, paddingHorizontal: 14, borderRadius: 18, backgroundColor: c.accentSoft, alignItems: 'center', justifyContent: 'center' },
    writeText: { fontSize: 14, fontWeight: '600', color: c.primary },
    card: { marginTop: 10, backgroundColor: c.card, borderRadius: 18, padding: 14 },
    row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    date: { fontSize: 12, color: c.ink3 },
    name: { marginTop: 6, fontSize: 15, fontWeight: '600', color: c.text },
    verified: { fontSize: 12, fontWeight: '400', color: c.primary },
    text: { marginTop: 4, fontSize: 15, lineHeight: 21, color: c.textOnDarkMuted },
    reply: { marginTop: 8, padding: 10, borderRadius: 12, backgroundColor: c.fill, fontSize: 14, color: c.textOnDarkMuted },
    more: { marginTop: 10, fontSize: 15, fontWeight: '600', color: c.primary },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.screen, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 36 },
    sheetTitle: { fontSize: 24, fontWeight: '700', color: c.text },
    input: { marginTop: 12, minHeight: 46, borderRadius: 12, backgroundColor: c.card, paddingHorizontal: 12, paddingVertical: 10, fontSize: 16, color: c.text },
    send: { marginTop: 16, height: 50, borderRadius: 25, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    sendText: { fontSize: 17, fontWeight: '600', color: c.onPrimary },
    error: { marginTop: 8, fontSize: 14, color: c.sale },
  }));
  const [data, setData] = useState<Summary | null>(null);
  const [all, setAll] = useState(false);
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const [name, setName] = useState('');
  const [text, setText] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    let alive = true;
    api
      .reviews(handle)
      .then(r => (r.ok ? r.json() : null))
      .then(d => alive && d && setData(d))
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [handle]);

  const openForm = () => {
    setOpen(true);
    void loadCheckoutProfile().then(p => p?.name && !name && setName(p.name));
  };

  const submit = async () => {
    setState('sending');
    setError('');
    try {
      const r = await api.addReview({ handle, rating, name, text, source: 'app' });
      const d = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(d.error || 'Не вдалося надіслати');
      setState('done');
      setOpen(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку');
      setState('idle');
    }
  };

  const list = data ? (all ? data.reviews : data.reviews.slice(0, 3)) : [];

  return (
    <View style={styles.wrap}>
      <View style={styles.head}>
        <View>
          <Text style={styles.title}>Відгуки</Text>
          <View style={styles.meta}>
            {data?.count ? (
              <>
                <Stars value={data.average} />
                <Text style={styles.metaText}>
                  {data.average.toFixed(1)} · {data.count} {plural(data.count)}
                </Text>
              </>
            ) : (
              <Text style={styles.metaText}>{state === 'done' ? 'Дякуємо! Відгук зʼявиться після перевірки' : 'Будьте першим'}</Text>
            )}
          </View>
        </View>
        {state !== 'done' ? (
          <Pressable accessibilityRole="button" onPress={openForm} style={styles.write}>
            <Text style={styles.writeText}>Написати</Text>
          </Pressable>
        ) : null}
      </View>

      {list.map(r => (
        <View key={r.id} style={styles.card}>
          <View style={styles.row}>
            <Stars value={r.rating} />
            <Text style={styles.date}>{new Date(r.createdAt).toLocaleDateString('uk-UA')}</Text>
          </View>
          <Text style={styles.name}>
            {r.name}
            {r.verified ? <Text style={styles.verified}>  ✓ Покупка підтверджена</Text> : null}
          </Text>
          {r.text ? <Text style={styles.text}>{r.text}</Text> : null}
          {r.reply ? <Text style={styles.reply}>MobiStuff: {r.reply}</Text> : null}
        </View>
      ))}
      {data && data.reviews.length > 3 && !all ? (
        <Pressable accessibilityRole="button" onPress={() => setAll(true)}>
          <Text style={styles.more}>Показати всі {data.count}</Text>
        </Pressable>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <Text style={styles.sheetTitle}>Ваш відгук</Text>
              <View style={{ flexDirection: 'row', gap: 6, marginTop: 14 }}>
                {[1, 2, 3, 4, 5].map(i => (
                  <Pressable key={i} accessibilityRole="button" accessibilityLabel={`${i} з 5`} onPress={() => setRating(i)} hitSlop={6}>
                    <Ionicons name="star" size={36} color={i <= rating ? '#FF9F0A' : colors.line} />
                  </Pressable>
                ))}
              </View>
              <TextInput value={name} onChangeText={setName} placeholder="Імʼя" placeholderTextColor={colors.ink3} maxLength={60} style={styles.input} />
              <TextInput value={text} onChangeText={setText} placeholder="Що сподобалось, чи підійшло до телефону…" placeholderTextColor={colors.ink3} maxLength={2000} multiline style={[styles.input, { minHeight: 100, textAlignVertical: 'top' }]} />
              {error ? <Text style={styles.error}>{error}</Text> : null}
              <Pressable accessibilityRole="button" disabled={!rating || state === 'sending'} onPress={submit} style={[styles.send, (!rating || state === 'sending') && { opacity: 0.6 }]}>
                {state === 'sending' ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.sendText}>Надіслати</Text>}
              </Pressable>
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </View>
  );
}
