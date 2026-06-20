import React, { useState, useEffect, useCallback, useRef } from 'react';
import { View, StyleSheet, TextInput, FlatList, Text, TouchableOpacity, ActivityIndicator, SafeAreaView, Keyboard, StatusBar } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { ProductCard } from '../components/ProductCard';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import productsData from '../data/products.json';
import { Product } from '../types';

const ITEMS_PER_PAGE = 20;

const POPULAR_TAGS = [
  'Bosch', 'Stanley', 'Havells', 'LED Bulb', 'Drill', 'PVC Pipe', 'Asian Paints', 'Gloves'
];

export const SearchScreen: React.FC = () => {
  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  const inputRef = useRef<TextInput>(null);

  // Debouncing query state
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 250);

    return () => {
      clearTimeout(handler);
    };
  }, [query]);

  // Process search when debouncedQuery changes
  useEffect(() => {
    const cleanQuery = debouncedQuery.toLowerCase().trim();
    if (!cleanQuery) {
      setFilteredProducts([]);
      setDisplayedProducts([]);
      setPage(1);
      return;
    }

    setLoading(true);

    // Run search filtering
    // Matches name, brand, or category
    const searchResults = productsData.filter((p) => {
      return (
        p.name.toLowerCase().includes(cleanQuery) ||
        p.brand.toLowerCase().includes(cleanQuery) ||
        p.category.toLowerCase().includes(cleanQuery)
      );
    }) as Product[];

    setFilteredProducts(searchResults);
    setDisplayedProducts(searchResults.slice(0, ITEMS_PER_PAGE));
    setPage(1);
    setLoading(false);
  }, [debouncedQuery]);

  // Load more search results on scroll
  const loadMoreItems = useCallback(() => {
    if (loadingMore) return;
    const nextIndex = page * ITEMS_PER_PAGE;
    if (nextIndex >= filteredProducts.length) return;

    setLoadingMore(true);
    setTimeout(() => {
      const nextBatch = filteredProducts.slice(nextIndex, nextIndex + ITEMS_PER_PAGE);
      setDisplayedProducts((prev) => [...prev, ...nextBatch]);
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 200);
  }, [page, filteredProducts, loadingMore]);

  const handleTagPress = (tag: string) => {
    setQuery(tag);
    Keyboard.dismiss();
  };

  const handleClear = () => {
    setQuery('');
    setDebouncedQuery('');
    inputRef.current?.focus();
  };

  const renderItem = useCallback(({ item }: { item: Product }) => {
    return <ProductCard product={item} />;
  }, []);

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={COLORS.primary} />
      </View>
    );
  };

  const renderHeader = () => {
    if (query.trim().length > 0) return null;

    return (
      <View style={styles.suggestionsContainer}>
        <Text style={styles.suggestionsTitle}>Popular Searches</Text>
        <View style={styles.tagsContainer}>
          {POPULAR_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tag}
              onPress={() => handleTagPress(tag)}
              activeOpacity={0.7}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );
  };

  const renderEmpty = () => {
    if (query.trim().length === 0) return null;

    return (
      <View style={styles.emptyContainer}>
        <Icon name="search-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTextTitle}>No results found</Text>
        <Text style={styles.emptyTextDesc}>
          We couldn't find anything matching "{query}". Double check spelling or search other brands.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Custom Search Header */}
      <View style={[styles.searchHeader, SHADOWS.subtle]}>
        <View style={styles.searchBarContainer}>
          <Icon name="search-outline" size={20} color={COLORS.textSecondary} style={styles.searchIcon} />
          <TextInput
            ref={inputRef}
            style={styles.searchInput}
            placeholder="Search name, brand, or category..."
            placeholderTextColor={COLORS.textLight}
            value={query}
            onChangeText={setQuery}
            autoFocus={true}
            returnKeyType="search"
          />
          {query.length > 0 && (
            <TouchableOpacity onPress={handleClear} style={styles.clearButton}>
              <Icon name="close-circle" size={18} color={COLORS.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
        </View>
      ) : (
        <FlatList
          data={displayedProducts}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          onEndReached={loadMoreItems}
          onEndReachedThreshold={0.5}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          
          // Performance optimizations
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  searchHeader: {
    height: 64,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    paddingHorizontal: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
  },
  searchBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.cardBackground,
    borderRadius: BORDER_RADIUS.lg, // 12px
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 44,
    paddingHorizontal: SPACING.md,
  },
  searchIcon: {
    marginRight: SPACING.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textPrimary,
    paddingVertical: 0, // fix for Android inner padding
  },
  clearButton: {
    padding: SPACING.xs,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: SPACING.xs,
    paddingBottom: SPACING.lg,
  },
  suggestionsContainer: {
    padding: SPACING.md,
    paddingTop: SPACING.lg,
  },
  suggestionsTitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -SPACING.xs,
  },
  tag: {
    backgroundColor: COLORS.cardBackground,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.round,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm - 2,
    margin: SPACING.xs,
  },
  tagText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
  },
  footerLoader: {
    paddingVertical: SPACING.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyContainer: {
    padding: SPACING.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 40,
  },
  emptyTextTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyTextDesc: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
});
