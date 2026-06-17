import { useEffect, useRef } from 'react';
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';

const AUTO_CLOSE_MS = 4000;

type Props = {
  visible: boolean;
  onClose: () => void;
};

export function OrderSuccessModal({ visible, onClose }: Props) {
  const scale = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const textOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) {
      scale.setValue(0);
      opacity.setValue(0);
      textOpacity.setValue(0);
      return;
    }

    Animated.sequence([
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          friction: 5,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 220,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(textOpacity, {
        toValue: 1,
        duration: 280,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(onClose, AUTO_CLOSE_MS);

    return () => {
      clearTimeout(timer);
    };
  }, [visible, onClose, opacity, scale, textOpacity]);

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Animated.View
            style={[
              styles.iconWrap,
              {
                opacity,
                transform: [{ scale }],
              },
            ]}>
            <Ionicons name="checkmark" size={42} color={colors.textOnDark} />
          </Animated.View>

          <Animated.View style={{ opacity: textOpacity }}>
            <Text style={styles.title}>Дякуємо!</Text>
            <Text style={styles.subtitle}>Ваше замовлення підтверджено</Text>
          </Animated.View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingTop: '28%',
    paddingHorizontal: 32,
  },
  card: {
    width: '100%',
    maxWidth: 320,
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    paddingHorizontal: 28,
    paddingVertical: 32,
    alignItems: 'center',
    gap: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 10,
  },
  iconWrap: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.text,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    lineHeight: 22,
    color: colors.textMuted,
    textAlign: 'center',
  },
});
