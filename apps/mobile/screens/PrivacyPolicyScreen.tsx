import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { Linking, Pressable, ScrollView, StatusBar, StyleSheet, Text, View } from 'react-native';
import { BackButton } from '../components/navigation/BackButton';
import { Screen } from '../components/Screen';
import { colors, radius, spacing } from '../constants/theme';
import type { RootStackParamList } from '../navigation/types';

const privacyPolicyMeta = {
  lastUpdated: '17 червня 2026 року',
  email: 'mobistuffinfo@gmail.com',
};

type PrivacySection = {
  title: string;
  paragraphs: string[];
  bullets?: string[];
};

const privacyPolicySections: PrivacySection[] = [
  {
    title: '1. Загальні положення',
    paragraphs: [
      'Ця Політика конфіденційності визначає порядок збору, обробки, зберігання та захисту персональних даних користувачів інтернет-магазину MobiStuff.',
      'Політика розроблена відповідно до Закону України «Про захист персональних даних» та інших нормативно-правових актів України.',
    ],
  },
  {
    title: '2. Володілець персональних даних',
    paragraphs: [
      'Володільцем персональних даних є MobiStuff — інтернет-магазин мобільних аксесуарів в Україні.',
      `З питань обробки даних: ${privacyPolicyMeta.email}.`,
    ],
  },
  {
    title: '3. Які дані збираємо',
    paragraphs: ['Ми обробляємо такі персональні дані:'],
    bullets: [
      "ім'я та прізвище;",
      'номер телефону;',
      'email (за бажанням);',
      'місто та відділення доставки;',
      'інформація про замовлення;',
      'коментар до замовлення.',
    ],
  },
  {
    title: '4. Мета обробки',
    paragraphs: ['Дані використовуються для:'],
    bullets: [
      'оформлення та виконання замовлення;',
      'доставки через Нову пошту;',
      "зв'язку щодо статусу замовлення;",
      'обробки повернень;',
      'дотримання законодавства України.',
    ],
  },
  {
    title: '5. Передача третім особам',
    paragraphs: [
      'Ми не продаємо ваші дані. Передача можлива лише службам доставки, платіжним сервісам та IT-постачальникам у межах, необхідних для надання послуг.',
    ],
  },
  {
    title: '6. Ваші права',
    paragraphs: ['Ви маєте право на доступ, виправлення, видалення даних та відкликання згоди.'],
    bullets: [
      'звернутись з запитом на email;',
      'відкликати згоду на обробку;',
      'захистити права у судовому порядку.',
    ],
  },
  {
    title: '7. Контакти',
    paragraphs: [
      `З питань конфіденційності пишіть на ${privacyPolicyMeta.email}.`,
      'Повна версія політики також доступна на сайті MobiStuff.',
    ],
  },
];

type Props = NativeStackScreenProps<RootStackParamList, 'PrivacyPolicy'>;

export function PrivacyPolicyScreen({ navigation }: Props) {
  return (
    <Screen backgroundColor={colors.homeBackground}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <BackButton onPress={() => navigation.goBack()} />
        <Text style={styles.headerTitle}>Політика конфіденційності</Text>
        <View style={styles.headerSpacer} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}>
        <Text style={styles.updated}>Оновлено: {privacyPolicyMeta.lastUpdated}</Text>

        {privacyPolicySections.map(section => (
          <View key={section.title} style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
            {section.paragraphs.map(paragraph => (
              <Text key={paragraph} style={styles.paragraph}>
                {paragraph}
              </Text>
            ))}
            {section.bullets ? (
              <View style={styles.bulletList}>
                {section.bullets.map(item => (
                  <Text key={item} style={styles.bulletItem}>
                    • {item}
                  </Text>
                ))}
              </View>
            ) : null}
          </View>
        ))}

        <Pressable
          accessibilityRole="link"
          onPress={() => void Linking.openURL(`mailto:${privacyPolicyMeta.email}`)}
          style={({ pressed }) => [styles.contactLink, pressed && styles.pressed]}>
          <Text style={styles.contactText}>
            Питання? Напишіть на {privacyPolicyMeta.email}
          </Text>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.screen,
    paddingBottom: 12,
    gap: 12,
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.textOnDark,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    paddingHorizontal: spacing.screen,
    paddingBottom: 32,
    gap: 14,
  },
  updated: {
    fontSize: 13,
    color: colors.textOnDarkMuted,
    marginBottom: 4,
  },
  sectionCard: {
    backgroundColor: colors.card,
    borderRadius: radius.lg,
    padding: 16,
    gap: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.text,
  },
  paragraph: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  bulletList: {
    gap: 4,
    paddingLeft: 4,
  },
  bulletItem: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.text,
  },
  contactLink: {
    marginTop: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  contactText: {
    fontSize: 14,
    color: colors.price,
    fontWeight: '600',
    textAlign: 'center',
  },
  pressed: {
    opacity: 0.85,
  },
});
