import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from 'react-native';
import { radius } from '../../constants/theme';
import { CheckoutInputShell } from './CheckoutInputShell';
import { useThemedStyles } from '../../hooks/useThemedStyles';

export type AutocompleteSuggestion = {
  id: string;
  title: string;
  subtitle?: string;
};

type Props = Omit<TextInputProps, 'value' | 'onChangeText'> & {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  suggestions: AutocompleteSuggestion[];
  isLoading?: boolean;
  showSuggestions?: boolean;
  onSelect: (item: AutocompleteSuggestion) => void;
  helperText?: string;
  errorText?: string;
  icon?: string;
};

export function CheckoutAutocompleteField({
  label,
  value,
  onChangeText,
  suggestions,
  isLoading = false,
  showSuggestions = false,
  onSelect,
  helperText,
  errorText,
  icon,
  ...inputProps
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  wrap: {
    gap: 0,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: c.text,
    paddingVertical: 12,
    minHeight: 24,
  },
  suggestions: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  suggestionRow: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 3,
  },
  suggestionBorder: {
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  suggestionPressed: {
    backgroundColor: '#F0FDF4',
  },
  suggestionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: c.text,
    lineHeight: 20,
  },
  suggestionSubtitle: {
    fontSize: 13,
    color: c.textMuted,
    lineHeight: 18,
  },
}));

  const visibleSuggestions = showSuggestions && suggestions.length > 0;

  return (
    <View style={styles.wrap}>
      <CheckoutInputShell
        label={label}
        icon={icon}
        helperText={helperText}
        errorText={errorText}>
        {({ onFocus, onBlur }) => (
          <>
            <TextInput
              value={value}
              onChangeText={onChangeText}
              placeholderTextColor={colors.textMuted}
              style={styles.input}
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
            {isLoading ? <ActivityIndicator size="small" color={colors.primary} /> : null}
          </>
        )}
      </CheckoutInputShell>

      {visibleSuggestions ? (
        <View style={styles.suggestions}>
          {suggestions.map((item, index) => (
            <Pressable
              key={item.id}
              accessibilityRole="button"
              onPress={() => onSelect(item)}
              style={({ pressed }) => [
                styles.suggestionRow,
                index < suggestions.length - 1 && styles.suggestionBorder,
                pressed && styles.suggestionPressed,
              ]}>
              <Text style={styles.suggestionTitle} numberOfLines={2}>
                {item.title}
              </Text>
              {item.subtitle ? (
                <Text style={styles.suggestionSubtitle} numberOfLines={2}>
                  {item.subtitle}
                </Text>
              ) : null}
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

