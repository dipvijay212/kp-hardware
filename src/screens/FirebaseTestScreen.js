import React, { useState, useEffect, useCallback } from 'react';
import { View, StyleSheet, Text, FlatList, ActivityIndicator, TouchableOpacity, Alert, StatusBar } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Ionicons';
import { Header } from '../components/Header';
import { getProducts, addProduct } from '../services/productService';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { showAlert } from '../components/CustomAlert';

const LIMIT_PER_PAGE = 20;

export const FirebaseTestScreen = () => {
  const [products, setProducts] = useState([]);
  const [lastVisibleDoc, setLastVisibleDoc] = useState(null);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState(null);

  // Fetch initial list of products
  const fetchProducts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setLoading(true);
        setError(null);
      }
      
      const { products: fetchedProducts, lastDoc } = await getProducts(LIMIT_PER_PAGE, null);
      console.log('Successfully read Firestore products:', fetchedProducts);
      setProducts(fetchedProducts);
      setLastVisibleDoc(lastDoc);
    } catch (err) {
      setError(err.message || 'Failed to connect to Firestore');
      showAlert('Error', err.message || 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Fetch next page of products (infinite scroll cursor pagination)
  const fetchMoreProducts = async () => {
    if (loadingMore || !lastVisibleDoc) return;

    setLoadingMore(true);
    try {
      const { products: fetchedProducts, lastDoc } = await getProducts(LIMIT_PER_PAGE, lastVisibleDoc);
      console.log('Successfully read more Firestore products:', fetchedProducts);
      
      if (fetchedProducts.length > 0) {
        setProducts((prev) => [...prev, ...fetchedProducts]);
        setLastVisibleDoc(lastDoc);
      }
    } catch (err) {
      console.error('Error fetching more products', err);
    } finally {
      setLoadingMore(false);
    }
  };

  // Add a sample seed product to verify connection writes
  const handleAddSample = async () => {
    const sampleProduct = {
      name: `Bosch Impact Drill ${Math.floor(Math.random() * 1000)}`,
      brand: 'Bosch',
      category: 'Tools',
      price: 4500 + Math.floor(Math.random() * 2000),
      description: 'Heavy duty drill machine built for industrial use',
      image: 'https://images.unsplash.com/photo-1504148455328-c376907d081c?auto=format&fit=crop&w=600&q=80',
      stock: true
    };

    try {
      setLoading(true);
      const createdId = await addProduct(sampleProduct);
      showAlert('Success', `Sample product created with ID: ${createdId}`);
      // Refresh list
      await fetchProducts(true);
    } catch (err) {
      showAlert('Write Failed', err.message || 'Could not write to database');
    } finally {
      setLoading(false);
    }
  };

  const renderProductItem = useCallback(({ item }) => {
    return (
      <View style={[styles.productCard, SHADOWS.subtle]}>
        <View style={styles.cardHeader}>
          <Text style={styles.productName}>{item.name}</Text>
          <Text style={styles.productCategory}>{item.category}</Text>
        </View>
        
        <View style={styles.cardFooter}>
          <Text style={styles.productBrand}>Brand: {item.brand || 'N/A'}</Text>
          <Text style={styles.productPrice}>₹{item.price.toLocaleString('en-IN')}</Text>
        </View>
      </View>
    );
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
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <Icon name="cloud-offline-outline" size={48} color={COLORS.textLight} />
        <Text style={styles.emptyTitle}>No Products Found</Text>
        <Text style={styles.emptySubtitle}>
          The products collection in Firestore is currently empty. Tap "Seed Sample" to add your first product.
        </Text>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Firebase Connection Test" showBackButton={true} showCart={false} />

      {/* Connection Actions Header */}
      <View style={styles.actionsBar}>
        <TouchableOpacity style={styles.actionButton} onPress={() => fetchProducts(true)}>
          <Icon name="refresh-outline" size={18} color={COLORS.white} style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Sync Data</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.actionButton, { backgroundColor: COLORS.accent }]} onPress={handleAddSample}>
          <Icon name="cloud-upload-outline" size={18} color={COLORS.white} style={styles.actionIcon} />
          <Text style={styles.actionButtonText}>Seed Sample</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Connecting to Firestore...</Text>
        </View>
      ) : error ? (
        <View style={styles.centerContainer}>
          <Icon name="alert-circle-outline" size={50} color={COLORS.secondary} />
          <Text style={styles.errorText}>Connection Error</Text>
          <Text style={styles.errorSubtext}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchProducts(true)}>
            <Text style={styles.retryButtonText}>Retry Sync</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductItem}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onEndReached={fetchMoreProducts}
          onEndReachedThreshold={0.5}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          
          // FlatList Optimizations for 3000+ items
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
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
  actionsBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    padding: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.cardBackground,
  },
  actionButton: {
    flex: 0.48,
    height: 40,
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  actionIcon: {
    marginRight: 6,
  },
  actionButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.textSecondary,
    fontSize: TYPOGRAPHY.sizes.sm,
  },
  errorText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary,
    marginTop: SPACING.md,
  },
  errorSubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    marginTop: SPACING.xs,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  listContent: {
    padding: SPACING.md,
  },
  productCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 12px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: SPACING.sm,
  },
  productName: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.sm,
  },
  productCategory: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    backgroundColor: COLORS.cardBackground,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.sm,
  },
  productBrand: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
  },
  productPrice: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.secondary,
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
    marginTop: 60,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: SPACING.md,
  },
});
export default FirebaseTestScreen;
