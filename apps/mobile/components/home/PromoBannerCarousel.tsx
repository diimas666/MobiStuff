import { useRef, useState } from 'react';
import {
  Dimensions,
  FlatList,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  Text,
  View,
} from 'react-native';
import { radius, spacing } from '../../constants/theme';
import type { PromoBanner } from '../../types/promotion';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const { width: screenWidth } = Dimensions.get('window');
const bannerWidth = screenWidth - spacing.screen * 2;

type Props = {
  items: PromoBanner[];
  visible?: boolean;
  onBannerPress?: (banner: PromoBanner) => void;
};

export function PromoBannerCarousel({
  items,
  visible = true,
  onBannerPress,
}: Props) {
  const { styles } = useThemedStyles(c => ({
    wrapper: {
      marginBottom: 28,
    },
    banner: {
      minHeight: 148,
      borderRadius: radius.lg,
      padding: 20,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.08)',
    },
    content: {
      flex: 1,
      paddingRight: 12,
    },
    title: {
      fontSize: 21,
      fontWeight: '700',
      color: c.textOnDark,
      marginBottom: 4,
    },
    subtitle: {
      fontSize: 14,
      color: c.textOnDarkMuted,
      marginBottom: 14,
      lineHeight: 20,
    },
    cta: {
      alignSelf: 'flex-start',
      backgroundColor: c.homeSurface,
      borderRadius: radius.pill,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
    },
    ctaText: {
      fontSize: 13,
      fontWeight: '600',
      color: c.textOnDark,
    },
    emoji: {
      fontSize: 52,
      opacity: 0.95,
    },
    image: {
      width: 88,
      height: 88,
      borderRadius: radius.md,
    },
    dots: {
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
      marginTop: 12,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(255,255,255,0.25)',
    },
    dotActive: {
      width: 18,
      backgroundColor: c.textOnDarkMuted,
    },
    pressed: {
      opacity: 0.92,
      transform: [{ scale: 0.99 }],
    },
  }));

  const [activeIndex, setActiveIndex] = useState(0);
  const listRef = useRef<FlatList<PromoBanner>>(null);

  const onScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
    const index = Math.round(event.nativeEvent.contentOffset.x / bannerWidth);
    setActiveIndex(index);
  };

  if (!visible || items.length === 0) {
    return null;
  }

  return (
    <View style={styles.wrapper}>
      <FlatList
        ref={listRef}
        data={items}
        keyExtractor={item => item.id}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={onScroll}
        scrollEventThrottle={16}
        renderItem={({ item }) => (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={item.title}
            onPress={() => onBannerPress?.(item)}
            style={({ pressed }) => [
              styles.banner,
              { width: bannerWidth, backgroundColor: item.color },
              pressed && styles.pressed,
            ]}
          >
            <View style={styles.content}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.subtitle}>{item.subtitle}</Text>
              <View style={styles.cta}>
                <Text style={styles.ctaText}>{item.cta}</Text>
              </View>
            </View>
            {item.imageUrl ? (
              <Image
                source={{ uri: item.imageUrl }}
                style={styles.image}
                resizeMode="contain"
              />
            ) : (
              <Text style={styles.emoji}>{item.emoji}</Text>
            )}
          </Pressable>
        )}
      />

      <View style={styles.dots}>
        {items.map((item, index) => (
          <View
            key={item.id}
            style={[styles.dot, index === activeIndex && styles.dotActive]}
          />
        ))}
      </View>
    </View>
  );
}
