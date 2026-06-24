import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  StatusBar,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useIsFocused } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import CartItemComponent from '../components/CartItem';
import { COLORS, SPACING, TYPOGRAPHY, SHADOWS, BORDER_RADIUS } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { showAlert } from '../components/CustomAlert';

export const CartScreen = () => {
  const navigation = useNavigation();
  const isFocused = useIsFocused();
  
  // Use the context functions (increaseQuantity and decreaseQuantity)
  const { 
    cartItems, 
    increaseQuantity, 
    decreaseQuantity, 
    removeFromCart, 
    totalPrice, 
    totalItems, 
    totalQuantity, 
    clearCart 
  } = useCart();

  const [buyerProfile, setBuyerProfile] = useState(null);

  // Load buyer profile whenever CartScreen comes into focus
  useEffect(() => {
    const loadBuyerProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@buyer_profile');
        if (storedProfile) {
          setBuyerProfile(JSON.parse(storedProfile));
        } else {
          setBuyerProfile(null);
        }
      } catch (err) {
        console.error('Failed to load buyer profile in Cart', err);
      }
    };

    if (isFocused) {
      loadBuyerProfile();
    }
  }, [isFocused]);

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      showAlert('Empty Cart', 'Please add products to your cart before proceeding.');
      return;
    }

    if (buyerProfile) {
      navigation.navigate('OrderRequest');
    } else {
      showAlert(
        'Registration Required',
        'You need to register your business details to request wholesale orders.',
        [
          {
            text: 'Register Now',
            onPress: () => navigation.navigate('BuyerInformation', { redirectTo: 'OrderRequest' })
          },
          {
            text: 'Cancel',
            style: 'cancel'
          }
        ]
      );
    }
  };

  const renderItem = ({ item }) => (
    <CartItemComponent 
      item={item} 
      onUpdateQuantity={(id, qty) => {
        // Map quantity modifications to context handlers
        const diff = qty - item.quantity;
        if (diff > 0) {
          increaseQuantity(id);
        } else if (diff < 0) {
          decreaseQuantity(id);
        }
      }} 
      onRemove={removeFromCart} 
    />
  );

  const renderHeader = () => {
    if (cartItems.length === 0) return null;
    return (
      <View style={styles.listHeader}>
        <Text style={styles.listTitle}>Wholesale Cart List ({cartItems.length} Products)</Text>
        <TouchableOpacity onPress={clearCart}>
          <Text style={styles.clearAllText}>Clear All</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderFooter = () => {
    if (cartItems.length === 0) return null;

    return (
      <View style={styles.footerContainer}>
        {buyerProfile && (
          <View style={styles.buyerInfoBadge}>
            <Icon name="business" size={16} color={COLORS.primary} />
            <Text style={styles.buyerInfoText} numberOfLines={1}>
              Buying for: <Text style={{ fontWeight: 'bold' }}>{buyerProfile.businessName}</Text> ({buyerProfile.ownerName})
            </Text>
          </View>
        )}

        {/* Wholesale pricing and quantity summary details */}
        <View style={[styles.summaryCard, SHADOWS.subtle]}>
          <Text style={styles.summaryTitle}>Wholesale Order Estimation</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Products (Unique)</Text>
            <Text style={styles.summaryValue}>{totalItems}</Text>
          </View>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Quantity (Units)</Text>
            <Text style={styles.summaryValue}>{totalQuantity}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.summaryRow}>
            <Text style={styles.totalLabel}>Grand Total (Est.)</Text>
            <Text style={styles.totalValue}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.checkoutButton, SHADOWS.medium]}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Icon name="arrow-forward-circle" size={22} color={COLORS.white} style={styles.checkoutIcon} />
          <Text style={styles.checkoutButtonText}>Proceed to Order Request</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderEmpty = () => {
    return (
      <View style={styles.emptyContainer}>
        <View style={styles.emptyIconCircle}>
          <Icon name="cart-outline" size={54} color={COLORS.primary} />
        </View>
        <Text style={styles.emptyTitle}>Your Cart Is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Explore the catalog and select bulk quantities to request a wholesale quotation.
        </Text>
        <TouchableOpacity 
          style={styles.shopButton}
          onPress={() => navigation.navigate('Home')}
          activeOpacity={0.8}
        >
          <Text style={styles.shopButtonText}>Continue Shopping</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Wholesale Cart" showBackButton={true} showCart={false} />

      <FlatList
        data={cartItems}
        renderItem={renderItem}
        keyExtractor={(item) => item.product.id}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={renderHeader}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={renderEmpty}
        showsVerticalScrollIndicator={false}
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
    padding: SPACING.md,
    flexGrow: 1,
  },
  listHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  listTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  clearAllText: {
    fontSize: 13,
    color: COLORS.brandRed,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  footerContainer: {
    marginTop: SPACING.sm,
  },
  buyerInfoBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    marginBottom: SPACING.md,
  },
  buyerInfoText: {
    fontSize: 12,
    color: COLORS.textPrimary,
    marginLeft: 6,
    flex: 1,
  },
  summaryCard: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 16px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: SPACING.md,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: 6,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: SPACING.sm,
  },
  summaryLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.textPrimary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: SPACING.xs,
  },
  totalLabel: {
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
  },
  totalValue: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  checkoutButton: {
    backgroundColor: COLORS.primary, // Navy Blue
    borderRadius: BORDER_RADIUS.md,
    height: 50,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.lg,
  },
  checkoutIcon: {
    marginRight: 6,
  },
  checkoutButtonText: {
    color: COLORS.white,
    fontSize: 15,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
    marginTop: 60,
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: 'rgba(10, 30, 106, 0.08)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginBottom: SPACING.xs,
  },
  emptySubtitle: {
    fontSize: 13,
    color: COLORS.textSecondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.sm,
  },
  shopButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.md,
    paddingHorizontal: SPACING.xl,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  shopButtonText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 14,
  },
});

export default CartScreen;
