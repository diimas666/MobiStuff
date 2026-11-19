import { useState } from 'react';
import { ActivityIndicator, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { saveCheckoutProfile, loadCheckoutProfile } from '../../services/checkoutProfileStorage';
import { saveOrderAccessToken } from '../../services/orderAccessStorage';
import { normalizePhone } from '../../utils/checkoutValidation';

type Step = 'idle' | 'phone' | 'code';

/**
 * Відновлення історії замовлень на новому телефоні: номер → код з SMS → замовлення.
 * Без підтвердження сервер не показує замовлення за номером.
 */
export function RestoreOrdersCard({ onRestored }: { onRestored: () => Promise<void> | void }) {
  const { styles, colors } = useThemedStyles(c => ({
    card: {
      marginBottom: 16,
      padding: 16,
      borderRadius: radius.lg,
      backgroundColor: c.homeSearch,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
      gap: 10,
    },
    row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
    title: { flex: 1, fontSize: 15, fontWeight: '600', color: c.textOnDark },
    text: { fontSize: 13, lineHeight: 19, color: c.textOnDarkMuted },
    input: {
      height: 48,
      paddingHorizontal: 14,
      borderRadius: radius.md,
      backgroundColor: c.homeSurface,
      color: c.textOnDark,
      fontSize: 17,
      letterSpacing: 0.5,
    },
    button: {
      height: 46,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
    },
    buttonText: { fontSize: 15, fontWeight: '700', color: '#fff' },
    link: { fontSize: 13, fontWeight: '600', color: c.primary },
    error: { fontSize: 13, color: '#F87171' },
    pressed: { opacity: 0.85 },
  }));

  const [step, setStep] = useState<Step>('idle');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const start = async () => {
    const profile = await loadCheckoutProfile();
    setPhone(profile?.phone ?? '');
    setError('');
    setStep('phone');
  };

  const requestCode = async () => {
    const normalized = normalizePhone(phone);
    if (normalized.replace(/\D/g, '').length < 10) {
      setError('Введіть номер, на який оформлювали замовлення');
      return;
    }
    setBusy(true);
    setError('');
    try {
      const res = await api.requestOrdersOtp({ phone: normalized });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Не вдалося надіслати код');
      setCode('');
      setStep('code');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку з сервером');
    } finally {
      setBusy(false);
    }
  };

  const verify = async () => {
    setBusy(true);
    setError('');
    const normalized = normalizePhone(phone);
    try {
      const res = await api.verifyOrdersOtp({ phone: normalized, code });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ordersToken) throw new Error(data.error || 'Невірний код');
      await saveOrderAccessToken(normalized, data.ordersToken);
      // запамʼятовуємо номер, щоб історія підтягувалась автоматично
      const profile = await loadCheckoutProfile();
      if (profile) await saveCheckoutProfile({ ...profile, phone: normalized });
      else
        await saveCheckoutProfile({
          name: '', phone: normalized, email: '', city: '', cityRef: '', warehouse: '', warehouseRef: '', paymentMethod: 'cod',
        });
      setStep('idle');
      await onRestored();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Немає звʼязку з сервером');
    } finally {
      setBusy(false);
    }
  };

  if (step === 'idle') {
    return (
      <Pressable accessibilityRole="button" onPress={start} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
        <View style={styles.row}>
          <Ionicons name="phone-portrait-outline" size={20} color={colors.primary} />
          <Text style={styles.title}>Не бачите своїх замовлень?</Text>
          <Ionicons name="chevron-forward" size={18} color={colors.textOnDarkMuted} />
        </View>
        <Text style={styles.text}>Підтвердьте номер телефону кодом з SMS — і ми покажемо всі ваші замовлення.</Text>
      </Pressable>
    );
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{step === 'phone' ? 'Ваш номер телефону' : `Код з SMS на ${phone}`}</Text>
      {step === 'phone' ? (
        <TextInput
          value={phone}
          onChangeText={setPhone}
          placeholder="099 123 45 67"
          placeholderTextColor={colors.textOnDarkMuted}
          keyboardType="phone-pad"
          autoComplete="tel"
          textContentType="telephoneNumber"
          style={styles.input}
          editable={!busy}
        />
      ) : (
        <TextInput
          value={code}
          onChangeText={t => setCode(t.replace(/\D/g, '').slice(0, 6))}
          placeholder="6 цифр"
          placeholderTextColor={colors.textOnDarkMuted}
          keyboardType="number-pad"
          autoComplete="sms-otp"
          textContentType="oneTimeCode"
          style={styles.input}
          editable={!busy}
          autoFocus
        />
      )}
      {error ? <Text style={styles.error}>{error}</Text> : null}
      <Pressable
        accessibilityRole="button"
        disabled={busy || (step === 'code' && code.length !== 6)}
        onPress={step === 'phone' ? requestCode : verify}
        style={({ pressed }) => [styles.button, (pressed || busy) && styles.pressed]}
      >
        {busy ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>{step === 'phone' ? 'Отримати код' : 'Показати замовлення'}</Text>}
      </Pressable>
      <View style={styles.row}>
        {step === 'code' ? (
          <Text onPress={requestCode} style={styles.link}>Надіслати ще раз</Text>
        ) : null}
        <Text onPress={() => setStep('idle')} style={[styles.link, { marginLeft: 'auto' }]}>Скасувати</Text>
      </View>
      {step === 'code' ? (
        <Text style={styles.text}>Якщо SMS не прийшло — перевірте номер: код надсилаємо лише на номери, з яких були замовлення.</Text>
      ) : null}
    </View>
  );
}
