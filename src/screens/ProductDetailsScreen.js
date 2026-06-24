import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  Text, 
  ScrollView, 
  Image, 
  StatusBar, 
  TouchableOpacity, 
  Linking, 
  Platform,
  Dimensions,
  Share,
  Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Ionicons';
import Header from '../components/Header';
import { COLORS, SPACING, TYPOGRAPHY, BORDER_RADIUS, SHADOWS } from '../theme/theme';
import { useCart } from '../context/CartContext';
import { showAlert } from '../components/CustomAlert';

const { width } = Dimensions.get('window');

// Dealer Contact details
const DEALER_NUMBER = '9913238496';

export const ProductDetailsScreen = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { product } = route.params;
  const [imageError, setImageError] = useState(false);
  
  // Cart Actions Integration
  const { addToCart } = useCart();

  const hasValidImage = product.image && !imageError;

  // Add to Cart Action
  const handleAddToCart = () => {
    addToCart(product, 1);
    showAlert('Added to Cart', `${product.name} has been added to your wholesale cart successfully.`);
  };

  // 1. Call Dealer Handler
  const handleCall = () => {
    const telUrl = `tel:${DEALER_NUMBER}`;
    Linking.canOpenURL(telUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(telUrl);
        } else {
          showAlert('Call Failed', 'Unable to make a phone call.');
        }
      })
      .catch(() => {
        showAlert('Call Failed', 'Unable to make a phone call.');
      });
  };

  // 2. WhatsApp Inquiry Handler
  const handleWhatsApp = () => {
    const formattedPhone = `91${DEALER_NUMBER}`; // India country code prefix
    
    // Custom pre-filled message format
    const message = `Hello KP Hardware,\n\nI am interested in the following product:\n\nProduct Name: ${product.name}\nBrand: ${product.brand || 'N/A'}\nCategory: ${product.category}\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\n\nPlease share availability and more details.\n\nThank you.`;
    
    const waUrl = `whatsapp://send?phone=${formattedPhone}&text=${encodeURIComponent(message)}`;
    const webUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
    
    Linking.canOpenURL(waUrl)
      .then((supported) => {
        if (supported) {
          return Linking.openURL(waUrl);
        } else {
          // If WhatsApp app is not installed, show the requested alert
          showAlert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
        }
      })
      .catch(() => {
        showAlert('WhatsApp Not Installed', 'WhatsApp is not installed on this device.');
      });
  };

  // 3. Share Product Handler
  const handleShare = async () => {
    try {
      const shareMessage = `Check out this product on KP Hardware Catalog:\n\nProduct Name: ${product.name}\nBrand: ${product.brand || 'N/A'}\nCategory: ${product.category}\nPrice: ₹${Number(product.price).toLocaleString('en-IN')}\nDescription: ${product.description || 'Professional-grade hardware equipment.'}`;
      
      await Share.share({
        message: shareMessage,
        title: product.name,
      });
    } catch (error) {
      console.error('Error sharing product details:', error);
    }
  };

  const formattedPrice = Number(product.price || 0).toLocaleString('en-IN');

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar backgroundColor={COLORS.white} barStyle="dark-content" />
      
      {/* Header bar */}
      <Header title="Product Details" showBackButton={true} showCart={true} />

      <View style={styles.contentWrapper}>
        <ScrollView 
          showsVerticalScrollIndicator={false} 
          contentContainerStyle={styles.scrollContent}
        >
          {/* Large Image Banner */}
          <View style={styles.imageContainer}>
            {/* Skeleton/Placeholder Loader */}
            <View style={[StyleSheet.absoluteFillObject, { justifyContent: 'center', alignItems: 'center', opacity: 0.1 }]}>
              <Image
                source={require('../assets/logo.png')}
                style={{ width: 120, height: 60 }}
                resizeMode="contain"
              />
            </View>

            {hasValidImage && (
              <Image
                source={{ uri: product.image }}
                style={styles.image}
                resizeMode="contain"
                onError={() => setImageError(true)}
              />
            )}
          </View>

          {/* Product Details Card Sheet */}
          <View style={styles.detailsContainer}>
            <View style={styles.metaRow}>
              <View style={styles.categoryBadge}>
                <Text style={styles.categoryText}>{product.category}</Text>
              </View>

              <View style={[
                styles.stockBadge,
                product.stock ? styles.inStock : styles.outOfStock
              ]}>
                <Text style={[
                  styles.stockText,
                  product.stock ? styles.inStockText : styles.outOfStockText
                ]}>
                  {product.stock ? 'In Stock' : 'Out of Stock'}
                </Text>
              </View>
            </View>

            <Text style={styles.name}>{product.name}</Text>
            
            <View style={styles.brandRow}>
              <Text style={styles.brandLabel}>Brand:</Text>
              <Text style={styles.brandValue}>{product.brand || 'Genuine KP Product'}</Text>
            </View>

            <View style={styles.divider} />

            {/* Pricing Section */}
            <View style={styles.priceContainer}>
              <Text style={styles.priceLabel}>Catalog Price (Excl. Taxes)</Text>
              <View style={styles.priceRow}>
                <Text style={styles.priceSymbol}>₹</Text>
                <Text style={styles.priceText}>{formattedPrice}</Text>
              </View>
            </View>

            <View style={styles.divider} />

            {/* Description Section */}
            <View style={styles.descriptionSection}>
              <Text style={styles.descriptionHeader}>Product Specifications</Text>
              <Text style={styles.description}>
                {product.description || 'This is a premium-grade hardware utility item sourced directly from authorized manufacturers. Designed for industrial longevity, heavy usage, and strict adherence to build safety guidelines.'}
              </Text>
            </View>
          </View>
        </ScrollView>

        {/* Sticky Bottom Action Buttons */}
        <View style={styles.stickyFooter}>
          {/* Row 1: Add to Cart Button (Primary wholesale flow) */}
          <TouchableOpacity 
            style={styles.addToCartBtn} 
            onPress={handleAddToCart}
            activeOpacity={0.85}
          >
            <Icon name="cart-outline" size={20} color={COLORS.white} style={styles.btnIcon} />
            <Text style={styles.addToCartText}>Add To Cart</Text>
          </TouchableOpacity>

          {/* Row 2: Secondary buttons */}
          <View style={styles.secondaryActionsRow}>
            <TouchableOpacity 
              style={styles.shareBtn} 
              onPress={handleShare}
              activeOpacity={0.8}
            >
              <Icon name="share-social" size={22} color={COLORS.primary} />
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.callBtn]} 
              onPress={handleCall}
              activeOpacity={0.85}
            >
              <Icon name="call" size={18} color={COLORS.white} style={styles.btnIcon} />
              <Text style={styles.btnText}>Call Dealer</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={[styles.actionBtn, styles.whatsappBtn]} 
              onPress={handleWhatsApp}
              activeOpacity={0.85}
            >
              <Icon name="logo-whatsapp" size={20} color={COLORS.white} style={styles.btnIcon} />
              <Text style={styles.btnText}>WhatsApp</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  contentWrapper: {
    flex: 1,
    position: 'relative',
  },
  scrollContent: {
    paddingBottom: 155, // Extra space at bottom to scroll past the double-row sticky footer
  },
  imageContainer: {
    width: width,
    height: 240, // Reduced by 25% from 320px
    backgroundColor: COLORS.secondary,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  detailsContainer: {
    padding: 16,
    paddingTop: 16,
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: -20, // overlap image slightly more
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  categoryBadge: {
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginRight: 8,
  },
  categoryText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  stockBadge: {
    borderRadius: BORDER_RADIUS.sm,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  inStock: {
    backgroundColor: 'rgba(0, 200, 83, 0.15)', // Accent Green with transparency
  },
  outOfStock: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  stockText: {
    fontSize: 11,
    fontWeight: TYPOGRAPHY.weights.bold,
  },
  inStockText: {
    color: COLORS.accent,
  },
  outOfStockText: {
    color: COLORS.danger,
  },
  name: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.textPrimary,
    lineHeight: 26,
    marginBottom: 4,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 0,
  },
  brandLabel: {
    fontSize: 13,
    color: COLORS.textSecondary,
  },
  brandValue: {
    fontSize: 13,
    fontWeight: TYPOGRAPHY.weights.semibold,
    color: COLORS.primary,
    marginLeft: 4,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border,
    marginVertical: 12,
  },
  priceContainer: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: BORDER_RADIUS.md,
  },
  priceLabel: {
    fontSize: 12,
    color: COLORS.textSecondary,
    fontWeight: TYPOGRAPHY.weights.medium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 4,
  },
  priceSymbol: {
    fontSize: 20,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginRight: 2,
  },
  priceText: {
    fontSize: 26,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
  },
  descriptionSection: {
    marginTop: 0,
  },
  descriptionHeader: {
    fontSize: 16,
    fontWeight: TYPOGRAPHY.weights.bold,
    color: COLORS.primary,
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 22,
  },
  // Sticky Footer styling
  stickyFooter: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: COLORS.white,
    borderTopWidth: 1,
    borderTopColor: COLORS.border,
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
    flexDirection: 'column',
    alignItems: 'stretch',
    // Soft shadow for sticky float
    ...Platform.select({
      ios: {
        shadowColor: COLORS.shadowColor,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: {
        elevation: 10,
      },
    }),
  },
  addToCartBtn: {
    backgroundColor: COLORS.primary, // Navy Blue
    height: 46,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs + 2,
    ...SHADOWS.subtle,
  },
  addToCartText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 14,
  },
  secondaryActionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  shareBtn: {
    width: 46,
    height: 44,
    borderRadius: BORDER_RADIUS.md, // Rounded buttons matching theme
    backgroundColor: COLORS.secondary,
    borderWidth: 1,
    borderColor: COLORS.border,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.subtle,
  },
  actionBtn: {
    flex: 1,
    height: 44,
    borderRadius: BORDER_RADIUS.md,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 4,
    ...SHADOWS.subtle,
  },
  callBtn: {
    backgroundColor: COLORS.primary, // Navy Blue (#0A1E6A)
  },
  whatsappBtn: {
    flex: 1.1, // Give slightly more space to WhatsApp text
    backgroundColor: COLORS.accent, // Vibrant Green Accent (#00C853)
  },
  btnIcon: {
    marginRight: 6,
  },
  btnText: {
    color: COLORS.white,
    fontWeight: TYPOGRAPHY.weights.bold,
    fontSize: 13,
  },
});

export default ProductDetailsScreen;
