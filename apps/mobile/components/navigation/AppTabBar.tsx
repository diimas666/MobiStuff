import { CommonActions, useNavigation } from '@react-navigation/native';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useCart } from '../../context/CartContext';
import { tabItems } from '../../navigation/tabConfig';
import type { TabParamList } from '../../navigation/types';
import { useThemedStyles } from '../../hooks/useThemedStyles';
import { colors } from '../../constants/theme';

type Props = {
  activeTab?: keyof TabParamList;
};

export function AppTabBar({ activeTab }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
  barContainer: {
    backgroundColor: c.homeBackground,
  },
  bar: {
    flexDirection: 'row',
    backgroundColor: c.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 8,
    minHeight: 72,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    overflow: 'hidden',
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
  },
  iconWrap: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 9,
    height: 9,
    borderRadius: 5,
    backgroundColor: c.danger,
    borderWidth: 1.5,
    borderColor: c.background,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
  pressed: {
    opacity: 0.75,
  },
}));

  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const { totalQuantity } = useCart();
  const hasCartItems = totalQuantity > 0;

  const navigateTo = (screen: keyof TabParamList) => {
    navigation.dispatch(
      CommonActions.navigate({
        name: 'MainTabs',
        params: { screen },
      }),
    );
  };

  return (
    <View style={styles.barContainer}>
      <View
        style={[
          styles.bar,
          { paddingBottom: Math.max(insets.bottom, 8) },
        ]}>
      {tabItems.map(tab => {
        const focused = activeTab === tab.name;
        const iconName = focused ? tab.icons.active : tab.icons.inactive;
        const color = focused ? colors.primary : colors.textMuted;

        return (
          <Pressable
            key={tab.name}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            onPress={() => navigateTo(tab.name)}
            style={({ pressed }) => [styles.tab, pressed && styles.pressed]}>
            <View style={styles.iconWrap}>
              <Ionicons name={iconName} size={24} color={color} />
              {tab.name === 'Cart' && hasCartItems ? (
                <View style={styles.cartBadge} />
              ) : null}
            </View>
            <Text style={[styles.label, { color }]}>{tab.label}</Text>
          </Pressable>
        );
      })}
      </View>
    </View>
  );
}

