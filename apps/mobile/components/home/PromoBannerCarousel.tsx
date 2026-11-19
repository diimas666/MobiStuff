import { useState } from 'react';
import { Dimensions, FlatList, Image, Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { spacing } from '../../constants/theme';
import type { PromoBanner } from '../../types/promotion';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { SectionHeader } from '../ui/SectionHeader';

const { width: screenWidth } = Dimensions.get('window');
const GAP = 10;
const bannerWidth = screenWidth - spacing.screen * 2;

type Props = {
  items: PromoBanner[];
  visible?: boolean;
  onBannerPress?: (banner: PromoBanner) => void;
};

/** Акції з адмінки: темна картка з фото товару */
export function PromoBannerCarousel({ items, visible = true, onBannerPress }: Props) {
  const { styles } = useThemedStyles(c => ({
    wrapper: { marginBottom: 32 },
    banner: { height: 164, borderRadius: 24, padding: 20, flexDirection: 'row', alignItems: 'center', overflow: 'hidden' },
    content: { flex: 1, paddingRight: 12, justifyContent: 'center' },
    title: { fontSize: 24, lineHeight: 28, fontWeight: '700', letterSpacing: -0.5, color: '#FFFFFF' },
    subtitle: { marginTop: 4, fontSize: 15, lineHeight: 20, color: 'rgba(255,255,255,0.75)' },
    cta: { marginTop: 14, flexDirection: 'row', alignItems: 'center', gap: 2 },
    ctaText: { fontSize: 15, fontWeight: '600', color: '#FFFFFF' },
    imageBox: { width: 112, height: 112, borderRadius: 20, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
    image: { width: 96, height: 96 },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.line },
    dotActive: { width: 18, backgroundColor: c.text },
  }));
  const [activeIndex, setActiveIndex] = useState(0);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    setActiveIndex(Math.round(event.nativeEvent.contentOffset.x / (bannerWidth + GAP)));
  };

  if (!visible || items.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <SectionHeader title="Акції" subtitle="Вигідніше, ніж зазвичай." />
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        horizontal
        snapToInterval={bannerWidth + GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={onScroll}
        scrollEventThrottle={32}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onBannerPress?.(item)}
            style={({ pressed }) => [styles.banner, { width: bannerWidth, backgroundColor: item.color || '#1D1D1F' }, pressed && { opacity: 0.94 }]}>
            <View style={styles.content}>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.subtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              ) : null}
              <View style={styles.cta}>
                <Text style={styles.ctaText}>{item.cta || 'До покупок'}</Text>
                <Ionicons name="chevron-forward" size={16} color="#FFFFFF" />
              </View>
            </View>
            {item.imageUrl ? (
              <View style={styles.imageBox}>
                <Image source={{ uri: item.imageUrl }} style={styles.image} resizeMode="contain" />
              </View>
            ) : null}
          </Pressable>
        )}
      />
      {items.length > 1 ? (
        <View style={styles.dots}>
          {items.map((item, index) => (
            <View key={item.id} style={[styles.dot, index === activeIndex && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
