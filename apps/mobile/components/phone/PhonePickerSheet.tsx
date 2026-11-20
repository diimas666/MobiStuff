import { useEffect, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, Modal, Platform, Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { api } from '../../config/api';
import { useMyPhone } from '../../context/MyPhoneContext';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Model = { model: string; count: number };
let cache: Model[] | null = null;

/** Вибір моделі телефону (пошук + популярні) */
export function PhonePickerSheet() {
  const { phone, setPhone, pickerOpen, closePicker } = useMyPhone();
  const [models, setModels] = useState<Model[]>(cache ?? []);
  const [q, setQ] = useState('');
  const { styles, colors } = useThemedStyles(c => ({
    backdrop: { flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'flex-end' },
    sheet: { height: '80%', backgroundColor: c.screen, borderTopLeftRadius: 28, borderTopRightRadius: 28, paddingTop: 18 },
    head: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingHorizontal: 20 },
    title: { fontSize: 24, fontWeight: '700', letterSpacing: -0.4, color: c.text },
    sub: { marginTop: 2, fontSize: 14, color: c.ink3 },
    search: { margin: 16, height: 44, borderRadius: 12, backgroundColor: c.card, paddingHorizontal: 12, flexDirection: 'row', alignItems: 'center', gap: 8 },
    input: { flex: 1, fontSize: 16, color: c.text },
    row: { marginHorizontal: 16, paddingHorizontal: 14, height: 50, backgroundColor: c.card, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    rowText: { fontSize: 16, color: c.text },
    count: { fontSize: 13, color: c.ink3 },
    reset: { margin: 16, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
    resetText: { fontSize: 16, color: c.sale, fontWeight: '500' },
  }));

  useEffect(() => {
    if (!pickerOpen || cache) return;
    api
      .phoneModels()
      .then(r => (r.ok ? r.json() : { models: [] }))
      .then(d => {
        cache = d.models ?? [];
        setModels(cache ?? []);
      })
      .catch(() => {});
  }, [pickerOpen]);

  const shown = useMemo(() => {
    const s = q.trim().toLowerCase();
    return s ? models.filter(m => m.model.toLowerCase().includes(s)).slice(0, 80) : models.slice(0, 40);
  }, [models, q]);

  const choose = (m: string | null) => {
    setPhone(m);
    setQ('');
    closePicker();
  };

  return (
    <Modal visible={pickerOpen} transparent animationType="slide" onRequestClose={closePicker}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <Pressable style={styles.backdrop} onPress={closePicker}>
          <Pressable style={styles.sheet} onPress={() => {}}>
            <View style={styles.head}>
              <View style={{ flex: 1 }}>
                <Text style={styles.title}>Мій телефон</Text>
                <Text style={styles.sub}>Підкажемо, які чохли й стекла підходять саме вам</Text>
              </View>
              <Pressable accessibilityRole="button" accessibilityLabel="Закрити" onPress={closePicker} hitSlop={10}>
                <Ionicons name="close-circle" size={28} color={colors.ink3} />
              </Pressable>
            </View>
            <View style={styles.search}>
              <Ionicons name="search" size={18} color={colors.ink3} />
              <TextInput value={q} onChangeText={setQ} placeholder="iPhone 15 Pro, Galaxy S24…" placeholderTextColor={colors.ink3} style={styles.input} autoCorrect={false} />
            </View>
            <FlatList
              data={shown}
              keyExtractor={m => m.model}
              keyboardShouldPersistTaps="handled"
              ItemSeparatorComponent={() => <View style={{ height: 0.5, marginHorizontal: 30, backgroundColor: colors.line }} />}
              renderItem={({ item, index }) => (
                <Pressable
                  accessibilityRole="button"
                  onPress={() => choose(item.model)}
                  style={({ pressed }) => [
                    styles.row,
                    index === 0 && { borderTopLeftRadius: 16, borderTopRightRadius: 16 },
                    index === shown.length - 1 && { borderBottomLeftRadius: 16, borderBottomRightRadius: 16 },
                    pressed && { backgroundColor: colors.fill },
                  ]}>
                  <Text style={[styles.rowText, phone === item.model && { fontWeight: '700' }]}>{item.model}</Text>
                  {phone === item.model ? <Ionicons name="checkmark" size={20} color={colors.primary} /> : <Text style={styles.count}>{item.count} тов.</Text>}
                </Pressable>
              )}
              ListEmptyComponent={<Text style={[styles.sub, { textAlign: 'center', marginTop: 20 }]}>{models.length ? 'Такої моделі не знайдено' : 'Завантажуємо моделі…'}</Text>}
              ListFooterComponent={
                phone ? (
                  <Pressable accessibilityRole="button" onPress={() => choose(null)} style={styles.reset}>
                    <Text style={styles.resetText}>Скинути модель</Text>
                  </Pressable>
                ) : <View style={{ height: 24 }} />
              }
            />
          </Pressable>
        </Pressable>
      </KeyboardAvoidingView>
    </Modal>
  );
}
