import { Linking, Pressable, StyleSheet, Text, View } from 'react-native';
import { baseUrl } from '../../config/api';
import { radius } from '../../constants/theme';
import { useThemedStyles } from '../../hooks/useThemedStyles';

const PRIVACY_POLICY_URL = `${baseUrl}/privacy`;

type Props = {
  checked: boolean;
  onToggle: () => void;
  onOpenPolicy?: () => void;
  showError?: boolean;
};

export function CheckoutConsentCheckbox({
  checked,
  onToggle,
  onOpenPolicy,
  showError,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  wrapper: {
    gap: 6,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
    padding: 14,
    borderRadius: radius.sm,
    backgroundColor: c.card,
  },
  checkboxHit: {
    paddingTop: 1,
  },
  pressed: {
    opacity: 0.92,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    borderColor: c.primary,
    backgroundColor: c.primary,
  },
  checkmark: {
    color: c.textOnDark,
    fontSize: 14,
    fontWeight: '700',
    lineHeight: 16,
  },
  text: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: c.text,
  },
  link: {
    color: c.primary,
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  error: {
    fontSize: 12,
    color: c.danger,
    paddingHorizontal: 4,
  },
}));

  const openPrivacyPolicy = () => {
    if (onOpenPolicy) {
      onOpenPolicy();
      return;
    }

    void Linking.openURL(PRIVACY_POLICY_URL).catch(() => {});
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.row}>
        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked }}
          onPress={onToggle}
          hitSlop={8}
          style={({ pressed }) => [styles.checkboxHit, pressed && styles.pressed]}>
          <View style={[styles.checkbox, checked && styles.checkboxChecked]}>
            {checked ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
        </Pressable>
        <Text style={styles.text}>
          Я погоджуюсь на{' '}
          <Text style={styles.link} onPress={openPrivacyPolicy}>
            обробку моїх персональних даних
          </Text>{' '}
          відповідно до{' '}
          <Text style={styles.link} onPress={openPrivacyPolicy}>
            Політики конфіденційності
          </Text>
        </Text>
      </View>
      {showError ? (
        <Text style={styles.error}>Потрібна згода на обробку персональних даних</Text>
      ) : null}
    </View>
  );
}

