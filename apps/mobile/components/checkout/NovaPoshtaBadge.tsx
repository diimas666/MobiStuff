import { Image, StyleSheet, Text, View } from 'react-native';

const NP_LOGO_URI =
  'https://telegraf.com.ua/static/storage/thumbs/1400-*/c/96/29b4222e-0e8056cffbadfbc8abdb37fdbeadd96c.jpg?v=2846_1';

export function NovaPoshtaBadge() {
  return (
    <View style={styles.wrap}>
      <Image
        source={{ uri: NP_LOGO_URI }}
        style={styles.image}
        resizeMode="contain"
        defaultSource={undefined}
      />
      <Text style={styles.fallback} accessibilityElementsHidden>
        НП
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: '#DA291C',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  image: {
    width: 34,
    height: 34,
    position: 'absolute',
  },
  fallback: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    opacity: 0,
  },
});
