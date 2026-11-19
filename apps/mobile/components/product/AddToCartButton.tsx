import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const ADDED_FEEDBACK_MS = 1500;

type Props = {
  inStock: boolean;
  inCart: boolean;
  onAdd: () => Promise<void>;
  onRemove: () => Promise<void>;
  /** Якщо задано — товар у кошику веде до кошика, а не видаляється */
  onGoToCart?: () => void;
  style?: object;
};

export function AddToCartButton({
  inStock,
  inCart,
  onAdd,
  onRemove,
  onGoToCart,
  style,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  button: {
    flex: 1,
    minHeight: 52,
    borderRadius: radius.pill,
    backgroundColor: c.primary,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  buttonInCart: {
    backgroundColor: c.text,
  },
  pressed: {
    opacity: 0.85,
    transform: [{ scale: 0.96 }],
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  text: {
    fontSize: 17,
    fontWeight: '600',
    color: c.onPrimary,
  },
  textInCart: {
    color: c.screen,
  },
}));

  const [isLoading, setIsLoading] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  useEffect(() => {
    if (!inCart) {
      setJustAdded(false);
    }
  }, [inCart]);

  const handlePress = async () => {
    if (!inStock || isLoading) {
      return;
    }

    setIsLoading(true);

    try {
      if (inCart) {
        if (onGoToCart) {
          onGoToCart();
          return;
        }
        await onRemove();
        return;
      }

      await onAdd();
      setJustAdded(true);
      setTimeout(() => setJustAdded(false), ADDED_FEEDBACK_MS);
    } catch {
      setJustAdded(false);
    } finally {
      setIsLoading(false);
    }
  };

  const showAdded = justAdded && inCart;
  const isDisabled = !inStock || isLoading;

  return (
    <Pressable
      disabled={isDisabled}
      onPress={handlePress}
      style={({ pressed }) => [
        styles.button,
        style,
        !inStock && styles.buttonDisabled,
        inCart && !showAdded && styles.buttonInCart,
        pressed && !isDisabled && styles.pressed,
      ]}>
      {isLoading ? (
        <ActivityIndicator color={colors.onPrimary} size="small" />
      ) : showAdded ? (
        <View style={styles.content}>
          <Ionicons name="checkmark-circle" size={20} color={colors.onPrimary} />
          <Text style={styles.text}>Додано в кошик</Text>
        </View>
      ) : inCart ? (
        <View style={styles.content}>
          <Ionicons name={onGoToCart ? 'bag-check-outline' : 'trash-outline'} size={19} color={colors.screen} />
          <Text style={[styles.text, styles.textInCart]}>{onGoToCart ? 'У кошику — оформити' : 'Видалити з кошика'}</Text>
        </View>
      ) : (
        <Text style={styles.text}>
          {inStock ? 'Додати в кошик' : 'Немає в наявності'}
        </Text>
      )}
    </Pressable>
  );
}

