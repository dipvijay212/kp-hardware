import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { View, StyleSheet, FlatList, ActivityIndicator, Text, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, RouteProp } from '@react-navigation/native';
import { Header } from '../components/Header';
import { ProductCard } from '../components/ProductCard';
import { COLORS, SPACING, TYPOGRAPHY } from '../theme/theme';
import productsData from '../data/products.json';
import { Product } from '../types';

type RouteParams = {
  ProductList: {
    category: string;
  };
};

const ITEMS_PER_PAGE = 20;

export const ProductListScreen: React.FC = () => {
  const route = useRoute<RouteProp<RouteParams, 'ProductList'>>();
  const { category } = route.params;

  const [displayedProducts, setDisplayedProducts] = useState<Product[]>([]);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  // Filter products by category (memoized)
  const filteredProducts = useMemo(() => {
    return productsData.filter((p) => p.category === category) as Product[];
  }, [category]);

  // Initial load
  useEffect(() => {
    setPage(1);
    setDisplayedProducts(filteredProducts.slice(0, ITEMS_PER_PAGE));
  }, [filteredProducts]);

  // Load next page of products
  const loadMoreItems = useCallback(() => {
    if (loadingMore) return;
    
    const nextIndex = page * ITEMS_PER_PAGE;
    if (nextIndex >= filteredProducts.length) return; // All products loaded

    setLoadingMore(true);
    
    // Simulate minor network delay (300ms) for high fidelity lazy loading effect
    setTimeout(() => {
      const nextBatch = filteredProducts.slice(nextIndex, nextIndex + ITEMS_PER_PAGE);
      setDisplayedProducts((prev) => [...prev, ...nextBatch]);
      setPage((prev) => prev + 1);
      setLoadingMore(false);
    }, 300);
  }, [page, filteredProducts, loadingMore]);

  // Render product item
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

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyText}>No products found in this category.</Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title={category} showBackButton={true} showCart={true} />

      <FlatList
        data={displayedProducts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        numColumns={2}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMoreItems}
        onEndReachedThreshold={0.5}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
        
        // Performance optimizations for 3000+ products lists
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={5}
        removeClippedSubviews={true}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  listContent: {
    padding: SPACING.xs,
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
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.textSecondary,
    textAlign: 'center',
  },
});
