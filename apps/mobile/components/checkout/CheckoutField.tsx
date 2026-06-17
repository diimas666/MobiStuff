import { StyleSheet, TextInput, type TextInputProps } from 'react-native';
import { CheckoutInputShell } from './CheckoutInputShell';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { colors } from '../../constants/theme';

type Props = TextInputProps & {
  label: string;
  optional?: boolean;
  hideLabel?: boolean;
  icon?: string;
  errorText?: string;
};

export function CheckoutField({
  label,
  optional,
  hideLabel,
  icon,
  errorText,
  style,
  multiline,
  ...inputProps
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingVertical: 12,
    minHeight: 24,
  },
  inputMultiline: {
    width: '100%',
    minHeight: 80,
    paddingVertical: 0,
    fontSize: 15,
    lineHeight: 22,
    textAlignVertical: 'top',
  },
}));

  return (
    <CheckoutInputShell
      label={label}
      optional={optional}
      hideLabel={hideLabel}
      icon={icon}
      multiline={multiline}
      errorText={errorText}>
      {({ onFocus, onBlur }) => (
        <TextInput
          placeholderTextColor={colors.textMuted}
          style={[styles.input, multiline && styles.inputMultiline, style]}
          multiline={multiline}
          onFocus={event => {
            onFocus();
            inputProps.onFocus?.(event);
          }}
          onBlur={event => {
            onBlur();
            inputProps.onBlur?.(event);
          }}
          {...inputProps}
        />
      )}
    </CheckoutInputShell>
  );
}

