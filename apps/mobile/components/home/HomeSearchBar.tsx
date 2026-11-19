import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useProductSearch } from '../../hooks/useProductSearch';
import type { HomeProduct } from '../../types/catalog';
import { HomeSearchResultItem } from './HomeSearchResultItem';
import { useThemedStyles } from '../../hooks/useThemedStyles';

type Props = {
  onProductPress?: (product: HomeProduct) => void;
};

export function HomeSearchBar({ onProductPress }: Props) {
  const { styles, colors } = useThemedStyles(c => ({
    wrapper: {
      marginBottom: 24,
      zIndex: 2,
    },
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
      height: 48,
      backgroundColor: c.card,
      borderRadius: 14,
      paddingHorizontal: 14,
    },
    input: {
      flex: 1,
      fontSize: 17,
      color: c.text,
      paddingVertical: 0,
    },
    searchingText: {
      fontSize: 14,
      color: c.textOnDarkMuted,
    },
    results: {
      marginTop: 8,
      backgroundColor: c.card,
      borderRadius: 18,
      overflow: 'hidden',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 20,
      shadowOffset: { width: 0, height: 8 },
    },
  }));

  const [query, setQuery] = useState('');
  const { results, isSearching } = useProductSearch(query);
  const trimmedQuery = query.trim();
  const hasNoResults =
    trimmedQuery.length > 0 && !isSearching && results.length === 0;
  const showResults =
    trimmedQuery.length > 0 && !isSearching && results.length > 0;

  const handleProductPress = (product: HomeProduct) => {
    setQuery('');
    onProductPress?.(product);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search" size={19} color={colors.ink3} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Навушники, павербанк, чохол…"
          placeholderTextColor={colors.textOnDarkMuted}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {isSearching ? (
          <Text style={styles.searchingText}>Пошук...</Text>
        ) : hasNoResults ? (
          <Text style={styles.searchingText}>Нічого не знайдено</Text>
        ) : null}
        {!isSearching && query.length > 0 ? (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Очистити пошук"
            hitSlop={8}
            onPress={() => setQuery('')}>
            <Ionicons name="close-circle" size={18} color={colors.textOnDarkMuted} />
          </Pressable>
        ) : null}
      </View>

      {showResults ? (
        <View style={styles.results}>
          {results.map(product => (
            <HomeSearchResultItem
              key={product.id}
              product={product}
              onPress={() => handleProductPress(product)}
            />
          ))}
        </View>
      ) : null}
    </View>
  );
}

