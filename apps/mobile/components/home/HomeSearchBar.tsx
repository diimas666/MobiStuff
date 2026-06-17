import { useState } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { radius } from '../../constants/theme';
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
    marginBottom: 20,
  },
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: c.homeSearch,
    borderRadius: radius.pill,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: c.textOnDark,
    paddingVertical: 4,
  },
  results: {
    marginTop: 8,
    backgroundColor: c.card,
    borderRadius: radius.md,
    overflow: 'hidden',
  },
  emptyText: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 14,
    color: c.textMuted,
    textAlign: 'center',
  },
}));

  const [query, setQuery] = useState('');
  const { results, isSearching } = useProductSearch(query);
  const showResults = query.trim().length > 0;

  const handleProductPress = (product: HomeProduct) => {
    setQuery('');
    onProductPress?.(product);
  };

  return (
    <View style={styles.wrapper}>
      <View style={styles.container}>
        <Ionicons name="search-outline" size={20} color={colors.textOnDarkMuted} />
        <TextInput
          value={query}
          onChangeText={setQuery}
          placeholder="Пошук товарів"
          placeholderTextColor={colors.textOnDarkMuted}
          style={styles.input}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
        />
        {query.length > 0 ? (
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
          {isSearching ? (
            <Text style={styles.emptyText}>Пошук...</Text>
          ) : results.length === 0 ? (
            <Text style={styles.emptyText}>Нічого не знайдено</Text>
          ) : (
            results.map(product => (
              <HomeSearchResultItem
                key={product.id}
                product={product}
                onPress={() => handleProductPress(product)}
              />
            ))
          )}
        </View>
      ) : null}
    </View>
  );
}

