import { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Linking,
  Platform,
  Pressable,
  ScrollView,
  StatusBar,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useFocusEffect, useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { SupportTopicSelect } from '../components/support/SupportTopicSelect';
import { radius, spacing } from '../constants/theme';
import {
  SUPPORT_STORE_EMAIL,
  SUPPORT_TEAM_EMAIL,
  type SupportTopicId,
} from '../constants/support';
import { useNetwork } from '../context/NetworkContext';
import { showErrorToast, showToast } from '../context/ToastContext';
import { useThemedStyles } from '../hooks/useThemedStyles';
import type { ProfileStackParamList } from '../navigation/types';
import { loadCheckoutProfile } from '../services/checkoutProfileStorage';
import { submitSupportRequest } from '../services/supportApi';

type NavigationProp = NativeStackNavigationProp<ProfileStackParamList, 'Support'>;

export function SupportScreen() {
  const { styles, colors } = useThemedStyles(c => ({
    flex: {
      flex: 1,
    },
    content: {
      paddingHorizontal: spacing.screen,
      paddingBottom: 32,
    },
    headerRow: {
      marginBottom: 16,
    },
    titleBlock: {
      marginBottom: 18,
      gap: 8,
    },
    title: {
      fontSize: 28,
      fontWeight: '700',
      color: c.textOnDark,
    },
    subtitle: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textOnDarkMuted,
    },
    emailCard: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      padding: 16,
      gap: 10,
      marginBottom: 18,
    },
    emailCardTitle: {
      fontSize: 15,
      fontWeight: '700',
      color: c.text,
    },
    emailCardHint: {
      fontSize: 13,
      lineHeight: 18,
      color: c.textMuted,
    },
    emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      paddingVertical: 4,
    },
    emailText: {
      flex: 1,
      fontSize: 14,
      fontWeight: '600',
      color: c.primary,
    },
    formCard: {
      backgroundColor: c.card,
      borderRadius: radius.lg,
      padding: 16,
      gap: 16,
    },
    formTitle: {
      fontSize: 16,
      fontWeight: '700',
      color: c.text,
    },
    messageLabel: {
      fontSize: 14,
      fontWeight: '600',
      color: c.text,
      paddingHorizontal: 2,
    },
    textarea: {
      minHeight: 140,
      borderWidth: 1,
      borderColor: '#E5E7EB',
      borderRadius: radius.md,
      paddingHorizontal: 14,
      paddingVertical: 12,
      fontSize: 15,
      lineHeight: 22,
      color: c.text,
      textAlignVertical: 'top',
    },
    textareaError: {
      borderColor: c.danger,
    },
    hint: {
      fontSize: 12,
      color: c.textMuted,
      paddingHorizontal: 2,
    },
    error: {
      fontSize: 12,
      color: c.danger,
      paddingHorizontal: 2,
    },
    submitButton: {
      minHeight: 52,
      borderRadius: radius.pill,
      backgroundColor: c.primary,
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: 8,
    },
    submitButtonDisabled: {
      opacity: 0.55,
    },
    submitText: {
      fontSize: 16,
      fontWeight: '700',
      color: c.textOnDark,
    },
    pressed: {
      opacity: 0.86,
    },
  }));

  const navigation = useNavigation<NavigationProp>();
  const { isOffline } = useNetwork();
  const [topic, setTopic] = useState<SupportTopicId | null>(null);
  const [message, setMessage] = useState('');
  const [topicError, setTopicError] = useState('');
  const [messageError, setMessageError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileName, setProfileName] = useState('');
  const [profileEmail, setProfileEmail] = useState('');
  const [profilePhone, setProfilePhone] = useState('');

  useFocusEffect(
    useCallback(() => {
      let isMounted = true;

      loadCheckoutProfile().then(profile => {
        if (!isMounted || !profile) {
          return;
        }

        setProfileName(profile.name.trim());
        setProfileEmail(profile.email.trim());
        setProfilePhone(profile.phone.trim());
      });

      return () => {
        isMounted = false;
      };
    }, []),
  );

  const openEmail = useCallback((email: string) => {
    void Linking.openURL(`mailto:${email}`);
  }, []);

  const handleSubmit = useCallback(async () => {
    const nextTopicError = topic ? '' : 'Оберіть тему звернення';
    const trimmedMessage = message.trim();
    const nextMessageError =
      trimmedMessage.length >= 10 ? '' : 'Напишіть повідомлення щонайменше з 10 символів';

    setTopicError(nextTopicError);
    setMessageError(nextMessageError);

    if (nextTopicError || nextMessageError) {
      return;
    }

    if (isOffline) {
      showToast('Немає зʼєднання. Спробуйте пізніше або напишіть на email', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      await submitSupportRequest({
        topic: topic!,
        message: trimmedMessage,
        name: profileName || undefined,
        email: profileEmail || undefined,
        phone: profilePhone || undefined,
      });

      showToast('Дякуємо! Повідомлення надіслано', 'success');
      setMessage('');
      setTopic(null);
    } catch (error) {
      showErrorToast(error, 'Не вдалося надіслати повідомлення');
    } finally {
      setIsSubmitting(false);
    }
  }, [isOffline, message, profileEmail, profileName, profilePhone, topic]);

  return (
    <Screen variant="home">
      <StatusBar barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.content}>
          <View style={styles.headerRow}>
            <BackButton onPress={() => navigation.goBack()} />
          </View>

          <View style={styles.titleBlock}>
            <Text style={styles.title}>Підтримка</Text>
            <Text style={styles.subtitle}>
              Питання щодо товару, замовлення чи доставки? Напишіть нам — відповімо
              якнайшвидше в робочий час.
            </Text>
          </View>

          <View style={styles.emailCard}>
            <Text style={styles.emailCardTitle}>Напишіть нам на email</Text>
            <Text style={styles.emailCardHint}>
              Або заповніть форму нижче — ми отримаємо ваше звернення одразу.
            </Text>

            <Pressable
              accessibilityRole="link"
              onPress={() => openEmail(SUPPORT_STORE_EMAIL)}
              style={({ pressed }) => [styles.emailRow, pressed && styles.pressed]}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.emailText}>{SUPPORT_STORE_EMAIL}</Text>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>

            <Pressable
              accessibilityRole="link"
              onPress={() => openEmail(SUPPORT_TEAM_EMAIL)}
              style={({ pressed }) => [styles.emailRow, pressed && styles.pressed]}>
              <Ionicons name="mail-outline" size={18} color={colors.primary} />
              <Text style={styles.emailText}>{SUPPORT_TEAM_EMAIL}</Text>
              <Ionicons name="open-outline" size={16} color={colors.textMuted} />
            </Pressable>
          </View>

          <View style={styles.formCard}>
            <Text style={styles.formTitle}>Форма звернення</Text>

            <SupportTopicSelect
              value={topic}
              onChange={nextTopic => {
                setTopic(nextTopic);
                setTopicError('');
              }}
              errorText={topicError}
            />

            <View style={{ gap: 8 }}>
              <Text style={styles.messageLabel}>Повідомлення</Text>
              <TextInput
                value={message}
                onChangeText={nextValue => {
                  setMessage(nextValue);
                  if (messageError) {
                    setMessageError('');
                  }
                }}
                placeholder="Опишіть питання, пропозицію або проблему..."
                placeholderTextColor={colors.textMuted}
                multiline
                textAlignVertical="top"
                style={[styles.textarea, messageError ? styles.textareaError : null]}
              />
              {messageError ? (
                <Text style={styles.error}>{messageError}</Text>
              ) : (
                <Text style={styles.hint}>Мінімум 10 символів</Text>
              )}
            </View>

            <Pressable
              accessibilityRole="button"
              disabled={isSubmitting}
              onPress={() => void handleSubmit()}
              style={({ pressed }) => [
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled,
                pressed && !isSubmitting && styles.pressed,
              ]}>
              {isSubmitting ? (
                <ActivityIndicator color={colors.textOnDark} />
              ) : (
                <>
                  <Ionicons name="send-outline" size={18} color={colors.textOnDark} />
                  <Text style={styles.submitText}>Надіслати</Text>
                </>
              )}
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
