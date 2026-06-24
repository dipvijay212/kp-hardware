import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  FlatList, 
  TouchableOpacity, 
  ScrollView, 
  ActivityIndicator, 
  Alert,
  StatusBar,
  Linking
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Header from '../components/Header';
import { createOrder } from '../services/orderService';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { showAlert } from '../components/CustomAlert';

export const OrderRequestScreen = () => {
  const navigation = useNavigation();
  const { cartItems, totalPrice, totalItems, clearCart } = useCart();
  
  const [buyerProfile, setBuyerProfile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadBuyerProfile = async () => {
      try {
        const storedProfile = await AsyncStorage.getItem('@buyer_profile');
        if (storedProfile) {
          setBuyerProfile(JSON.parse(storedProfile));
        } else {
          // If profile is missing (unexpected state), redirect to registration
          showAlert('Details Missing', 'Please fill in your business registration details first.');
          navigation.navigate('BuyerInformation', { redirectTo: 'OrderRequest' });
        }
      } catch (err) {
        console.error('Error loading buyer profile', err);
      }
    };
    loadBuyerProfile();
  }, [navigation]);

  const handleSubmitOrder = async () => {
    if (!buyerProfile) return;
    if (cartItems.length === 0) {
      showAlert('Empty Order', 'Please add products to your cart before submitting.');
      return;
    }

    setSubmitting(true);
    try {
      // 1. Save Order To Firestore & Generate Order Number
      const result = await createOrder(buyerProfile, cartItems, totalPrice, totalItems);
      
      console.log("Order Saved");
      
      // Calculate Total Quantity
      const totalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

      // 2. Create WhatsApp Message
      let productsList = cartItems.map(item => `• ${item.product.name} × ${item.quantity}`).join('\n\n');

      const message = `🏢 KP Hardware - Wholesale Order Request\n━━━━━━━━━━━━━━━━━━━━\n\n📋 Order Details\n\nOrder No: ${result.orderNumber}\n\nBusiness Name: ${buyerProfile.businessName}\n\nOwner Name: ${buyerProfile.ownerName}\n\nMobile: ${buyerProfile.mobileNumber}\n━━━━━━━━━━━━━━━━━━━━\n\n🛒 Products\n\n${productsList}\n━━━━━━━━━━━━━━━━━━━━\n\n📊 Summary\n\nTotal Products: ${totalItems}\n\nTotal Quantity: ${totalQuantity}\n━━━━━━━━━━━━━━━━━━━━\n\nPlease contact the buyer regarding pricing, stock availability, and delivery details.`;

      const whatsappUrl = `https://wa.me/919913238496?text=${encodeURIComponent(message)}`;

      console.log("Opening WhatsApp");
      console.log("WhatsApp URL:", whatsappUrl);

      // 3. Open WhatsApp
      try {
        // Platform Compatibility Check
        await Linking.canOpenURL(whatsappUrl);
        
        // Execute BEFORE navigation
        await Linking.openURL(whatsappUrl);
        
        console.log("WhatsApp Opened Successfully");
      } catch (error) {
        console.error("WhatsApp Error:", error);
        console.error("Error Message:", error.message);
        showAlert('WhatsApp Error', 'WhatsApp is not installed on this device.');
      }
      
      // 4. Navigate To Success Screen
      navigation.replace('OrderSuccess', {
        orderNumber: result.orderNumber,
        buyerProfile: buyerProfile,
        totalItems,
        totalPrice
      });

      // 5. Clear Cart
      clearCart();

    } catch (error) {
      showAlert('Order Failed', error.message || 'Could not submit wholesale order. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const renderProductRow = ({ item }) => {
    const subtotal = item.product.price * item.quantity;
    return (
      <View style={styles.productRow}>
        <View style={styles.productInfo}>
          <Text style={styles.productName} numberOfLines={1}>{item.product.name}</Text>
          <Text style={styles.productBrand}>{item.product.brand || 'KP Hardware'}</Text>
        </View>
        <Text style={styles.productQty}>x{item.quantity}</Text>
        <Text style={styles.productTotal}>₹{subtotal.toLocaleString('en-IN')}</Text>
      </View>
    );
  };

  if (!buyerProfile) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      <Header title="Order Request Summary" showBackButton={true} showCart={false} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Buyer info segment */}
        <View style={[styles.card, SHADOWS.subtle]}>
          <View style={styles.cardHeader}>
            <Icon name="business-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Buyer Information</Text>
            <TouchableOpacity 
              style={styles.editBtn} 
              onPress={() => navigation.navigate('BuyerInformation', { redirectTo: 'OrderRequest' })}
            >
              <Text style={styles.editBtnText}>Edit</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Business Name</Text>
            <Text style={styles.infoValue}>{buyerProfile.businessName}</Text>
          </View>

          <View style={styles.infoRow}>
            <View style={[styles.infoField, { flex: 0.5 }]}>
              <Text style={styles.infoLabel}>Owner Name</Text>
              <Text style={styles.infoValue}>{buyerProfile.ownerName}</Text>
            </View>
            <View style={[styles.infoField, { flex: 0.5 }]}>
              <Text style={styles.infoLabel}>Mobile Number</Text>
              <Text style={styles.infoValue}>{buyerProfile.mobileNumber}</Text>
            </View>
          </View>

          {buyerProfile.gstNumber ? (
            <View style={styles.infoField}>
              <Text style={styles.infoLabel}>GST Number</Text>
              <Text style={styles.infoValue}>{buyerProfile.gstNumber}</Text>
            </View>
          ) : null}

          <View style={styles.infoField}>
            <Text style={styles.infoLabel}>Delivery Address</Text>
            <Text style={styles.infoValue}>{buyerProfile.address}</Text>
          </View>
        </View>

        {/* Cart items list card */}
        <View style={[styles.card, SHADOWS.subtle]}>
          <View style={styles.cardHeader}>
            <Icon name="list-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Order Items</Text>
          </View>

          <FlatList
            data={cartItems}
            renderItem={renderProductRow}
            keyExtractor={(item) => item.product.id}
            scrollEnabled={false}
            ItemSeparatorComponent={() => <View style={styles.rowDivider} />}
          />
        </View>

        {/* Pricing Summary card */}
        <View style={[styles.card, SHADOWS.subtle]}>
          <View style={styles.cardHeader}>
            <Icon name="calculator-outline" size={20} color={COLORS.primary} />
            <Text style={styles.cardTitle}>Estimated Total</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Unique Items</Text>
            <Text style={styles.summaryValue}>{cartItems.length}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Total Quantity Units</Text>
            <Text style={styles.summaryValue}>{cartItems.reduce((sum, item) => sum + item.quantity, 0)}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryLabel}>Subtotal Price</Text>
            <Text style={styles.summaryValue}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.rowDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.grandLabel}>Grand Estimate Amount</Text>
            <Text style={styles.grandValue}>₹{totalPrice.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Submit Order Request */}
        <TouchableOpacity 
          style={[styles.submitBtn, submitting && styles.submitBtnDisabled]} 
          onPress={handleSubmitOrder}
          disabled={submitting}
          activeOpacity={0.8}
        >
          {submitting ? (
            <ActivityIndicator size="small" color={COLORS.white} />
          ) : (
            <>
              <Icon name="cloud-upload-outline" size={22} color={COLORS.white} style={styles.submitIcon} />
              <Text style={styles.submitText}>Submit Order Request</Text>
            </>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.white,
  },
  scrollContent: {
    padding: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: BORDER_RADIUS.lg, // 16px
    borderWidth: 1,
    borderColor: COLORS.border,
    padding: SPACING.md,
    marginBottom: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    paddingBottom: SPACING.xs + 2,
    marginBottom: SPACING.sm,
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginLeft: 6,
    flex: 1,
  },
  editBtn: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    backgroundColor: COLORS.secondary,
    borderRadius: BORDER_RADIUS.sm,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  editBtnText: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  infoField: {
    marginBottom: SPACING.xs + 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    fontSize: 10,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.bold,
    textTransform: 'uppercase',
  },
  infoValue: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.medium,
    marginTop: 2,
  },
  // Order list rows
  productRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    fontSize: 14,
    color: COLORS.textPrimary,
    fontWeight: TYPOGRAPHY.weights.semibold,
  },
  productBrand: {
    fontSize: 11,
    color: COLORS.textSecondary,
    marginTop: 1,
  },
  productQty: {
    fontSize: 14,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.semibold,
    paddingHorizontal: SPACING.md,
  },
  productTotal: {
    fontSize: 14,
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.weights.bold,
    minWidth: 70,
    textAlign: 'right',
  },
  rowDivider: {
    height: 1,
    backgroundColor: COLORS.border,
  },
  // Pricing summaries
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
  grandLabel: {
    fontSize: 14,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    marginTop: SPACING.xs,
  },
  grandValue: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  // Action trigger button
  submitBtn: {
    backgroundColor: COLORS.primary, // Navy Blue
    height: 50,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
    marginTop: SPACING.sm,
  },
  submitBtnDisabled: {
    opacity: 0.6,
  },
  submitIcon: {
    marginRight: 6,
  },
  submitText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 15,
  },
});

export default OrderRequestScreen;
