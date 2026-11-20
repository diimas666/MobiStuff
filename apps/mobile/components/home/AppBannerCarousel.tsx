import { useState } from 'react';
import { Dimensions, Image, Linking, Pressable, ScrollView, Text, View } from 'react-native';
import { baseUrl } from '../../config/api';
import type { AppBanner } from '../../hooks/useAppConfig';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { spacing } from '../../constants/theme';

const WIDTH = Dimensions.get('window').width - spacing.screen * 2;

/** Баннери з адмінки (розділ «Застосунок») */
export function AppBannerCarousel({ items }: { items: AppBanner[] }) {
  const [index, setIndex] = useState(0);
  const { styles, colors } = useThemedStyles(c => ({
    wrap: { marginBottom: 28 },
    card: { width: WIDTH, height: WIDTH * 0.5, borderRadius: 24, overflow: 'hidden', backgroundColor: c.text },
    image: { ...StyleSheetAbsolute },
    shade: { ...StyleSheetAbsolute, backgroundColor: 'rgba(0,0,0,0.28)' },
    body: { flex: 1, padding: 20, justifyContent: 'flex-end' },
    title: { fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5, color: '#FFFFFF' },
    subtitle: { marginTop: 4, fontSize: 15, color: 'rgba(255,255,255,0.88)' },
    code: { alignSelf: 'flex-start', marginTop: 10, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 14, backgroundColor: '#FFFFFF' },
    codeText: { fontSize: 14, fontWeight: '700', color: c.primary, letterSpacing: 0.5 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 10 },
    dot: { width: 6, height: 6, borderRadius: 3 },
  }));
  if (!items.length) return null;

  const open = (b: AppBanner) => {
    if (b.link) void Linking.openURL(b.link).catch(() => {});
  };

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        pagingEnabled
        snapToInterval={WIDTH + 10}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ gap: 10 }}
        onMomentumScrollEnd={e => setIndex(Math.round(e.nativeEvent.contentOffset.x / (WIDTH + 10)))}>
        {items.map(b => (
          <Pressable key={b.id} accessibilityRole="button" accessibilityLabel={b.title} onPress={() => open(b)} style={styles.card}>
            {b.image ? <Image source={{ uri: b.image.startsWith('/') ? `${baseUrl}${b.image}` : b.image }} style={styles.image} resizeMode="cover" /> : null}
            {b.image && b.title ? <View style={styles.shade} /> : null}
            <View style={styles.body}>
              {b.title ? <Text style={styles.title}>{b.title}</Text> : null}
              {b.subtitle ? <Text style={styles.subtitle}>{b.subtitle}</Text> : null}
              {b.promoCode ? (
                <View style={styles.code}>
                  <Text style={styles.codeText}>Код {b.promoCode}</Text>
                </View>
              ) : null}
            </View>
          </Pressable>
        ))}
      </ScrollView>
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((b, i) => (
            <View key={b.id} style={[styles.dot, { backgroundColor: i === index ? colors.text : colors.line }]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}

const StyleSheetAbsolute = { position: 'absolute' as const, top: 0, left: 0, right: 0, bottom: 0 };
