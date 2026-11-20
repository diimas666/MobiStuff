import { useEffect, useState } from 'react';
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { loadCheckoutProfile } from '../../services/checkoutProfileStorage';
import { saveOrderToken } from '../../services/orderAccessStorage';
import { askPushPermissionOnce, syncPushToken } from '../../services/push';
import { formatPrice } from '../../types/catalog';
import { normalizePhone } from '../../utils/checkoutValidation';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  productId: string;
  title: string;
  price: number;
  variant?: string | null;
};

/** «Купити в 1 клік»: лише телефон — менеджер передзвонить */
export function QuickOrderSheet({ productId, title, price, variant }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    link: { alignSelf: 'center', paddingVertical: 4, marginBottom: 20 },
    linkText: { fontSize: 15, fontWeight: '500', color: c.primary },
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { backgroundColor: c.card, borderTopLeftRadius: 28, borderTopRightRadius: 28, padding: 20, paddingBottom: 34 },
    head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 },
    title: { fontSize: 22, fontWeight: '700', letterSpacing: -0.4, color: c.text },
    text: { fontSize: 15, lineHeight: 21, color: c.textOnDarkMuted },
    input: { marginTop: 16, height: 52, borderRadius: 14, backgroundColor: c.fill, paddingHorizontal: 14, fontSize: 18, color: c.text },
    btn: { marginTop: 14, height: 52, borderRadius: 26, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    btnText: { fontSize: 17, fontWeight: '600', color: c.onPrimary },
    error: { marginTop: 10, fontSize: 14, color: c.sale },
  }));
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState('');
  const [state, setState] = useState<'idle' | 'sending' | 'done'>('idle');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!open) return;
    setState('idle');
    setError('');
    void loadCheckoutProfile().then(p => p?.phone && setPhone(p.phone));
  }, [open]);

  const submit = async () => {
    setState('sending');
    setError('');
    try {
      const normalized = normalizePhone(phone);
      const res = await api.quickOrder({ productId, phone: normalized, variant });
      const d = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(d.message || 'Не вдалося надіслати');
      if (typeof d.orderToken === 'string' && d.orderId) await saveOrderToken({ orderId: d.orderId, phone: normalized, token: d.orderToken }).catch(() => {});
      void askPushPermissionOnce().then(() => syncPushToken());
      setState('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку з сервером');
      setState('idle');
    }
  };

  return (
    <>
      <Pressable accessibilityRole="button" onPress={() => setOpen(true)} style={styles.link} hitSlop={8}>
        <Text style={styles.linkText}>Купити в 1 клік — без оформлення</Text>
      </Pressable>
      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
          <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
            <Pressable style={styles.sheet} onPress={() => {}}>
              <View style={styles.head}>
                <Text style={styles.title}>{state === 'done' ? 'Дякуємо!' : 'Купити в 1 клік'}</Text>
                <Pressable accessibilityRole="button" accessibilityLabel="Закрити" onPress={() => setOpen(false)} hitSlop={10}>
                  <Ionicons name="close-circle" size={28} color={colors.ink3} />
                </Pressable>
              </View>
              {state === 'done' ? (
                <>
                  <Text style={styles.text}>Замовлення прийнято. Зателефонуємо протягом 15 хвилин у робочий час.</Text>
                  <Pressable accessibilityRole="button" onPress={() => setOpen(false)} style={styles.btn}>
                    <Text style={styles.btnText}>Добре</Text>
                  </Pressable>
                </>
              ) : (
                <>
                  <Text style={styles.text}>
                    {title}
                    {variant ? ` · ${variant}` : ''} — {formatPrice(price)}. Залиште телефон, менеджер передзвонить і оформить доставку.
                  </Text>
                  <TextInput
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="099 123 45 67"
                    placeholderTextColor={colors.ink3}
                    keyboardType="phone-pad"
                    textContentType="telephoneNumber"
                    autoComplete="tel"
                    autoFocus
                    style={styles.input}
                  />
                  {error ? <Text style={styles.error}>{error}</Text> : null}
                  <Pressable accessibilityRole="button" disabled={state === 'sending' || phone.replace(/\D/g, '').length < 9} onPress={submit} style={({ pressed }) => [styles.btn, (pressed || phone.replace(/\D/g, '').length < 9) && { opacity: 0.6 }]}>
                    {state === 'sending' ? <ActivityIndicator color={colors.onPrimary} /> : <Text style={styles.btnText}>Замовити</Text>}
                  </Pressable>
                </>
              )}
            </Pressable>
          </Pressable>
        </KeyboardAvoidingView>
      </Modal>
    </>
  );
}
