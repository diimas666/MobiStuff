import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { colors } from '../../constants/theme';

type Props = {
  isGuest: boolean;
  name?: string;
  email?: string;
  onGuestPress?: () => void;
  onSettingsPress?: () => void;
};

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);

  if (parts.length === 0) {
    return '?';
  }

  if (parts.length === 1) {
    return parts[0].slice(0, 1).toUpperCase();
  }

  return `${parts[0].slice(0, 1)}${parts[1].slice(0, 1)}`.toUpperCase();
}

export function ProfileUserHeader({
  isGuest,
  name = '',
  email = '',
  onGuestPress,
  onSettingsPress,
}: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    marginBottom: 8,
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '700',
    color: c.textMuted,
  },
  info: {
    flex: 1,
    gap: 4,
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: c.text,
  },
  email: {
    fontSize: 14,
    color: c.textMuted,
  },
  settingsButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: {
    opacity: 0.72,
  },
}));

  const content = (
    <>
      {isGuest ? (
        <View style={styles.avatar}>
          <Ionicons name="person-outline" size={26} color={colors.textMuted} />
        </View>
      ) : onSettingsPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Налаштування профілю"
          onPress={onSettingsPress}
          style={({ pressed }) => [styles.avatar, pressed && styles.pressed]}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </Pressable>
      ) : (
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        </View>
      )}

      <View style={styles.info}>
        {isGuest ? (
          <>
            <Text style={styles.name}>Увійти в додаток</Text>
            <Text style={styles.email}>Щоб бачити замовлення та збережені дані</Text>
          </>
        ) : (
          <>
            <Text style={styles.name}>{name}</Text>
            {email ? <Text style={styles.email}>{email}</Text> : null}
          </>
        )}
      </View>

      {onSettingsPress ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Налаштування"
          onPress={onSettingsPress}
          style={({ pressed }) => [styles.settingsButton, pressed && styles.pressed]}>
          <Ionicons name="settings-outline" size={22} color={colors.textMuted} />
        </Pressable>
      ) : null}
    </>
  );

  if (isGuest && onGuestPress) {
    return (
      <Pressable
        accessibilityRole="button"
        onPress={onGuestPress}
        style={({ pressed }) => [styles.header, pressed && styles.pressed]}>
        {content}
      </Pressable>
    );
  }

  return <View style={styles.header}>{content}</View>;
}

