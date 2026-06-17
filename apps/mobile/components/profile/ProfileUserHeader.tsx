import { Pressable, StyleSheet, Text, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useThemedStyles } from '../../hooks/useThemedStyles';

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
      paddingVertical: 4,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      backgroundColor: c.homeSurface,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.18)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: 22,
      fontWeight: '700',
      color: c.textOnDark,
    },
    info: {
      flex: 1,
      gap: 4,
    },
    name: {
      fontSize: 22,
      fontWeight: '700',
      color: c.textOnDark,
    },
    email: {
      fontSize: 14,
      lineHeight: 20,
      color: c.textOnDarkMuted,
    },
    settingsButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: c.homeSurface,
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.12)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    pressed: {
      opacity: 0.72,
    },
  }));

  const content = (
    <>
      <View style={styles.avatar}>
        {isGuest ? (
          <Ionicons name="person-outline" size={28} color={colors.textOnDarkMuted} />
        ) : (
          <Text style={styles.avatarText}>{getInitials(name)}</Text>
        )}
      </View>

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
          <Ionicons name="settings-outline" size={20} color={colors.textOnDark} />
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
