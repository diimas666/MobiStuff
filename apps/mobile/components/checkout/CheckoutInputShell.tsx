import { useState, type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { colors, radius } from '../../constants/theme';

type Props = {
  label: string;
  optional?: boolean;
  hideLabel?: boolean;
  helperText?: string;
  errorText?: string;
  icon?: string;
  multiline?: boolean;
  children: (props: {
    focused: boolean;
    onFocus: () => void;
    onBlur: () => void;
  }) => ReactNode;
};

export function CheckoutInputShell({
  label,
  optional,
  hideLabel = false,
  helperText,
  errorText,
  icon,
  multiline = false,
  children,
}: Props) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrap}>
      {!hideLabel ? (
        <Text style={styles.label}>
          {label}
          {optional ? <Text style={styles.optional}> · необов&apos;язково</Text> : null}
        </Text>
      ) : optional ? (
        <Text style={styles.optionalOnly}>Необов&apos;язково</Text>
      ) : null}

      <View
        style={[
          styles.inputBox,
          multiline && styles.inputBoxMultiline,
          focused && styles.inputBoxFocused,
          Boolean(errorText) && styles.inputBoxError,
        ]}>
        {icon && !multiline ? (
          <Ionicons
            name={icon}
            size={18}
            color={focused ? colors.primary : colors.textMuted}
            style={styles.icon}
          />
        ) : null}
        {children({
          focused,
          onFocus: () => setFocused(true),
          onBlur: () => setFocused(false),
        })}
      </View>

      {helperText ? (
        <View style={styles.helperRow}>
          <Ionicons name="checkmark-circle" size={14} color={colors.primary} />
          <Text style={styles.helper}>{helperText}</Text>
        </View>
      ) : null}

      {errorText ? <Text style={styles.error}>{errorText}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.text,
    letterSpacing: -0.2,
  },
  optional: {
    fontWeight: '400',
    color: colors.textMuted,
  },
  optionalOnly: {
    fontSize: 13,
    color: colors.textMuted,
  },
  inputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 52,
    paddingHorizontal: 14,
    borderRadius: radius.sm,
    backgroundColor: '#F3F4F6',
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    gap: 10,
  },
  inputBoxMultiline: {
    flexDirection: 'column',
    alignItems: 'stretch',
    paddingHorizontal: 16,
    paddingVertical: 14,
    minHeight: 108,
  },
  inputBoxFocused: {
    backgroundColor: '#FFFFFF',
    borderColor: colors.primary,
  },
  inputBoxError: {
    borderColor: colors.danger,
    backgroundColor: '#FEF2F2',
  },
  icon: {
    marginTop: 1,
  },
  helperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  helper: {
    flex: 1,
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '500',
    lineHeight: 18,
  },
  error: {
    fontSize: 13,
    color: colors.danger,
    lineHeight: 18,
  },
});
