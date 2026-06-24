import React, { useState, useEffect, useMemo } from 'react';
import { 
  View, 
  StyleSheet, 
  FlatList, 
  Text, 
  StatusBar, 
  RefreshControl, 
  TouchableOpacity, 
  Image, 
  Animated,
  Dimensions
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import SearchBar from '../components/SearchBar';
import CategoryFilter from '../components/CategoryFilter';
import ProductCard from '../components/ProductCard';
import { getProducts, getCategories } from '../services/productService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { useCart } from '../context/CartContext';

const { width } = Dimensions.get('window');
const GRID_GAP = 10;
const SCREEN_PADDING = 16;
const CARD_WIDTH = (width - SCREEN_PADDING * 2 - GRID_GAP) / 2;

export const HomeScreen = () => {
  const navigation = useNavigation();
  const { totalItems } = useCart();
  
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState([]);
  // Pulsing animation value for skeleton loaders
  const [pulseAnim] = useState(new Animated.Value(0.4));

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 0.8,
          duration: 900,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 0.4,
          duration: 900,
          useNativeDriver: true,
        })
      ])
    ).start();
  }, [pulseAnim]);

  // Fetch products from Firestore
  const fetchAllProducts = async (isRefreshing = false) => {
    try {
      if (isRefreshing) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      
      // Fetch up to 100 products for display/filtering
      const { products: fetchedProducts } = await getProducts(100, null);
      setProducts(fetchedProducts);
      
      // Fetch dynamic categories
      const fetchedCategories = await getCategories();
      setCategories(fetchedCategories);
    } catch (error) {
      console.error('Error in HomeScreen load: ', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllProducts();
  }, []);

  // Filter products based on search query & category selection (memoized)
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase().trim());
      
      let categoryMatchText = selectedCategory.toLowerCase();
      if (categoryMatchText === 'painting') {
        categoryMatchText = 'paint'; // Align with schema data
      }
      
      const matchesCategory = selectedCategory === 'All' || 
        product.category?.toLowerCase().includes(categoryMatchText);

      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory]);

  const renderProductItem = ({ item }) => (
    <View style={styles.cardContainer}>
      <ProductCard product={item} />
    </View>
  );

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All');
  };

  // Render a modern, CSS-based Empty State with Retry button
  const renderEmpty = () => {
    if (loading) return null;
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.illustrationCircle}>
          <Icon name="search-outline" size={44} color={COLORS.primary} />
          <View style={styles.smallQuestionMark}>
            <Text style={styles.questionText}>?</Text>
          </View>
        </View>
        <Text style={styles.emptyTitle}>No Products Found</Text>
        <Text style={styles.emptySubtitle}>
          We couldn't find any hardware products matching your current query or category filter.
        </Text>
        <TouchableOpacity 
          style={styles.retryButton} 
          onPress={handleResetFilters}
          activeOpacity={0.8}
        >
          <Text style={styles.retryButtonText}>Clear & Show All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  // Render Skeleton cards layout during loading
  const renderSkeletons = () => {
    const skeletonArray = [1, 2, 3, 4];
    return (
      <FlatList
        data={skeletonArray}
        keyExtractor={(item) => item.toString()}
        numColumns={2}
        columnWrapperStyle={styles.rowStyle}
        contentContainerStyle={styles.listContent}
        renderItem={() => (
          <Animated.View style={[styles.skeletonCard, { opacity: pulseAnim }]}>
            <View style={styles.skeletonImage} />
            <View style={styles.skeletonInfo}>
              <View style={styles.skeletonBadge} />
              <View style={styles.skeletonTitle} />
              <View style={styles.skeletonBrand} />
              <View style={styles.skeletonFooter}>
                <View style={styles.skeletonPrice} />
                <View style={styles.skeletonStock} />
              </View>
            </View>
          </Animated.View>
        )}
      />
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Premium Header Layout */}
      <View style={styles.header}>
        <TouchableOpacity 
          activeOpacity={0.8} 
          onPress={() => {
            try {
              navigation.navigate('FirebaseTest');
            } catch (e) {
              console.log('FirebaseTest screen not registered', e);
            }
          }}
        >
          <Image 
            source={require('../assets/logo.png')} 
            style={styles.logo} 
            resizeMode="contain" 
          />
        </TouchableOpacity>
        
        <View style={styles.headerRight}>
          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Profile')}
          >
            <Icon name="storefront-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('OrderHistory')}
          >
            <Icon name="receipt-outline" size={24} color={COLORS.primary} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Icon name="notifications-outline" size={24} color={COLORS.primary} />
            <View style={styles.notificationDot} />
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.iconButton} 
            activeOpacity={0.7}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            onPress={() => navigation.navigate('Cart')}
          >
            <Icon name="cart-outline" size={24} color={COLORS.primary} />
            {totalItems > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {totalItems > 99 ? '99+' : totalItems}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.content}>
        {/* Search Bar at the top */}
        <SearchBar value={searchQuery} onChangeText={setSearchQuery} />

        {/* Category Filter Chips */}
        <CategoryFilter
          categories={categories}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
        {loading ? (
          renderSkeletons()
        ) : (
          <FlatList
            data={filteredProducts}
            renderItem={renderProductItem}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.rowStyle}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            ListEmptyComponent={renderEmpty}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={() => fetchAllProducts(true)}
                colors={[COLORS.primary]}
              />
            }
            
            // FlatList Optimizations for large datasets
            initialNumToRender={8}
            maxToRenderPerBatch={8}
            windowSize={5}
            removeClippedSubviews={true}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  logo: {
    width: 100,
    height: 40,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconButton: {
    padding: 6,
    marginLeft: 8,
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
  },
  notificationDot: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.danger,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    backgroundColor: COLORS.danger, // Red badge
    borderRadius: BORDER_RADIUS.round,
    minWidth: 16,
    height: 16,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
  },
  cartBadgeText: {
    fontSize: 8,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.white,
  },
  content: {
    flex: 1,
    paddingHorizontal: SCREEN_PADDING,
    backgroundColor: '#FFFFFF',
  },
  rowStyle: {
    justifyContent: 'space-between',
  },
  cardContainer: {
    width: CARD_WIDTH,
    marginBottom: GRID_GAP,
  },
  listContent: {
    paddingBottom: 40,
    paddingTop: 0,
  },
  // Skeleton styling
  skeletonCard: {
    width: CARD_WIDTH,
    height: 240,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    marginBottom: GRID_GAP,
  },
  skeletonImage: {
    height: 130,
    backgroundColor: '#E2E8F0',
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  skeletonInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  skeletonBadge: {
    width: 60,
    height: 14,
    backgroundColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
  },
  skeletonTitle: {
    width: '90%',
    height: 18,
    backgroundColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 6,
  },
  skeletonBrand: {
    width: '50%',
    height: 12,
    backgroundColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
    marginTop: 4,
  },
  skeletonFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingTop: SPACING.xs,
    marginTop: SPACING.xs,
  },
  skeletonPrice: {
    width: 60,
    height: 20,
    backgroundColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
  },
  skeletonStock: {
    width: 50,
    height: 16,
    backgroundColor: '#E2E8F0',
    borderRadius: BORDER_RADIUS.sm,
  },
  // Empty State styling
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
    paddingHorizontal: SPACING.xl,
  },
  illustrationCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(10, 30, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
    marginBottom: SPACING.md,
  },
  smallQuestionMark: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.white,
  },
  questionText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.lg,
  },
  retryButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: SPACING.lg,
    paddingVertical: 12,
    borderRadius: BORDER_RADIUS.round,
    ...SHADOWS.subtle,
  },
  retryButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.semibold,
    fontSize: 14,
  },
});

export default HomeScreen;
