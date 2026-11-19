import { useEffect, useRef, useState } from 'react';
import { Dimensions, FlatList, Pressable, Text, View, type NativeScrollEvent, type NativeSyntheticEvent } from 'react-native';
import { ProductImage } from '../ProductImage';
import { spacing } from '../../constants/theme';
import { formatPrice, type HomeProduct } from '../../types/catalog';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const { width: screenWidth } = Dimensions.get('window');
const GAP = 10;
const slideWidth = screenWidth - spacing.screen * 2;
const AUTOPLAY_MS = 5000;

type Props = {
  items: HomeProduct[];
  onProductPress?: (product: HomeProduct) => void;
};

/** Головний банер: хіти продажу великими картками з автопрокруткою */
export function TrendingSlider({ items, onProductPress }: Props) {
  const { styles } = useThemedStyles(c => ({
    wrapper: { marginBottom: 32 },
    slide: { width: slideWidth, borderRadius: 28, backgroundColor: c.card, overflow: 'hidden' },
    imageArea: { height: 210, backgroundColor: '#FFFFFF', alignItems: 'center', justifyContent: 'center' },
    body: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 20 },
    eyebrow: { fontSize: 13, fontWeight: '600', color: c.sale, marginBottom: 4 },
    title: { fontSize: 22, lineHeight: 27, fontWeight: '700', letterSpacing: -0.4, color: c.text },
    row: { marginTop: 12, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
    price: { fontSize: 20, fontWeight: '700', letterSpacing: -0.3, color: c.text },
    buy: { height: 40, paddingHorizontal: 20, borderRadius: 20, backgroundColor: c.primary, alignItems: 'center', justifyContent: 'center' },
    buyText: { fontSize: 15, fontWeight: '600', color: c.onPrimary },
    dots: { flexDirection: 'row', justifyContent: 'center', gap: 6, marginTop: 12 },
    dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: c.line },
    dotActive: { width: 18, backgroundColor: c.text },
  }));
  const [active, setActive] = useState(0);
  const listRef = useRef<FlatList<HomeProduct>>(null);
  const touching = useRef(false);
  const slides = items.slice(0, 6);

  useEffect(() => {
    if (slides.length < 2) return;
    const t = setInterval(() => {
      if (touching.current) return;
      const next = (active + 1) % slides.length;
      listRef.current?.scrollToOffset({ offset: next * (slideWidth + GAP), animated: true });
    }, AUTOPLAY_MS);
    return () => clearInterval(t);
  }, [active, slides.length]);

  const onScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const i = Math.round(e.nativeEvent.contentOffset.x / (slideWidth + GAP));
    if (i !== active) setActive(i);
  };

  if (slides.length === 0) return null;

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={slides}
        keyExtractor={item => item.id}
        horizontal
        snapToInterval={slideWidth + GAP}
        decelerationRate="fast"
        showsHorizontalScrollIndicator={false}
        ItemSeparatorComponent={() => <View style={{ width: GAP }} />}
        onScroll={onScroll}
        scrollEventThrottle={32}
        onScrollBeginDrag={() => (touching.current = true)}
        onScrollEndDrag={() => (touching.current = false)}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.title}, ${formatPrice(item.price)}`}
            onPress={() => onProductPress?.(item)}
            style={({ pressed }) => [styles.slide, pressed && { opacity: 0.96 }]}>
            <View style={styles.imageArea}>
              <ProductImage uri={item.image} label={item.title} size={190} resizeMode="contain" backgroundColor="#FFFFFF" />
            </View>
            <View style={styles.body}>
              <Text style={styles.eyebrow}>Хіт продажу</Text>
              <Text style={styles.title} numberOfLines={2}>
                {item.title}
              </Text>
              <View style={styles.row}>
                <Text style={styles.price}>{formatPrice(item.price)}</Text>
                <View style={styles.buy}>
                  <Text style={styles.buyText}>Купити</Text>
                </View>
              </View>
            </View>
          </Pressable>
        )}
      />
      {slides.length > 1 ? (
        <View style={styles.dots}>
          {slides.map((s, i) => (
            <View key={s.id} style={[styles.dot, i === active && styles.dotActive]} />
          ))}
        </View>
      ) : null}
    </View>
  );
}
