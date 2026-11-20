import { useEffect, useState, type ReactNode } from 'react';
import { Linking, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAppConfig, refreshAppConfig } from '../hooks/useAppConfig';
import { APP_STORE_URL, APP_VERSION, compareVersions } from '../constants/appVersion';
import { getStorageItem, setStorageItem } from '../services/safeStorage';

const WHATS_NEW_KEY = 'whats_new_seen';

function FullScreen({ icon, title, text, button, onPress }: { icon: string; title: string; text: string; button?: string; onPress?: () => void }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, backgroundColor: '#F5F5F7' }}>
      <View style={{ width: 88, height: 88, borderRadius: 26, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' }}>
        <Ionicons name={icon} size={40} color="#138A47" />
      </View>
      <Text style={{ marginTop: 24, fontSize: 26, fontWeight: '700', color: '#1D1D1F', textAlign: 'center' }}>{title}</Text>
      <Text style={{ marginTop: 8, fontSize: 16, lineHeight: 23, color: '#6E6E73', textAlign: 'center' }}>{text}</Text>
      {button ? (
        <Pressable accessibilityRole="button" onPress={onPress} style={{ marginTop: 28, height: 52, paddingHorizontal: 28, borderRadius: 26, backgroundColor: '#138A47', alignItems: 'center', justifyContent: 'center' }}>
          <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>{button}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Техроботи, обовʼязкове оновлення і «Що нового» — керуються з адмінки */
export function AppGate({ children }: { children: ReactNode }) {
  const config = useAppConfig();
  const [showNews, setShowNews] = useState(false);

  useEffect(() => {
    const v = config.whatsNew.version;
    if (!v || v !== APP_VERSION || !config.whatsNew.items.length) return;
    void getStorageItem(WHATS_NEW_KEY).then(seen => {
      if (seen !== v) setShowNews(true);
    });
  }, [config.whatsNew]);

  const closeNews = () => {
    setShowNews(false);
    void setStorageItem(WHATS_NEW_KEY, config.whatsNew.version);
  };

  if (config.maintenance.enabled) {
    return <FullScreen icon="construct-outline" title="Технічні роботи" text={config.maintenance.message || 'Скоро повернемось. Поки що можна замовити на сайті mobistuff.shop'} button="Перевірити ще раз" onPress={() => void refreshAppConfig()} />;
  }
  if (config.minVersion && compareVersions(APP_VERSION, config.minVersion) < 0) {
    return <FullScreen icon="arrow-up-circle-outline" title="Оновіть застосунок" text="Вийшла нова версія MobiStuff. Оновіть, щоб і далі оформлювати замовлення." button="Оновити в App Store" onPress={() => void Linking.openURL(APP_STORE_URL)} />;
  }

  return (
    <>
      {children}
      <Modal visible={showNews} transparent animationType="fade" onRequestClose={closeNews}>
        <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.35)', justifyContent: 'center', padding: 24 }}>
          <View style={{ backgroundColor: '#FFFFFF', borderRadius: 28, padding: 24, maxHeight: '80%' }}>
            <Text style={{ fontSize: 26, fontWeight: '700', letterSpacing: -0.5, color: '#1D1D1F' }}>Що нового</Text>
            <Text style={{ marginTop: 2, fontSize: 15, color: '#6E6E73' }}>Версія {config.whatsNew.version}</Text>
            <ScrollView style={{ marginTop: 16 }}>
              {config.whatsNew.items.map(item => (
                <View key={item} style={{ flexDirection: 'row', gap: 10, marginBottom: 12 }}>
                  <Ionicons name="checkmark-circle" size={20} color="#138A47" />
                  <Text style={{ flex: 1, fontSize: 16, lineHeight: 22, color: '#1D1D1F' }}>{item}</Text>
                </View>
              ))}
            </ScrollView>
            <Pressable accessibilityRole="button" onPress={closeNews} style={{ marginTop: 12, height: 50, borderRadius: 25, backgroundColor: '#138A47', alignItems: 'center', justifyContent: 'center' }}>
              <Text style={{ fontSize: 17, fontWeight: '600', color: '#FFFFFF' }}>Чудово</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </>
  );
}
